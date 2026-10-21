import { IModule } from '../interfaces/module.interface';
import { IDependencyContainer } from '../di/container';
import { ModuleRegistry } from '../modules/module-registry';
import { ILogger } from '../interfaces/logger.interface';
import { SystemException } from '../errors/domain.errors';

export interface DependentModule extends IModule {
  readonly dependencies?: string[];
}

export class ModuleLoader {
  constructor(
    private readonly container: IDependencyContainer,
    private readonly registry: ModuleRegistry,
    private readonly logger: ILogger
  ) {}

  registerModule(module: DependentModule): void {
    this.registry.register(module);
  }

  async loadAndInitializeAll(): Promise<void> {
    const allModules = this.registry.getAll() as DependentModule[];
    const sorted = this.topologicalSort(allModules);

    this.logger.info(`[ModuleLoader] Initializing ${sorted.length} modules in dependency order: ${sorted.map(m => m.name).join(' -> ')}`);

    for (const module of sorted) {
      this.logger.info(`[ModuleLoader] Registering bindings for module [${module.name} v${module.version}]`);
      await module.register(this.container);

      if (module.initialize) {
        this.logger.info(`[ModuleLoader] Initializing lifecycle for module [${module.name}]`);
        await module.initialize();
      }

      this.registry.recordInitialized(module);
    }
  }

  async teardownAll(): Promise<void> {
    this.logger.info('[ModuleLoader] Tearing down all modules');
    await this.registry.destroyAll();
  }

  private topologicalSort(modules: DependentModule[]): DependentModule[] {
    const moduleMap = new Map<string, DependentModule>();
    for (const m of modules) {
      moduleMap.set(m.name, m);
    }

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: DependentModule[] = [];

    const visit = (module: DependentModule) => {
      const name = module.name;

      if (visiting.has(name)) {
        throw new SystemException(
          `Circular dependency detected involving module '${name}'`,
          'ERR_CIRCULAR_MODULE_DEPENDENCY',
          { moduleName: name }
        );
      }

      if (visited.has(name)) {
        return;
      }

      visiting.add(name);

      if (module.dependencies) {
        for (const depName of module.dependencies) {
          const dep = moduleMap.get(depName);
          if (!dep) {
            throw new SystemException(
              `Module '${name}' depends on unregistered module '${depName}'`,
              'ERR_MISSING_MODULE_DEPENDENCY',
              { module: name, missingDependency: depName }
            );
          }
          visit(dep);
        }
      }

      visiting.delete(name);
      visited.add(name);
      result.push(module);
    };

    for (const m of modules) {
      if (!visited.has(m.name)) {
        visit(m);
      }
    }

    return result;
  }
}
