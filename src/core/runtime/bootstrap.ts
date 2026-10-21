import { BootstrapOptions, SystemHealthReport } from './types';
import { DependencyContainer, IDependencyContainer } from '../di/container';
import { ConfigurationManager } from '../config/config.service';
import { EnvironmentCredentialProvider } from '../config/env-loader';
import { StructuredLogger } from '../logging/logger.service';
import { TypedEventBus } from '../events/event-bus.service';
import { ValidatorService } from '../validation/validator.service';
import { ModuleRegistry } from '../modules/module-registry';
import { ModuleLoader, DependentModule } from './module-loader';
import { SystemLifecycleManager } from './lifecycle';
import { IConfigurationManager } from '../interfaces/config.interface';
import { ICredentialProvider } from '../interfaces/credential.interface';
import { ILogger } from '../interfaces/logger.interface';
import { IEventBus } from '../interfaces/event-bus.interface';
import { CredentialException } from '../errors/domain.errors';

export class ApplicationBootstrap {
  private readonly container: IDependencyContainer;
  private readonly logger: ILogger;
  private readonly config: IConfigurationManager;
  private readonly eventBus: IEventBus;
  private readonly lifecycle: SystemLifecycleManager;
  private readonly credentialProvider: ICredentialProvider;
  private readonly validator: ValidatorService;
  private readonly moduleRegistry: ModuleRegistry;
  private readonly moduleLoader: ModuleLoader;
  private isBooted = false;

  constructor(private readonly options: BootstrapOptions = {}) {
    this.container = new DependencyContainer();
    this.logger = new StructuredLogger('ApplicationBootstrap');
    this.config = new ConfigurationManager(options.customEnv);
    this.eventBus = new TypedEventBus(this.logger);
    this.lifecycle = new SystemLifecycleManager(this.logger, this.eventBus);
    this.credentialProvider = new EnvironmentCredentialProvider();
    this.validator = new ValidatorService();
    this.moduleRegistry = new ModuleRegistry(this.logger);
    this.moduleLoader = new ModuleLoader(this.container, this.moduleRegistry, this.logger);

    this.registerCoreBindings();
  }

  getContainer(): IDependencyContainer {
    return this.container;
  }

  getLogger(): ILogger {
    return this.logger;
  }

  getConfig(): IConfigurationManager {
    return this.config;
  }

  getEventBus(): IEventBus {
    return this.eventBus;
  }

  getLifecycle(): SystemLifecycleManager {
    return this.lifecycle;
  }

  getModuleLoader(): ModuleLoader {
    return this.moduleLoader;
  }

  getModuleRegistry(): ModuleRegistry {
    return this.moduleRegistry;
  }

  registerModule(module: DependentModule): void {
    this.moduleLoader.registerModule(module);
  }

  async boot(): Promise<SystemHealthReport> {
    if (this.isBooted) {
      return this.getHealthReport();
    }

    this.logger.info('[ApplicationBootstrap] Initializing Core Runtime Bootstrap...');

    // 1. Transition: BOOTING -> VALIDATING_ENVIRONMENT
    this.lifecycle.transitionTo('VALIDATING_ENVIRONMENT', 'Checking core secrets and configuration');
    this.validateCoreEnvironment();

    // 2. Transition: VALIDATING_ENVIRONMENT -> VALIDATING_CREDENTIALS
    this.lifecycle.transitionTo('VALIDATING_CREDENTIALS', 'Probing platform credentials');
    const { googleReady, metaReady, tiktokReady } = this.probePlatformCredentials();

    // 3. Determine Healthy vs Degraded
    const allPlatformsReady = googleReady && metaReady && tiktokReady;
    const targetState = allPlatformsReady ? 'RUNNING_HEALTHY' : 'RUNNING_DEGRADED';
    const reason = allPlatformsReady
      ? 'All direct platform credentials verified'
      : `Partial credentials active (Google: ${googleReady}, Meta: ${metaReady}, TikTok: ${tiktokReady})`;

    this.lifecycle.transitionTo(targetState, reason);

    // 4. Initialize Registered Modules
    await this.moduleLoader.loadAndInitializeAll();

    // 5. Register Module Teardown Hook
    this.lifecycle.addShutdownHook('ModuleTeardown', async () => {
      await this.moduleLoader.teardownAll();
    });

    // 6. Signal Handling
    if (this.options.enableSignalHandlers) {
      this.setupSignalHandlers();
    }

    // 7. Publish System Ready Event
    await this.eventBus.publish('system.ready', {
      state: this.lifecycle.getState(),
      uptimeSeconds: this.lifecycle.getUptimeSeconds(),
      timestamp: new Date(),
    });

    this.isBooted = true;
    this.logger.info(`[ApplicationBootstrap] Core Runtime is ONLINE [${this.lifecycle.getState()}]`);

    return this.getHealthReport();
  }

  async shutdown(): Promise<void> {
    const timeout = this.options.shutdownTimeoutMs || 10000;
    this.logger.info(`[ApplicationBootstrap] Initiating graceful shutdown (timeout: ${timeout}ms)...`);
    await this.lifecycle.executeShutdown(timeout);
    this.isBooted = false;
  }

  getHealthReport(): SystemHealthReport {
    const mem = process.memoryUsage();
    return {
      state: this.lifecycle.getState(),
      uptimeSeconds: this.lifecycle.getUptimeSeconds(),
      startedAt: this.lifecycle.getStartedAt(),
      modules: this.moduleRegistry.getAll().map(m => ({ name: m.name, version: m.version })),
      platforms: {
        GOOGLE: this.credentialProvider.hasPlatformCredentials('GOOGLE'),
        META: this.credentialProvider.hasPlatformCredentials('META'),
        TIKTOK: this.credentialProvider.hasPlatformCredentials('TIKTOK'),
      },
      memory: {
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      },
    };
  }

  private registerCoreBindings(): void {
    this.container.registerInstance('ILogger', this.logger);
    this.container.registerInstance('IConfigurationManager', this.config);
    this.container.registerInstance('IEventBus', this.eventBus);
    this.container.registerInstance('ICredentialProvider', this.credentialProvider);
    this.container.registerInstance('ValidatorService', this.validator);
    this.container.registerInstance('SystemLifecycleManager', this.lifecycle);
    this.container.registerInstance('ModuleRegistry', this.moduleRegistry);
    this.container.registerInstance('ModuleLoader', this.moduleLoader);
    this.container.registerInstance('DependencyContainer', this.container);
  }

  private validateCoreEnvironment(): void {
    const coreKeys = ['ENCRYPTION_SECRET', 'JWT_SECRET'];
    const res = this.config.validateRequired(coreKeys);

    if (!res.valid) {
      const isDevOrTest = process.env.NODE_ENV !== 'production';
      if (!isDevOrTest) {
        this.lifecycle.transitionTo('LOCKED_SAFE_MODE', `Critical environment variables missing: ${res.missing.join(', ')}`);
        throw new CredentialException(`Critical secrets missing: ${res.missing.join(', ')}`);
      }
      this.logger.warn(`[ApplicationBootstrap] Non-production environment: missing core keys (${res.missing.join(', ')}), proceeding in sandbox mode`);
    }
  }

  private probePlatformCredentials(): { googleReady: boolean; metaReady: boolean; tiktokReady: boolean } {
    return {
      googleReady: this.credentialProvider.hasPlatformCredentials('GOOGLE'),
      metaReady: this.credentialProvider.hasPlatformCredentials('META'),
      tiktokReady: this.credentialProvider.hasPlatformCredentials('TIKTOK'),
    };
  }

  private setupSignalHandlers(): void {
    const handleSignal = async (signal: string) => {
      this.logger.info(`[ApplicationBootstrap] Received OS signal ${signal}. Starting shutdown...`);
      try {
        await this.shutdown();
      } finally {
        process.exit(0);
      }
    };

    process.once('SIGINT', () => handleSignal('SIGINT'));
    process.once('SIGTERM', () => handleSignal('SIGTERM'));
  }
}
