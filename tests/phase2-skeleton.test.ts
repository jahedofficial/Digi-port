import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DependencyContainer,
  ConfigurationManager,
  EnvironmentCredentialProvider,
  EventBusService,
  LoggerService,
  ValidatorService,
  ModuleRegistry,
  BasePlatformAdapter,
  BaseModule,
  BaseService,
  DomainException,
  CredentialException,
  AdapterException,
  RateLimitException,
  ValidationException,
  PolicyViolationException,
  BudgetCapException,
  SystemException,
  Platform,
  PlatformConnectionStatus,
  DateRange,
  UnifiedAccount,
  UnifiedCampaign,
  UnifiedCampaignCreateInput,
  UnifiedAdGroup,
  UnifiedAdGroupCreateInput,
  UnifiedAd,
  UnifiedReportMetric,
  IDependencyContainer,
} from '../src/core';

describe('Phase 2 — Project Skeleton Unit Tests', () => {

  describe('1. Dependency Injection Container', () => {
    it('should register and resolve singleton instances', () => {
      const container = new DependencyContainer();
      class CounterService {
        count = 0;
        increment() { this.count++; }
      }

      container.registerSingleton('CounterService', CounterService);
      const instance1 = container.resolve<CounterService>('CounterService');
      instance1.increment();
      const instance2 = container.resolve<CounterService>('CounterService');

      assert.strictEqual(instance2.count, 1);
      assert.strictEqual(instance1, instance2);
    });

    it('should register and resolve transient instances', () => {
      const container = new DependencyContainer();
      class WorkerService {
        id = Math.random();
      }

      container.registerTransient('WorkerService', WorkerService);
      const w1 = container.resolve<WorkerService>('WorkerService');
      const w2 = container.resolve<WorkerService>('WorkerService');

      assert.notStrictEqual(w1, w2);
      assert.notStrictEqual(w1.id, w2.id);
    });

    it('should register and resolve an existing instance', () => {
      const container = new DependencyContainer();
      const config = { appName: 'DigiPort-AI', env: 'test' };

      container.registerInstance('AppConfig', config);
      const resolved = container.resolve<typeof config>('AppConfig');

      assert.strictEqual(resolved.appName, 'DigiPort-AI');
      assert.strictEqual(resolved, config);
    });

    it('should register and resolve factories', () => {
      const container = new DependencyContainer();
      container.registerFactory('Timestamp', () => Date.now());

      const t1 = container.resolve<number>('Timestamp');
      assert.strictEqual(typeof t1, 'number');
    });

    it('should throw an error for unregistered tokens', () => {
      const container = new DependencyContainer();
      assert.throws(() => {
        container.resolve('UnknownToken');
      }, /Service token not registered: UnknownToken/);
    });

    it('should check if a token is registered', () => {
      const container = new DependencyContainer();
      assert.strictEqual(container.has('Missing'), false);
      container.registerInstance('Present', 123);
      assert.strictEqual(container.has('Present'), true);
    });
  });

  describe('2. Configuration System & Environment Loader', () => {
    it('should retrieve strings, numbers, booleans, and fallbacks', () => {
      const config = new ConfigurationManager({
        APP_NAME: 'DigiPort Marketing Engine',
        PORT: '3000',
        DEBUG_MODE: 'true',
        CACHE_ENABLED: '1',
        FEATURE_ALPHA: 'false',
      });

      assert.strictEqual(config.get('APP_NAME'), 'DigiPort Marketing Engine');
      assert.strictEqual(config.get('MISSING_KEY', 'default-val'), 'default-val');
      assert.strictEqual(config.getNumber('PORT'), 3000);
      assert.strictEqual(config.getNumber('NOT_SET', 8080), 8080);
      assert.strictEqual(config.getBoolean('DEBUG_MODE'), true);
      assert.strictEqual(config.getBoolean('CACHE_ENABLED'), true);
      assert.strictEqual(config.getBoolean('FEATURE_ALPHA'), false);
      assert.strictEqual(config.getBoolean('UNKNOWN', true), true);
    });

    it('should validate required configuration keys', () => {
      const config = new ConfigurationManager({
        JWT_SECRET: 'super-secret-key',
        OPENCLAW_BASE_URL: 'https://openclaw.neexion.com',
      });

      const validation = config.validateRequired(['JWT_SECRET', 'OPENCLAW_BASE_URL', 'REDIS_URL']);
      assert.strictEqual(validation.valid, false);
      assert.deepStrictEqual(validation.missing, ['REDIS_URL']);

      const passedValidation = config.validateRequired(['JWT_SECRET', 'OPENCLAW_BASE_URL']);
      assert.strictEqual(passedValidation.valid, true);
      assert.strictEqual(passedValidation.missing.length, 0);
    });

    it('should validate platform environment credentials', () => {
      const provider = new EnvironmentCredentialProvider();
      const status = provider.validateAllEnvironmentCredentials();

      assert.strictEqual(typeof status.valid, 'boolean');
      assert.strictEqual(typeof status.presentCount, 'number');
      assert.strictEqual(typeof status.totalRequired, 'number');
      assert.ok(status.totalRequired > 0);
    });
  });

  describe('3. Event Bus Service', () => {
    it('should publish and receive events with typed payloads', async () => {
      const eventBus = new EventBusService();
      let receivedPayload: { campaignId: string; status: string } | null = null;

      eventBus.subscribe<{ campaignId: string; status: string }>('campaign.status_changed', (payload) => {
        receivedPayload = payload;
      });

      await eventBus.publish('campaign.status_changed', {
        campaignId: 'camp-999',
        status: 'PAUSED',
      });

      assert.ok(receivedPayload !== null);
      const payload = receivedPayload as { campaignId: string; status: string };
      assert.strictEqual(payload.campaignId, 'camp-999');
      assert.strictEqual(payload.status, 'PAUSED');
    });

    it('should support unsubscribing from events', async () => {
      const eventBus = new EventBusService();
      let callCount = 0;

      const sub = eventBus.subscribe('ping', () => {
        callCount++;
      });

      await eventBus.publish('ping', {});
      assert.strictEqual(callCount, 1);

      sub.unsubscribe();
      await eventBus.publish('ping', {});
      assert.strictEqual(callCount, 1);
    });

    it('should unsubscribe all handlers for a topic', async () => {
      const eventBus = new EventBusService();
      let totalCalls = 0;

      eventBus.subscribe('batch.action', () => { totalCalls++; });
      eventBus.subscribe('batch.action', () => { totalCalls++; });

      await eventBus.publish('batch.action', {});
      assert.strictEqual(totalCalls, 2);

      eventBus.unsubscribeAll('batch.action');
      await eventBus.publish('batch.action', {});
      assert.strictEqual(totalCalls, 2);
    });
  });

  describe('4. Logger Service', () => {
    it('should log messages across all standard levels', () => {
      const logs: string[] = [];
      const origLog = console.log;
      const origWarn = console.warn;
      const origErr = console.error;

      console.log = (msg: string) => { logs.push(msg); };
      console.warn = (msg: string) => { logs.push(msg); };
      console.error = (msg: string) => { logs.push(msg); };

      try {
        const logger = new LoggerService('TestComponent');
        logger.debug('Debug trace');
        logger.info('Informational event', { user: 'admin' });
        logger.warn('Warning condition');
        logger.error('Error occurred', new Error('Test fault'));
        logger.fatal('Fatal system crash');

        assert.strictEqual(logs.length, 5);
      } finally {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origErr;
      }
    });

    it('should sanitize and mask sensitive credential fields', () => {
      let loggedMessage = '';
      const origLog = console.log;

      console.log = (msg: string) => {
        loggedMessage = msg;
      };

      try {
        const logger = new LoggerService('SecurityTest');
        logger.info('User authenticated', {
          token: 'secret-token-12345',
          apiKey: 'AIzaSySecretApiKey',
          normalData: 'visible-value',
        });

        assert.ok(loggedMessage.includes('••••••••'));
        assert.ok(!loggedMessage.includes('secret-token-12345'));
        assert.ok(!loggedMessage.includes('AIzaSySecretApiKey'));
        assert.ok(loggedMessage.includes('visible-value'));
      } finally {
        console.log = origLog;
      }
    });
  });

  describe('5. Validation Service', () => {
    const validator = new ValidatorService();

    it('should validate required fields', () => {
      const res = validator.validateRequiredFields(
        { title: 'Spring Promo', budget: 500 },
        ['title', 'budget', 'startDate']
      );

      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.errors.length, 1);
      assert.strictEqual(res.errors[0].field, 'startDate');
    });

    it('should validate date ranges', () => {
      const validRes = validator.validateDateRange('2026-05-01', '2026-05-31');
      assert.strictEqual(validRes.isValid, true);

      const invalidOrder = validator.validateDateRange('2026-06-01', '2026-05-01');
      assert.strictEqual(invalidOrder.isValid, false);
      assert.strictEqual(invalidOrder.errors[0].code, 'START_DATE_AFTER_END_DATE');

      const malformed = validator.validateDateRange('05/01/2026', 'invalid');
      assert.strictEqual(malformed.isValid, false);
    });

    it('should validate positive numbers', () => {
      assert.strictEqual(validator.validatePositiveNumber(150, 'budget').isValid, true);
      assert.strictEqual(validator.validatePositiveNumber(-10, 'budget').isValid, false);
      assert.strictEqual(validator.validatePositiveNumber(0, 'budget').isValid, false);
      assert.strictEqual(validator.validatePositiveNumber('not-a-number', 'budget').isValid, false);
    });

    it('should validate URLs', () => {
      assert.strictEqual(validator.validateUrl('https://example.com/landing', 'landingUrl').isValid, true);
      assert.strictEqual(validator.validateUrl('ftp://not-supported', 'landingUrl').isValid, false);
      assert.strictEqual(validator.validateUrl('broken-url', 'landingUrl').isValid, false);
    });

    it('should validate enums', () => {
      const platforms = ['GOOGLE', 'META', 'TIKTOK'] as const;
      assert.strictEqual(validator.validateEnum('GOOGLE', platforms, 'platform').isValid, true);
      assert.strictEqual(validator.validateEnum('UNKNOWN_CHANNEL', platforms, 'platform').isValid, false);
    });

    it('should combine multiple validation results', () => {
      const r1 = validator.validatePositiveNumber(100, 'budget');
      const r2 = validator.validateDateRange('2026-10-01', '2026-10-05');
      const combined = validator.combineResults(r1, r2);

      assert.strictEqual(combined.isValid, true);
      assert.strictEqual(combined.errors.length, 0);
    });
  });

  describe('6. Module Registration', () => {
    it('should register and initialize modules in lifecycle order', async () => {
      const registry = new ModuleRegistry();
      const lifecycleEvents: string[] = [];

      class TestModule extends BaseModule {
        readonly name = 'TestCoreModule';
        readonly version = '1.0.0';

        register(container: IDependencyContainer): void {
          lifecycleEvents.push('register:TestCoreModule');
          container.registerInstance('TestService', { active: true });
        }

        protected async onInitialize(): Promise<void> {
          lifecycleEvents.push('init:TestCoreModule');
        }

        protected async onDestroy(): Promise<void> {
          lifecycleEvents.push('destroy:TestCoreModule');
        }
      }

      class SecondaryModule extends BaseModule {
        readonly name = 'SecondaryModule';
        readonly version = '2.1.0';

        register(_container: IDependencyContainer): void {
          lifecycleEvents.push('register:SecondaryModule');
        }

        protected async onInitialize(): Promise<void> {
          lifecycleEvents.push('init:SecondaryModule');
        }

        protected async onDestroy(): Promise<void> {
          lifecycleEvents.push('destroy:SecondaryModule');
        }
      }

      registry.register(new TestModule());
      registry.register(new SecondaryModule());

      assert.strictEqual(registry.has('TestCoreModule'), true);
      assert.strictEqual(registry.has('SecondaryModule'), true);
      assert.strictEqual(registry.getAll().length, 2);

      const container = new DependencyContainer();
      await registry.initializeAll(container);

      assert.ok(container.has('TestService'));
      assert.deepStrictEqual(lifecycleEvents, [
        'register:TestCoreModule',
        'init:TestCoreModule',
        'register:SecondaryModule',
        'init:SecondaryModule',
      ]);

      await registry.destroyAll();
      // Verify teardown in reverse order (LIFO)
      assert.deepStrictEqual(lifecycleEvents.slice(-2), [
        'destroy:SecondaryModule',
        'destroy:TestCoreModule',
      ]);
    });

    it('should throw when registering duplicate module names', () => {
      const registry = new ModuleRegistry();
      class DuplicateModule extends BaseModule {
        readonly name = 'Dup';
        readonly version = '1.0.0';
        register() {}
      }

      registry.register(new DuplicateModule());
      assert.throws(() => {
        registry.register(new DuplicateModule());
      }, SystemException);
    });
  });

  describe('7. Domain Exceptions Hierarchy', () => {
    it('should properly instantiate and serialize domain exceptions', () => {
      const err = new CredentialException('Token expired', 'ERR_CRED_EXPIRED', { platform: 'META' });
      assert.strictEqual(err.name, 'CredentialException');
      assert.strictEqual(err.code, 'ERR_CRED_EXPIRED');
      assert.strictEqual(err.message, 'Token expired');
      assert.strictEqual(err.context?.platform, 'META');
      assert.ok(err.timestamp instanceof Date);

      const json = err.toJSON();
      assert.strictEqual(json.name, 'CredentialException');
      assert.strictEqual(json.code, 'ERR_CRED_EXPIRED');
    });

    it('should support specialized exceptions', () => {
      const rateLimitErr = new RateLimitException('Throttled', 120);
      assert.strictEqual(rateLimitErr.retryAfterSeconds, 120);

      const adapterErr = new AdapterException('Connection refused', 'GOOGLE', 503);
      assert.strictEqual(adapterErr.platform, 'GOOGLE');
      assert.strictEqual(adapterErr.statusCode, 503);

      const validationErr = new ValidationException('Invalid payload', ['name is required', 'budget too low']);
      assert.strictEqual(validationErr.validationErrors.length, 2);

      const budgetErr = new BudgetCapException('Cap exceeded', 5000, 2000);
      assert.strictEqual(budgetErr.requestedAmount, 5000);
      assert.strictEqual(budgetErr.maxAllowedAmount, 2000);

      const policyErr = new PolicyViolationException('Policy broken', ['SPECIAL_AD_CATEGORY_MISSING']);
      assert.strictEqual(policyErr.violatedRules[0], 'SPECIAL_AD_CATEGORY_MISSING');

      const systemErr = new SystemException('Disk full');
      assert.strictEqual(systemErr.code, 'ERR_SYSTEM');
    });
  });

  describe('8. Base Platform Adapter Implementation Contract', () => {
    it('should allow derived platform adapters adhering to contracts', async () => {
      class MockGoogleAdapter extends BasePlatformAdapter {
        readonly platform: Platform = 'GOOGLE';

        async verifyConnection(): Promise<PlatformConnectionStatus> {
          return {
            platform: 'GOOGLE',
            connected: true,
            accountId: '123-456-7890',
            statusCode: 200,
            message: 'Connected',
            checkedAt: new Date(),
          };
        }

        async getAccountDetails(): Promise<UnifiedAccount> {
          return {
            id: '123-456-7890',
            workspaceId: 'ws-default',
            platform: 'GOOGLE',
            externalAccountId: '123-456-7890',
            name: 'Test Google Account',
            currency: 'USD',
            timezone: 'America/New_York',
            status: 'ACTIVE',
            isManagerAccount: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        async listCampaigns(): Promise<UnifiedCampaign[]> { return []; }
        async getCampaign(_id: string): Promise<UnifiedCampaign | null> { return null; }
        async createCampaign(input: UnifiedCampaignCreateInput): Promise<UnifiedCampaign> {
          return {
            id: 'camp-1',
            accountId: '123-456-7890',
            platform: 'GOOGLE',
            platformCampaignId: 'ext-1',
            name: input.name,
            objective: input.objective,
            status: 'ACTIVE',
            budgetStrategy: input.budgetStrategy,
            dailyBudget: input.dailyBudget,
            startDate: input.startDate,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        async updateCampaignBudget(_id: string, _budget: number): Promise<boolean> { return true; }
        async setCampaignStatus(_id: string, _status: 'ACTIVE' | 'PAUSED'): Promise<boolean> { return true; }
        async listAdGroups(_campId: string): Promise<UnifiedAdGroup[]> { return []; }
        async createAdGroup(input: UnifiedAdGroupCreateInput): Promise<UnifiedAdGroup> {
          return {
            id: 'ag-1',
            campaignId: input.campaignId,
            platform: 'GOOGLE',
            platformAdGroupId: 'ext-ag-1',
            name: input.name,
            status: 'ACTIVE',
            bidStrategy: input.bidStrategy,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        async setAdGroupStatus(_id: string, _status: 'ACTIVE' | 'PAUSED'): Promise<boolean> { return true; }
        async listAds(_agId: string): Promise<UnifiedAd[]> { return []; }
        async setAdStatus(_id: string, _status: 'ACTIVE' | 'PAUSED'): Promise<boolean> { return true; }
        async fetchMetrics(_range: DateRange, _type: 'ACCOUNT' | 'CAMPAIGN' | 'ADGROUP' | 'AD'): Promise<UnifiedReportMetric[]> {
          return [];
        }
      }

      const logger = new LoggerService('MockAdapter');
      const eventBus = new EventBusService();
      const adapter = new MockGoogleAdapter(logger, eventBus);

      const status = await adapter.verifyConnection();
      assert.strictEqual(status.connected, true);
      assert.strictEqual(status.platform, 'GOOGLE');

      const account = await adapter.getAccountDetails();
      assert.strictEqual(account.currency, 'USD');
    });

    it('should support BaseService lifecycle start and stop', async () => {
      const logs: string[] = [];
      class MockWorkerService extends BaseService {
        protected async onStart(): Promise<void> {
          logs.push('worker:started');
        }
        protected async onStop(): Promise<void> {
          logs.push('worker:stopped');
        }
      }

      const logger = new LoggerService('Worker');
      const service = new MockWorkerService(logger);

      await service.start();
      assert.deepStrictEqual(logs, ['worker:started']);

      await service.stop();
      assert.deepStrictEqual(logs, ['worker:started', 'worker:stopped']);
    });
  });
});
