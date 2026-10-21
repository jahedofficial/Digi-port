import {
  IEventTriggerManager,
  IJobScheduler,
  ScheduleDefinition,
  ScheduledJob,
  SystemEventTriggerPayload,
} from './types';

/**
 * Event Trigger Manager
 * Bridges system event emissions to reactive workflow executions.
 */
export class EventTriggerManager implements IEventTriggerManager {
  private readonly triggerMap = new Map<string, ScheduleDefinition>();

  constructor(private readonly jobScheduler: IJobScheduler) {}

  /**
   * Register an event trigger schedule
   */
  public registerTrigger(schedule: ScheduleDefinition): void {
    if (schedule.type !== 'EVENT_TRIGGER' || !schedule.eventPattern) {
      throw new Error(
        `Schedule [${schedule.id}] is not configured as an EVENT_TRIGGER`
      );
    }
    this.triggerMap.set(schedule.id, schedule);
  }

  /**
   * Unregister an event trigger
   */
  public unregisterTrigger(scheduleId: string): boolean {
    return this.triggerMap.delete(scheduleId);
  }

  /**
   * Evaluate an incoming system event and dispatch matching workflow jobs
   */
  public async handleEvent(
    event: SystemEventTriggerPayload
  ): Promise<ScheduledJob[]> {
    const matchedSchedules: ScheduleDefinition[] = [];

    for (const schedule of this.triggerMap.values()) {
      if (schedule.status !== 'ACTIVE') {
        continue;
      }

      // Check client match
      if (schedule.clientId !== '*' && schedule.clientId !== event.clientId) {
        continue;
      }

      // Check event pattern match (supports exact match or prefix wildcard, e.g. "roas.*")
      if (this.matchesPattern(schedule.eventPattern!, event.eventType)) {
        matchedSchedules.push(schedule);
      }
    }

    const dispatchedJobs: ScheduledJob[] = [];

    for (const schedule of matchedSchedules) {
      const job = await this.jobScheduler.scheduleJob(schedule, 'EVENT_TRIGGER');
      dispatchedJobs.push(job);
    }

    return dispatchedJobs;
  }

  /**
   * Match event type against trigger pattern (supports wildcards)
   */
  private matchesPattern(pattern: string, eventType: string): boolean {
    if (pattern === '*' || pattern === eventType) {
      return true;
    }

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return eventType.startsWith(prefix);
    }

    return false;
  }

  /**
   * List all registered event triggers
   */
  public listTriggers(): ScheduleDefinition[] {
    return Array.from(this.triggerMap.values());
  }
}
