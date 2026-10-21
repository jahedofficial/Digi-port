import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ApplicationBootstrap,
  SystemLifecycleManager,
  ModuleLoader,
  SystemState,
  BaseModule,
  IDependencyContainer,
  StructuredLogger,
  TypedEventBus,
  DependencyContainer,
  ModuleRegistry,
  SystemException,
} from '../src/core';

describe('Phase 3 — Core Runtime Unit Tests', () => {

  describe('1. SystemLifecycleManager State Machine', () => {
    it('should manage valid state transitions and track uptime', () => {
      const logger = new StructuredLogger('TestLifecycle');
      const eventBus = new TypedEventBus(logger);
      const lifecycle = new SystemLifecycleManager(logger, eventBus);

      const capturedTransitions: Array<{ prev: SystemState; curr: SystemState }> = [];
      eventBus.subscribe<{ previousState: SystemState; currentState: SystemState }>(
        'system.state_changed',
        (payload) => {
          capturedTransitions.push({ prev: payload.previousState, curr: payload.currentState });
        }
      );

      assert.strictEqual(lifecycle.getState(), 'BOOTING');

      lifecycle.transitionTo('VALIDATING_ENVIRONMENT');
      assert.strictEqual(lifecycle.getState(), 'VALIDATING_ENVIRONMENT');

      lifecycle.transitionTo('VALIDATING_CREDENTIALS');
      assert.strictEqual(lifecycle.getState(), 'VALIDATING_CREDENTIALS');

      lifecycle.transitionTo('RUNNING_HEALTHY', 'All platforms ready');
      assert.strictEqual(lifecycle.getState(), 'RUNNING_HEALTHY');

      assert.strictEqual(typeof lifecycle.getUptimeSeconds(), 'number');
      assert.ok(lifecycle.getStartedAt() instanceof Date);

      assert.strictEqual(capturedTransitions.length, 3);
      assert.deepStrictEqual(capturedTransitions[0], { prev: 'BOOTING', curr: 'VALIDATING_ENVIRONMENT' });
      assert.deepStrictEqual(capturedTransitions[2], { prev: 'VALIDATING_CREDENTIALS', curr: 'RUNNING_HEALTHY' });
    });

    it('should throw SystemException on invalid state transitions', () => {
      const logger = new StructuredLogger('TestLifecycle');
      const lifecycle = new SystemLifecycleManager(logger);

      assert.throws(() => {
        // BOOTING cannot directly jump to RUNNING_HEALTHY without validation
        lifecycle.transitionTo('RUNNING_HEALTHY');
      }, (err: unknown) => {
        return err instanceof SystemException && err.code === 'ERR_INVALID_LIFECYCLE_TRANSITION';
      });
    });

    it('should execute shutdown hooks in LIFO order upon shutdown', async () => {
      const logger = new StructuredLogger('TestLifecycle');
      const lifecycle = new SystemLifecycleManager(logger);
      const executionOrder: string[] = [];

      lifecycle.addShutdownHook('FirstHook', () => {
        executionOrder.push('FirstHook');
      });

      lifecycle.addShutdownHook('SecondHook', () => {
        executionOrder.push('SecondHook');
      });

      await lifecycle.executeShutdown();

      assert.strictEqual(lifecycle.getState(), 'TERMINATED');
      assert.deepStrictEqual(executionOrder, ['SecondHook', 'FirstHook']);
    });
  });

  describe('2. ModuleLoader & Topological Dependency Sorting', () => {
    it('should initialize modules in dependency order', async () => {
      const container = new DependencyContainer();
      const registry = new ModuleRegistry();
      const logger = new StructuredLogger('TestModuleLoader');
      const loader = new ModuleLoader(container, registry, logger);

      const initOrder: string[] = [];

      class DatabaseModule extends BaseModule {
        readonly name = 'DatabaseModule';
        readonly version = '1.0.0';
        register(c: IDependencyContainer) {
          c.registerInstance('DbConnection', { connected: true });
        }
        protected async onInitialize() {
          initOrder.push('DatabaseModule');
        }
      }

      class CacheModule extends BaseModule {
        readonly name = 'CacheModule';
        readonly version = '1.0.0';
        readonly dependencies = ['DatabaseModule'];
        register(c: IDependencyContainer) {
          c.registerInstance('CacheStore', { active: true });
        }
        protected async onInitialize() {
          initOrder.push('CacheModule');
        }
      }

      class ApiModule extends BaseModule {
        readonly name = 'ApiModule';
        readonly version = '1.0.0';
        readonly dependencies = ['CacheModule'];
        register(c: IDependencyContainer) {
          c.registerInstance('ApiServer', { port: 3000 });
        }
        protected async onInitialize() {
          initOrder.push('ApiModule');
        }
      }

      // Register in intentionally unordered sequence: ApiModule first, then DatabaseModule, then CacheModule
      loader.registerModule(new ApiModule());
      loader.registerModule(new DatabaseModule());
      loader.registerModule(new CacheModule());

      await loader.loadAndInitializeAll();

      // DatabaseModule must initialize first, then CacheModule, then ApiModule
      assert.deepStrictEqual(initOrder, ['DatabaseModule', 'CacheModule', 'ApiModule']);
      assert.ok(container.has('DbConnection'));
      assert.ok(container.has('CacheStore'));
      assert.ok(container.has('ApiServer'));
    });

    it('should detect circular dependencies and throw SystemException', async () => {
      const container = new DependencyContainer();
      const registry = new ModuleRegistry();
      const logger = new StructuredLogger('TestModuleLoader');
      const loader = new ModuleLoader(container, registry, logger);

      class ModuleAlpha extends BaseModule {
        readonly name = 'ModuleAlpha';
        readonly version = '1.0.0';
        readonly dependencies = ['ModuleBeta'];
        register() {}
      }

      class ModuleBeta extends BaseModule {
        readonly name = 'ModuleBeta';
        readonly version = '1.0.0';
        readonly dependencies = ['ModuleAlpha'];
        register() {}
      }

      loader.registerModule(new ModuleAlpha());
      loader.registerModule(new ModuleBeta());

      await assert.rejects(async () => {
        await loader.loadAndInitializeAll();
      }, (err: unknown) => {
        return err instanceof SystemException && err.code === 'ERR_CIRCULAR_MODULE_DEPENDENCY';
      });
    });

    it('should throw when a module depends on an unregistered module', async () => {
      const container = new DependencyContainer();
      const registry = new ModuleRegistry();
      const logger = new StructuredLogger('TestModuleLoader');
      const loader = new ModuleLoader(container, registry, logger);

      class OrphanModule extends BaseModule {
        readonly name = 'OrphanModule';
        readonly version = '1.0.0';
        readonly dependencies = ['NonExistentModule'];
        register() {}
      }

      loader.registerModule(new OrphanModule());

      await assert.rejects(async () => {
        await loader.loadAndInitializeAll();
      }, (err: unknown) => {
        return err instanceof SystemException && err.code === 'ERR_MISSING_MODULE_DEPENDENCY';
      });
    });
  });

  describe('3. ApplicationBootstrap Integration', () => {
    it('should boot system, resolve all DI bindings, and emit system.ready', async () => {
      const bootstrap = new ApplicationBootstrap({
        customEnv: {
          JWT_SECRET: 'test-jwt-secret-xyz',
          ENCRYPTION_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      });

      let systemReadyReceived = false;
      bootstrap.getEventBus().subscribe('system.ready', () => {
        systemReadyReceived = true;
      });

      const report = await bootstrap.boot();

      assert.ok(systemReadyReceived);
      assert.ok(['RUNNING_HEALTHY', 'RUNNING_DEGRADED'].includes(report.state));
      assert.strictEqual(typeof report.uptimeSeconds, 'number');
      assert.ok(report.memory.heapUsedMb > 0);

      // Verify all core tokens resolved in DI container
      const container = bootstrap.getContainer();
      assert.ok(container.has('ILogger'));
      assert.ok(container.has('IConfigurationManager'));
      assert.ok(container.has('IEventBus'));
      assert.ok(container.has('ICredentialProvider'));
      assert.ok(container.has('ValidatorService'));
      assert.ok(container.has('SystemLifecycleManager'));
      assert.ok(container.has('ModuleRegistry'));
      assert.ok(container.has('ModuleLoader'));

      // Shutdown
      await bootstrap.shutdown();
      assert.strictEqual(bootstrap.getLifecycle().getState(), 'TERMINATED');
    });

    it('should support registering custom modules and tearing them down gracefully', async () => {
      const bootstrap = new ApplicationBootstrap({
        customEnv: {
          JWT_SECRET: 'secret',
          ENCRYPTION_SECRET: 'secret',
        },
      });

      let moduleDestroyed = false;

      class CustomWorkerModule extends BaseModule {
        readonly name = 'CustomWorkerModule';
        readonly version = '1.0.0';
        register(container: IDependencyContainer) {
          container.registerInstance('WorkerConfig', { interval: 1000 });
        }
        protected async onDestroy() {
          moduleDestroyed = true;
        }
      }

      bootstrap.registerModule(new CustomWorkerModule());
      await bootstrap.boot();

      const container = bootstrap.getContainer();
      assert.strictEqual(container.has('WorkerConfig'), true);

      await bootstrap.shutdown();
      assert.strictEqual(moduleDestroyed, true);
    });
  });
});
