import { IDependencyContainer } from './container.interface';

export interface IModule {
  readonly name: string;
  readonly version: string;
  register(container: IDependencyContainer): Promise<void> | void;
  initialize?(): Promise<void> | void;
  destroy?(): Promise<void> | void;
}
