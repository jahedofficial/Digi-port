export type EventHandler<T = unknown> = (payload: T) => Promise<void> | void;

export interface ISubscription {
  unsubscribe(): void;
}

export interface IEventBus {
  publish<T = unknown>(eventName: string, payload: T): Promise<void>;
  subscribe<T = unknown>(eventName: string, handler: EventHandler<T>): ISubscription;
  unsubscribeAll(eventName?: string): void;
}

export type IEventBusService = IEventBus;

