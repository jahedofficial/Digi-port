import { SystemState } from './types';
import { ILogger } from '../interfaces/logger.interface';
import { IEventBus } from '../interfaces/event-bus.interface';
import { SystemException } from '../errors/domain.errors';

export type ShutdownHook = () => Promise<void> | void;

export class SystemLifecycleManager {
  private currentState: SystemState = 'BOOTING';
  private readonly startedAt: Date;
  private readonly shutdownHooks: Array<{ name: string; hook: ShutdownHook }> = [];

  constructor(
    private readonly logger: ILogger,
    private readonly eventBus?: IEventBus
  ) {
    this.startedAt = new Date();
  }

  getState(): SystemState {
    return this.currentState;
  }

  getStartedAt(): Date {
    return this.startedAt;
  }

  getUptimeSeconds(): number {
    return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
  }

  transitionTo(newState: SystemState, reason?: string): void {
    const prevState = this.currentState;
    if (prevState === newState) {
      return;
    }

    this.validateTransition(prevState, newState);
    this.currentState = newState;

    this.logger.info(`[Lifecycle] State transition: ${prevState} -> ${newState}${reason ? ` (${reason})` : ''}`, {
      fromState: prevState,
      toState: newState,
      reason,
    });

    if (this.eventBus) {
      this.eventBus.publish('system.state_changed', {
        previousState: prevState,
        currentState: newState,
        timestamp: new Date(),
        reason,
      });
    }
  }

  addShutdownHook(name: string, hook: ShutdownHook): void {
    this.shutdownHooks.push({ name, hook });
  }

  async executeShutdown(timeoutMs: number = 10000): Promise<void> {
    if (this.currentState === 'SHUTTING_DOWN' || this.currentState === 'TERMINATED') {
      return;
    }

    this.transitionTo('SHUTTING_DOWN', 'Shutdown triggered');

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new SystemException(`Graceful shutdown timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const shutdownExecution = async () => {
      // Execute shutdown hooks in reverse order of addition (LIFO)
      while (this.shutdownHooks.length > 0) {
        const { name, hook } = this.shutdownHooks.pop()!;
        try {
          this.logger.info(`[Lifecycle] Executing shutdown hook: ${name}`);
          await hook();
        } catch (error) {
          this.logger.error(`[Lifecycle] Error executing shutdown hook '${name}':`, error);
        }
      }
    };

    try {
      await Promise.race([shutdownExecution(), timeoutPromise]);
    } finally {
      this.transitionTo('TERMINATED', 'All shutdown hooks completed');
    }
  }

  private validateTransition(from: SystemState, to: SystemState): void {
    const validTransitions: Record<SystemState, SystemState[]> = {
      BOOTING: ['VALIDATING_ENVIRONMENT', 'SHUTTING_DOWN'],
      VALIDATING_ENVIRONMENT: ['VALIDATING_CREDENTIALS', 'LOCKED_SAFE_MODE', 'SHUTTING_DOWN'],
      VALIDATING_CREDENTIALS: ['RUNNING_HEALTHY', 'RUNNING_DEGRADED', 'LOCKED_SAFE_MODE', 'SHUTTING_DOWN'],
      RUNNING_HEALTHY: ['RUNNING_DEGRADED', 'SHUTTING_DOWN'],
      RUNNING_DEGRADED: ['RUNNING_HEALTHY', 'SHUTTING_DOWN'],
      LOCKED_SAFE_MODE: ['SHUTTING_DOWN'],
      SHUTTING_DOWN: ['TERMINATED'],
      TERMINATED: [],
    };

    const allowed = validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new SystemException(
        `Invalid lifecycle state transition from '${from}' to '${to}'`,
        'ERR_INVALID_LIFECYCLE_TRANSITION',
        { fromState: from, toState: to }
      );
    }
  }
}
