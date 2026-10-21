import { ExecutionPlan } from '../interfaces/agent.interface';
import { IEventBus } from '../interfaces/event-bus.interface';
import { ILogger } from '../interfaces/logger.interface';
import { StructuredLogger } from '../logging/logger.service';
import { IWorkflowEngine } from '../workflow/types';
import {
  IJobScheduler,
  IScheduleRegistry,
  JobStatus,
  ScheduleDefinition,
  ScheduledJob,
  ScheduleType,
} from './types';

/**
 * Enterprise Job Scheduler
 * Dispatches scheduled and event-driven jobs strictly through the WorkflowEngine.
 * Enforces Blueprint rules: zero direct platform calls, strictly delegated to WorkflowEngine.
 */
export class JobScheduler implements IJobScheduler {
  private readonly logger: ILogger;
  private readonly jobs = new Map<string, ScheduledJob>();

  constructor(
    private readonly workflowEngine: IWorkflowEngine,
    private readonly scheduleRegistry: IScheduleRegistry,
    private readonly eventBus?: IEventBus,
    logger?: ILogger
  ) {
    this.logger = logger ?? new StructuredLogger('JobScheduler');
  }

  /**
   * Schedule and immediately execute a workflow job for a schedule definition
   */
  public async scheduleJob(
    schedule: ScheduleDefinition,
    triggerType: ScheduleType
  ): Promise<ScheduledJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const triggeredAt = new Date();

    const job: ScheduledJob = {
      jobId,
      scheduleId: schedule.id,
      clientId: schedule.clientId,
      targetWorkflowId: schedule.targetWorkflowId,
      status: 'QUEUED',
      triggerType,
      triggeredAt,
      retryAttempts: 0,
    };

    this.jobs.set(jobId, job);
    this.logger.info(
      `[JobScheduler] Enqueued job [${jobId}] for schedule [${schedule.name}] (${triggerType})`
    );

    if (this.eventBus) {
      await this.eventBus.publish('job.queued', {
        jobId,
        scheduleId: schedule.id,
        clientId: schedule.clientId,
      });
    }

    // Execute asynchronously
    this.executeJob(job, schedule).catch((err) => {
      this.logger.error(`[JobScheduler] Unhandled job error [${jobId}]: ${err}`);
    });

    return job;
  }

  /**
   * Execute job through the WorkflowEngine
   */
  private async executeJob(
    job: ScheduledJob,
    schedule: ScheduleDefinition
  ): Promise<void> {
    job.status = 'RUNNING';
    job.startedAt = new Date();

    if (this.eventBus) {
      await this.eventBus.publish('job.started', {
        jobId: job.jobId,
        scheduleId: job.scheduleId,
      });
    }

    try {
      // Create minimal compliant ExecutionPlan for the scheduled workflow
      const plan: ExecutionPlan = {
        id: `plan_${job.jobId}`,
        clientId: schedule.clientId,
        objective: `Scheduled execution of ${schedule.name}`,
        targetPlatforms: ['GOOGLE', 'META', 'TIKTOK'],
        tasks: [
          {
            id: `task_${job.jobId}_1`,
            title: schedule.name,
            operation: schedule.targetOperation ?? 'AUDIT',
            platform: 'CROSS_PLATFORM',
            agentName: this.resolveAgentForOperation(schedule.targetOperation ?? 'AUDIT'),
            parameters: schedule.parameters ?? {},
            requiresApproval: false,
            order: 1,
          },
        ],
        requiresApproval: false,
        estimatedBudget: 0,
        createdAt: new Date(),
        status: 'APPROVED',
      };

      // Compile DAG and delegate execution strictly to WorkflowEngine
      const dag = await this.workflowEngine.createWorkflow(plan);
      const result = await this.workflowEngine.executeWorkflow(dag, {
        clientId: schedule.clientId,
        workspaceId: 'ws_scheduled',
        currency: 'USD',
        activePlatforms: ['GOOGLE', 'META', 'TIKTOK'],
      });

      job.status = result.state === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
      job.completedAt = new Date();
      job.durationMs = job.completedAt.getTime() - job.startedAt.getTime();
      job.workflowResult = result;

      // Update schedule registry timestamps
      this.scheduleRegistry.updateLastRun(schedule.id, job.completedAt);

      if (this.eventBus) {
        await this.eventBus.publish(
          job.status === 'COMPLETED' ? 'job.completed' : 'job.failed',
          {
            jobId: job.jobId,
            scheduleId: job.scheduleId,
            durationMs: job.durationMs,
          }
        );
      }
    } catch (err) {
      job.status = 'FAILED';
      job.completedAt = new Date();
      job.durationMs = job.startedAt
        ? job.completedAt.getTime() - job.startedAt.getTime()
        : 0;
      job.error = err instanceof Error ? err.message : String(err);

      this.scheduleRegistry.updateLastRun(schedule.id, job.completedAt);

      if (this.eventBus) {
        await this.eventBus.publish('job.failed', {
          jobId: job.jobId,
          scheduleId: job.scheduleId,
          error: job.error,
        });
      }
    }
  }

  /**
   * Resolve specialist agent name based on the planned operation
   */
  private resolveAgentForOperation(op: string): string {
    switch (op) {
      case 'AUDIT':
        return 'AuditSpecialistAgent';
      case 'LAUNCH':
        return 'CampaignSpecialistAgent';
      case 'OPTIMIZE':
        return 'OptimizationSpecialistAgent';
      case 'REPORT':
        return 'ReportingSpecialistAgent';
      case 'CRO_AUDIT':
        return 'CroSpecialistAgent';
      case 'CATALOG_AUDIT':
        return 'MerchantCatalogSpecialistAgent';
      case 'VERIFY_TRACKING':
        return 'TrackingSpecialistAgent';
      case 'CREATIVE_ANALYSIS':
        return 'CreativeSpecialistAgent';
      default:
        return 'AuditSpecialistAgent';
    }
  }

  /**
   * Retrieve a job record by ID
   */
  public getJob(jobId: string): ScheduledJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * List jobs with optional filters
   */
  public listJobs(filter?: { clientId?: string; status?: JobStatus }): ScheduledJob[] {
    let result = Array.from(this.jobs.values());

    if (filter?.clientId) {
      result = result.filter((j) => j.clientId === filter.clientId);
    }
    if (filter?.status) {
      result = result.filter((j) => j.status === filter.status);
    }

    return result;
  }

  /**
   * Cancel a queued job
   */
  public cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'QUEUED') return false;

    job.status = 'SKIPPED';
    job.error = 'Cancelled by administrator before execution';
    return true;
  }

  /**
   * Count currently active running jobs
   */
  public getActiveJobsCount(): number {
    return Array.from(this.jobs.values()).filter((j) => j.status === 'RUNNING').length;
  }
}
