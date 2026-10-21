import { IModule } from '../interfaces/module.interface';
import { IDependencyContainer } from '../di/container';
import { ILoggerService } from '../interfaces/logger.interface';

export abstract class BaseModule implements IModule {
  abstract readonly name: string;
  abstract readonly version: string;

  protected isInitialized = false;

  constructor(protected readonly logger?: ILoggerService) {}

  abstract register(container: IDependencyContainer): Promise<void> | void;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.logger?.info(`Initializing module [${this.name} v${this.version}]`);
    await this.onInitialize();
    this.isInitialized = true;
  }

  async destroy(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }
    this.logger?.info(`Destroying module [${this.name}]`);
    await this.onDestroy();
    this.isInitialized = false;
  }

  protected async onInitialize(): Promise<void> {
    // Override in derived classes if needed
  }

  protected async onDestroy(): Promise<void> {
    // Override in derived classes if needed
  }
}
