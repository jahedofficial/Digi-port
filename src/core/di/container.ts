import { IDependencyContainer, Token, RegistrationOptions } from '../interfaces/container.interface';
export * from '../interfaces/container.interface';

export class DependencyContainer implements IDependencyContainer {
  private registry = new Map<Token, {
    factory: (container: IDependencyContainer) => unknown;
    singleton: boolean;
    instance?: unknown;
  }>();

  register<T>(
    token: Token<T>, 
    valueOrFactory: T | ((container: IDependencyContainer) => T), 
    options: RegistrationOptions = { singleton: true }
  ): void {
    const isConstructor = this.isClassConstructor(valueOrFactory);
    const isFactory = typeof valueOrFactory === 'function' && !isConstructor;
    
    let factoryFn: (container: IDependencyContainer) => unknown;
    if (isConstructor) {
      const Ctor = valueOrFactory as new (...args: any[]) => T;
      factoryFn = () => new Ctor();
    } else if (isFactory) {
      factoryFn = valueOrFactory as (c: IDependencyContainer) => T;
    } else {
      factoryFn = () => valueOrFactory;
    }

    this.registry.set(token as Token, {
      factory: factoryFn,
      singleton: options.singleton !== false,
      instance: !isFactory && !isConstructor && options.singleton !== false ? valueOrFactory : undefined,
    });
  }

  registerSingleton<T>(token: Token<T>, target: (new (...args: any[]) => T) | ((container: IDependencyContainer) => T)): void {
    this.register(token, target as any, { singleton: true });
  }

  registerTransient<T>(token: Token<T>, target: (new (...args: any[]) => T) | ((container: IDependencyContainer) => T)): void {
    this.register(token, target as any, { singleton: false });
  }

  registerInstance<T>(token: Token<T>, instance: T): void {
    this.register(token, instance, { singleton: true });
  }

  registerFactory<T>(token: Token<T>, factory: (container: IDependencyContainer) => T): void {
    this.register(token, factory, { singleton: false });
  }

  resolve<T>(token: Token<T>): T {
    const entry = this.registry.get(token as Token);
    if (!entry) {
      const name = typeof token === 'function' ? token.name : String(token);
      throw new Error(`[DependencyContainer] Service token not registered: ${name}`);
    }

    if (entry.singleton) {
      if (entry.instance === undefined) {
        entry.instance = entry.factory(this);
      }
      return entry.instance as T;
    }

    return entry.factory(this) as T;
  }

  has(token: Token): boolean {
    return this.registry.has(token);
  }

  clear(): void {
    this.registry.clear();
  }

  private isClassConstructor(fn: unknown): boolean {
    return typeof fn === 'function' && /^\s*class\s+/.test(fn.toString());
  }
}

export const globalContainer = new DependencyContainer();
