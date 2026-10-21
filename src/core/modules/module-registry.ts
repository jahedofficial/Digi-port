import { IModule } from '../interfaces/module.interface';
import { IDependencyContainer } from '../di/container';
import { ILoggerService } from '../interfaces/logger.interface';
import { SystemException } from '../errors/domain.errors';

export class ModuleRegistry {
  private readonly modules = new Map<string, IModule>();
  private readonly initializedModules: IModule[] = [];

  constructor(private readonly logger?: ILoggerService) {}

  register(module: IModule): void {
    if (this.modules.has(module.name)) {
      throw new SystemException(`Module '${module.name}' is already registered`, undefined, {
        moduleName: module.name,
      });
    }

    this.modules.set(module.name, module);
    this.logger?.debug(`Module registered: ${module.name} (v${module.version})`);
  }

  get(name: string): IModule | undefined {
    return this.modules.get(name);
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  getAll(): IModule[] {
    return Array.from(this.modules.values());
  }

  async initializeAll(container: IDependencyContainer): Promise<void> {
    for (const module of this.modules.values()) {
      this.logger?.info(`Registering module container bindings: ${module.name}`);
      await module.register(container);

      if (module.initialize) {
        this.logger?.info(`Initializing module lifecycle: ${module.name}`);
        await module.initialize();
      }

      this.initializedModules.push(module);
    }
  }

  recordInitialized(module: IModule): void {
    if (!this.initializedModules.includes(module)) {
      this.initializedModules.push(module);
    }
  }

  async destroyAll(): Promise<void> {
    // Teardown in reverse order of initialization
    while (this.initializedModules.length > 0) {
      const module = this.initializedModules.pop();
      if (module?.destroy) {
        this.logger?.info(`Destroying module: ${module.name}`);
        try {
          await module.destroy();
        } catch (error) {
          this.logger?.error(`Error during module teardown for ${module.name}`, error);
        }
      }
    }
  }
}
