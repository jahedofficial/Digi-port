import { Platform } from '../types/account';
import { IEventBus } from '../interfaces/event-bus.interface';
import {
  StepExecutionRecord,
  WorkflowDAG,
  WorkflowStep,
  WorkflowStepStatus,
} from './types';

/**
 * Dependency-Aware Task Scheduler with Platform Concurrency Throttling
 */
export class TaskScheduler {
  private readonly stepStatuses = new Map<string, WorkflowStepStatus>();
  private readonly stepRecords = new Map<string, StepExecutionRecord>();
  private readonly runningByPlatform = new Map<Platform, number>();
  private readonly maxConcurrencyPerPlatform: Record<Platform, number> = {
    GOOGLE: 5,
    META: 5,
    TIKTOK: 3,
  };

  constructor(private readonly eventBus?: IEventBus) {
    this.runningByPlatform.set('GOOGLE', 0);
    this.runningByPlatform.set('META', 0);
    this.runningByPlatform.set('TIKTOK', 0);
  }

  /**
   * Initialize scheduler with a planned DAG
   */
  public initializeDAG(dag: WorkflowDAG): void {
    this.stepStatuses.clear();
    this.stepRecords.clear();

    for (const [stepId, step] of dag.steps) {
      this.stepStatuses.set(stepId, 'PENDING');
      this.stepRecords.set(stepId, {
        stepId,
        stepName: step.name,
        platform: step.task.platform,
        operation: step.task.operation,
        status: 'PENDING',
        retryAttempts: 0,
      });
    }
  }

  /**
   * Determine which steps in the DAG are currently READY to execute
   */
  public getReadySteps(dag: WorkflowDAG): WorkflowStep[] {
    const readySteps: WorkflowStep[] = [];

    for (const [stepId, step] of dag.steps) {
      const currentStatus = this.stepStatuses.get(stepId);
      if (currentStatus !== 'PENDING') {
        continue;
      }

      // Check if all prerequisites are COMPLETED
      const allDepsCompleted = step.dependencies.every(
        (depId) => this.stepStatuses.get(depId) === 'COMPLETED'
      );

      if (allDepsCompleted) {
        // Check platform concurrency throttle
        const platform = step.task.platform;
        if (platform !== 'CROSS_PLATFORM') {
          const currentRunning = this.runningByPlatform.get(platform) ?? 0;
          const maxAllowed = this.maxConcurrencyPerPlatform[platform] ?? 5;
          if (currentRunning >= maxAllowed) {
            continue; // Throttle: wait for active requests on this platform to complete
          }
        }

        readySteps.push(step);
      }
    }

    return readySteps;
  }

  /**
   * Transition step to RUNNING state
   */
  public markStepRunning(step: WorkflowStep): void {
    this.stepStatuses.set(step.id, 'RUNNING');
    const rec = this.stepRecords.get(step.id);
    if (rec) {
      rec.status = 'RUNNING';
      rec.startedAt = new Date();
    }

    const platform = step.task.platform;
    if (platform !== 'CROSS_PLATFORM') {
      const count = this.runningByPlatform.get(platform) ?? 0;
      this.runningByPlatform.set(platform, count + 1);
    }

    if (this.eventBus) {
      this.eventBus.publish('workflow.step_started', {
        stepId: step.id,
        platform: step.task.platform,
        operation: step.task.operation,
      });
    }
  }

  /**
   * Transition step to COMPLETED state
   */
  public markStepCompleted(
    step: WorkflowStep,
    result: StepExecutionRecord['result']
  ): void {
    this.stepStatuses.set(step.id, 'COMPLETED');
    const rec = this.stepRecords.get(step.id);
    if (rec) {
      rec.status = 'COMPLETED';
      rec.completedAt = new Date();
      rec.durationMs = rec.startedAt
        ? rec.completedAt.getTime() - rec.startedAt.getTime()
        : 0;
      rec.result = result;
    }

    this.decrementPlatformCount(step.task.platform);

    if (this.eventBus) {
      this.eventBus.publish('workflow.step_completed', {
        stepId: step.id,
        platform: step.task.platform,
        durationMs: rec?.durationMs,
      });
    }
  }

  /**
   * Transition step to FAILED state
   */
  public markStepFailed(step: WorkflowStep, error: string): void {
    this.stepStatuses.set(step.id, 'FAILED');
    const rec = this.stepRecords.get(step.id);
    if (rec) {
      rec.status = 'FAILED';
      rec.completedAt = new Date();
      rec.durationMs = rec.startedAt
        ? rec.completedAt.getTime() - rec.startedAt.getTime()
        : 0;
      rec.error = error;
    }

    this.decrementPlatformCount(step.task.platform);

    if (this.eventBus) {
      this.eventBus.publish('workflow.step_failed', {
        stepId: step.id,
        platform: step.task.platform,
        error,
      });
    }
  }

  /**
   * Transition step to SKIPPED state
   */
  public markStepSkipped(stepId: string, reason: string): void {
    this.stepStatuses.set(stepId, 'SKIPPED');
    const rec = this.stepRecords.get(stepId);
    if (rec) {
      rec.status = 'SKIPPED';
      rec.error = `Skipped: ${reason}`;
    }
  }

  /**
   * Check if any steps are still in progress
   */
  public hasActiveSteps(): boolean {
    return Array.from(this.stepStatuses.values()).some((s) => s === 'RUNNING');
  }

  /**
   * Check if all steps in the DAG have reached a terminal state
   */
  public isWorkflowFinished(dag: WorkflowDAG): boolean {
    for (const stepId of dag.steps.keys()) {
      const status = this.stepStatuses.get(stepId);
      if (status === 'PENDING' || status === 'READY' || status === 'RUNNING' || status === 'AWAITING_APPROVAL') {
        return false;
      }
    }
    return true;
  }

  /**
   * Retrieve all step execution records
   */
  public getStepRecords(): StepExecutionRecord[] {
    return Array.from(this.stepRecords.values());
  }

  /**
   * Retrieve current status of a specific step
   */
  public getStepStatus(stepId: string): WorkflowStepStatus | undefined {
    return this.stepStatuses.get(stepId);
  }

  private decrementPlatformCount(platform: Platform | 'CROSS_PLATFORM'): void {
    if (platform !== 'CROSS_PLATFORM') {
      const current = this.runningByPlatform.get(platform) ?? 1;
      this.runningByPlatform.set(platform, Math.max(0, current - 1));
    }
  }
}
