import { IEventBus } from '../interfaces/event-bus.interface';
import { ILogger } from '../interfaces/logger.interface';
import { StructuredLogger } from '../logging/logger.service';
import { IWorkflowEngine } from '../workflow/types';
import { CronParser } from './cron-parser';
import { EventTriggerManager } from './event-trigger-manager';
import { Heartbeat } from './heartbeat';
import { JobScheduler } from './job-scheduler';
import { ScheduleRegistry } from './schedule-registry';
import {
  IJobScheduler,
  IScheduleRegistry,
  ISchedulingEngine,
  ScheduledJob,
  SchedulerStatusReport,
  SystemEventTriggerPayload,
} from './types';

/**
 * Enterprise Scheduling Engine
 * Master scheduler uniting Heartbeat, Cron Scheduler, Job Scheduler,
 * Event Trigger Manager, and Schedule Registry.
 */
export class SchedulingEngine implements ISchedulingEngine {
  private readonly logger: ILogger;
  private readonly cronParser: CronParser;
  private readonly registry: ScheduleRegistry;
  private readonly jobScheduler: JobScheduler;
  private readonly eventTriggerManager: EventTriggerManager;
  private readonly heartbeat: Heartbeat;
  private tickTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(options?: {
    workflowEngine?: IWorkflowEngine;
    registry?: ScheduleRegistry;
    jobScheduler?: JobScheduler;
    eventTriggerManager?: EventTriggerManager;
    heartbeat?: Heartbeat;
    cronParser?: CronParser;
    logger?: ILogger;
    eventBus?: IEventBus;
  }) {
    this.logger = options?.logger ?? new StructuredLogger('SchedulingEngine');
    this.cronParser = options?.cronParser ?? new CronParser();
    this.registry = options?.registry ?? new ScheduleRegistry(this.cronParser);

    if (options?.jobScheduler) {
      this.jobScheduler = options.jobScheduler;
    } else if (options?.workflowEngine) {
      this.jobScheduler = new JobScheduler(
        options.workflowEngine,
        this.registry,
        options?.eventBus,
        this.logger
      );
    } else {
      throw new Error(
        'SchedulingEngine requires either a WorkflowEngine or JobScheduler instance'
      );
    }

    this.eventTriggerManager =
      options?.eventTriggerManager ??
      new EventTriggerManager(this.jobScheduler);

    this.heartbeat =
      options?.heartbeat ??
      new Heartbeat({
        intervalMs: 30000,
        activeJobsCountGetter: () => this.jobScheduler.getActiveJobsCount(),
        logger: this.logger,
        eventBus: options?.eventBus,
      });
  }

  /**
   * Start scheduler loop and watchdog heartbeat
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.logger.info('[SchedulingEngine] Starting enterprise scheduler daemon...');

    this.heartbeat.start();

    // Register active event triggers from registry
    for (const schedule of this.registry.list({ status: 'ACTIVE' })) {
      if (schedule.type === 'EVENT_TRIGGER') {
        this.eventTriggerManager.registerTrigger(schedule);
      }
    }

    // Schedule tick loop (every 60s)
    this.tickTimer = setInterval(async () => {
      try {
        await this.tick();
      } catch (err) {
        this.logger.error(`[SchedulingEngine] Error during tick execution: ${err}`);
      }
    }, 60000);

    // Initial check
    await this.tick();
  }

  /**
   * Stop scheduler loop and watchdog heartbeat
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }

    this.heartbeat.stop();
    this.isRunning = false;
    this.logger.info('[SchedulingEngine] Stopped enterprise scheduler daemon');
  }

  /**
   * Evaluate all registered schedules and dispatch those that are due
   */
  public async tick(): Promise<ScheduledJob[]> {
    const activeSchedules = this.registry.list({ status: 'ACTIVE' });
    const dispatchedJobs: ScheduledJob[] = [];
    const now = new Date();

    for (const schedule of activeSchedules) {
      let isDue = false;

      if (schedule.type === 'CRON' && schedule.cronExpression) {
        isDue = this.cronParser.isDue(schedule.cronExpression, schedule.lastRunAt, now);
      } else if (schedule.type === 'INTERVAL' && schedule.intervalSeconds) {
        const lastRun = schedule.lastRunAt ? schedule.lastRunAt.getTime() : 0;
        isDue = now.getTime() - lastRun >= schedule.intervalSeconds * 1000;
      }

      if (isDue) {
        this.logger.info(
          `[SchedulingEngine] Schedule [${schedule.name}] (${schedule.id}) is due; dispatching job...`
        );
        const job = await this.jobScheduler.scheduleJob(schedule, schedule.type);
        dispatchedJobs.push(job);
      }
    }

    return dispatchedJobs;
  }

  /**
   * Manually dispatch a registered schedule immediately
   */
  public async dispatchManualRun(scheduleId: string): Promise<ScheduledJob> {
    const schedule = this.registry.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule [${scheduleId}] not found in registry`);
    }

    this.logger.info(
      `[SchedulingEngine] Manual execution triggered for schedule [${schedule.name}]`
    );
    return this.jobScheduler.scheduleJob(schedule, 'ONE_OFF');
  }

  /**
   * Trigger workflows reactively based on a system event
   */
  public async handleEvent(
    event: SystemEventTriggerPayload
  ): Promise<ScheduledJob[]> {
    return this.eventTriggerManager.handleEvent(event);
  }

  /**
   * Generate comprehensive scheduler health and status report
   */
  public getStatus(): SchedulerStatusReport {
    const heartbeat = this.heartbeat.getStatus();
    const allSchedules = this.registry.list();
    const activeSchedules = allSchedules.filter((s) => s.status === 'ACTIVE');
    const allJobs = this.jobScheduler.listJobs();
    const failedJobs = allJobs.filter((j) => j.status === 'FAILED');

    const upcomingSchedules = activeSchedules
      .filter((s) => s.type === 'CRON' && s.nextRunAt)
      .map((s) => ({
        scheduleId: s.id,
        name: s.name,
        nextRunAt: s.nextRunAt,
        cronExpression: s.cronExpression,
      }))
      .sort((a, b) => (a.nextRunAt?.getTime() ?? 0) - (b.nextRunAt?.getTime() ?? 0))
      .slice(0, 10);

    return {
      heartbeat,
      totalSchedules: allSchedules.length,
      activeSchedules: activeSchedules.length,
      totalJobsExecuted: allJobs.length,
      failedJobsCount: failedJobs.length,
      upcomingSchedules,
    };
  }

  public getRegistry(): IScheduleRegistry {
    return this.registry;
  }

  public getJobScheduler(): IJobScheduler {
    return this.jobScheduler;
  }

  public getEventTriggerManager(): EventTriggerManager {
    return this.eventTriggerManager;
  }

  public getHeartbeat(): Heartbeat {
    return this.heartbeat;
  }
}
