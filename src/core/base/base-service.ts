import { ILoggerService } from '../interfaces/logger.interface';
import { IEventBusService } from '../interfaces/event-bus.interface';

export abstract class BaseService {
  protected isRunning = false;

  constructor(
    protected readonly logger: ILoggerService,
    protected readonly eventBus?: IEventBusService
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.logger.debug(`Starting service [${this.constructor.name}]`);
    await this.onStart();
    this.isRunning = true;
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    this.logger.debug(`Stopping service [${this.constructor.name}]`);
    await this.onStop();
    this.isRunning = false;
  }

  protected async onStart(): Promise<void> {
    // Override in derived classes
  }

  protected async onStop(): Promise<void> {
    // Override in derived classes
  }
}
