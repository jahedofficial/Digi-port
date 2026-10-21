import { IEventBus, EventHandler, ISubscription } from '../interfaces/event-bus.interface';
import { ILogger } from '../interfaces/logger.interface';
import { StructuredLogger } from '../logging/logger.service';

export class TypedEventBus implements IEventBus {
  private handlers = new Map<string, Set<EventHandler<any>>>();
  private logger: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger || new StructuredLogger('EventBus');
  }

  async publish<T = unknown>(eventName: string, payload: T): Promise<void> {
    const subscribers = this.handlers.get(eventName);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    const promises: Promise<void>[] = [];

    for (const handler of subscribers) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          promises.push(
            result.catch((err) => {
              this.logger.error(`[EventBus] Error in async event handler for '${eventName}':`, err);
            })
          );
        }
      } catch (err) {
        this.logger.error(`[EventBus] Error in synchronous event handler for '${eventName}':`, err);
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  subscribe<T = unknown>(eventName: string, handler: EventHandler<T>): ISubscription {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    const subscribers = this.handlers.get(eventName)!;
    subscribers.add(handler);

    return {
      unsubscribe: () => {
        subscribers.delete(handler);
        if (subscribers.size === 0) {
          this.handlers.delete(eventName);
        }
      },
    };
  }

  unsubscribeAll(eventName?: string): void {
    if (eventName) {
      this.handlers.delete(eventName);
    } else {
      this.handlers.clear();
    }
  }

  getListenerCount(eventName: string): number {
    return this.handlers.get(eventName)?.size || 0;
  }
}

export const EventBusService = TypedEventBus;
export type EventBusService = TypedEventBus;

