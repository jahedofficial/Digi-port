import { LoggerService } from '../logging/logger.service';

export type GracefulShutdownHook = () => Promise<void> | void;

export class GracefulShutdownManager {
  private readonly logger: LoggerService;
  private readonly shutdownHooks: { name: string; hook: GracefulShutdownHook }[] = [];
  private activeOperationsCount = 0;
  private isShuttingDown = false;
  private readonly timeoutMs: number;

  constructor(timeoutMs = 10000, logger?: LoggerService) {
    this.timeoutMs = timeoutMs;
    this.logger = logger || new LoggerService('GracefulShutdownManager');
  }

  /**
   * Registers a cleanup hook to run on process termination.
   */
  registerHook(name: string, hook: GracefulShutdownHook): void {
    this.shutdownHooks.push({ name, hook });
  }

  /**
   * Tracks entering an in-flight operation.
   */
  trackOperationStart(): void {
    if (this.isShuttingDown) {
      throw new Error('System is currently shutting down. New operations rejected.');
    }
    this.activeOperationsCount++;
  }

  /**
   * Tracks completion of an in-flight operation.
   */
  trackOperationEnd(): void {
    this.activeOperationsCount = Math.max(0, this.activeOperationsCount - 1);
  }

  /**
   * Registers OS process termination listeners.
   */
  bindProcessSignals(): void {
    const handler = (signal: string) => {
      this.logger.warn(`[GracefulShutdown] Received ${signal} signal. Initiating graceful shutdown...`);
      this.shutdown(signal).catch((err) => {
        this.logger.error(`[GracefulShutdown] Error during shutdown: ${err.message}`);
        process.exit(1);
      });
    };

    process.once('SIGTERM', () => handler('SIGTERM'));
    process.once('SIGINT', () => handler('SIGINT'));
  }

  /**
   * Executes the graceful shutdown sequence:
   * 1. Rejects new operations
   * 2. Waits for active operations to drain or timeout
   * 3. Runs all cleanup hooks in reverse order
   */
  async shutdown(reason = 'MANUAL'): Promise<{ success: boolean; drainedOperations: number }> {
    if (this.isShuttingDown) {
      return { success: true, drainedOperations: 0 };
    }

    this.isShuttingDown = true;
    this.logger.info(`[GracefulShutdown] Starting teardown (Reason: ${reason}). Active operations: ${this.activeOperationsCount}`);

    const startTime = Date.now();
    const initialOperations = this.activeOperationsCount;

    // Drain active operations
    while (this.activeOperationsCount > 0) {
      if (Date.now() - startTime >= this.timeoutMs) {
        this.logger.error(
          `[GracefulShutdown] Shutdown timed out after ${this.timeoutMs}ms with ${this.activeOperationsCount} operations still active!`
        );
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Execute registered hooks in reverse order (LIFO)
    const hooksToRun = [...this.shutdownHooks].reverse();
    for (const { name, hook } of hooksToRun) {
      try {
        this.logger.info(`[GracefulShutdown] Executing cleanup hook: ${name}`);
        await hook();
      } catch (err: any) {
        this.logger.error(`[GracefulShutdown] Cleanup hook [${name}] failed: ${err.message}`);
      }
    }

    this.logger.info('[GracefulShutdown] Graceful shutdown completed cleanly.');
    return {
      success: true,
      drainedOperations: initialOperations - this.activeOperationsCount,
    };
  }

  getIsShuttingDown(): boolean {
    return this.isShuttingDown;
  }

  getActiveOperations(): number {
    return this.activeOperationsCount;
  }
}
