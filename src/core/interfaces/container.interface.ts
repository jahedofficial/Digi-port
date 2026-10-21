export type Token<T = unknown> = string | symbol | (new (...args: any[]) => T);

export interface RegistrationOptions {
  singleton?: boolean;
}

export interface IDependencyContainer {
  register<T>(token: Token<T>, valueOrFactory: T | ((container: IDependencyContainer) => T), options?: RegistrationOptions): void;
  registerSingleton<T>(token: Token<T>, target: (new (...args: any[]) => T) | ((container: IDependencyContainer) => T)): void;
  registerTransient<T>(token: Token<T>, target: (new (...args: any[]) => T) | ((container: IDependencyContainer) => T)): void;
  registerInstance<T>(token: Token<T>, instance: T): void;
  registerFactory<T>(token: Token<T>, factory: (container: IDependencyContainer) => T): void;
  resolve<T>(token: Token<T>): T;
  has(token: Token): boolean;
  clear(): void;
}
