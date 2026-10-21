import * as fs from 'fs/promises';
import * as path from 'path';
import { CronParser } from './cron-parser';
import {
  IScheduleRegistry,
  ScheduleDefinition,
  ScheduleStatus,
} from './types';

/**
 * Schedule Registry Repository
 * Manages recurring cron jobs, interval timers, and event trigger definitions.
 */
export class ScheduleRegistry implements IScheduleRegistry {
  private readonly schedules = new Map<string, ScheduleDefinition>();
  private readonly cronParser: CronParser;

  constructor(cronParser?: CronParser) {
    this.cronParser = cronParser ?? new CronParser();
  }

  /**
   * Validate schedule definition against Blueprint specifications
   */
  public validate(schedule: Partial<ScheduleDefinition>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!schedule.id || typeof schedule.id !== 'string') {
      errors.push('Missing or invalid "id"');
    }
    if (!schedule.name || typeof schedule.name !== 'string') {
      errors.push('Missing or invalid "name"');
    }
    if (!schedule.clientId || typeof schedule.clientId !== 'string') {
      errors.push('Missing or invalid "clientId"');
    }
    if (!schedule.type || !['CRON', 'INTERVAL', 'EVENT_TRIGGER', 'ONE_OFF'].includes(schedule.type)) {
      errors.push(`Invalid schedule "type": ${schedule.type}`);
    }
    if (!schedule.targetWorkflowId || typeof schedule.targetWorkflowId !== 'string') {
      errors.push('Missing or invalid "targetWorkflowId"');
    }

    if (schedule.type === 'CRON') {
      if (!schedule.cronExpression || !this.cronParser.validate(schedule.cronExpression)) {
        errors.push(`Invalid or missing "cronExpression": ${schedule.cronExpression}`);
      }
    } else if (schedule.type === 'INTERVAL') {
      if (!schedule.intervalSeconds || schedule.intervalSeconds <= 0) {
        errors.push(`Invalid or missing "intervalSeconds": ${schedule.intervalSeconds}`);
      }
    } else if (schedule.type === 'EVENT_TRIGGER') {
      if (!schedule.eventPattern || typeof schedule.eventPattern !== 'string') {
        errors.push(`Invalid or missing "eventPattern": ${schedule.eventPattern}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Register a new or updated schedule definition
   */
  public register(schedule: ScheduleDefinition): void {
    const validation = this.validate(schedule);
    if (!validation.isValid) {
      throw new Error(`Schedule registration failed: ${validation.errors.join('; ')}`);
    }

    // Compute initial nextRunAt if CRON and not set
    let nextRunAt = schedule.nextRunAt;
    if (schedule.type === 'CRON' && schedule.cronExpression && !nextRunAt && schedule.status === 'ACTIVE') {
      try {
        nextRunAt = this.cronParser.getNextRun(schedule.cronExpression);
      } catch {
        // Fallback
      }
    }

    this.schedules.set(schedule.id, {
      ...schedule,
      nextRunAt,
      createdAt: schedule.createdAt ?? new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Get schedule by ID
   */
  public get(scheduleId: string): ScheduleDefinition | undefined {
    return this.schedules.get(scheduleId);
  }

  /**
   * List schedules with optional filters
   */
  public list(filter?: { clientId?: string; status?: ScheduleStatus }): ScheduleDefinition[] {
    let result = Array.from(this.schedules.values());

    if (filter?.clientId && filter.clientId !== '*') {
      result = result.filter(
        (s) => s.clientId === filter.clientId || s.clientId === '*'
      );
    }

    if (filter?.status) {
      result = result.filter((s) => s.status === filter.status);
    }

    return result;
  }

  /**
   * Update status of a schedule (e.g. pause/activate)
   */
  public updateStatus(scheduleId: string, status: ScheduleStatus): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    schedule.status = status;
    schedule.updatedAt = new Date();

    if (status === 'ACTIVE' && schedule.type === 'CRON' && schedule.cronExpression) {
      schedule.nextRunAt = this.cronParser.getNextRun(schedule.cronExpression);
    }

    return true;
  }

  /**
   * Update last execution time and calculate next execution time
   */
  public updateLastRun(scheduleId: string, runTime: Date, nextRunTime?: Date): void {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return;

    schedule.lastRunAt = runTime;
    schedule.updatedAt = new Date();

    if (nextRunTime) {
      schedule.nextRunAt = nextRunTime;
    } else if (schedule.type === 'CRON' && schedule.cronExpression) {
      schedule.nextRunAt = this.cronParser.getNextRun(schedule.cronExpression, runTime);
    } else if (schedule.type === 'INTERVAL' && schedule.intervalSeconds) {
      schedule.nextRunAt = new Date(runTime.getTime() + schedule.intervalSeconds * 1000);
    }
  }

  /**
   * Load schedule definitions from JSON files on disk
   */
  public async loadFromDirectory(dirPath?: string): Promise<ScheduleDefinition[]> {
    const resolvedPath =
      dirPath ?? path.resolve(process.cwd(), 'assets', 'schedules');

    try {
      const files = await fs.readdir(resolvedPath);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      for (const file of jsonFiles) {
        const fullPath = path.join(resolvedPath, file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const parsed = JSON.parse(content) as ScheduleDefinition;

        if (parsed.id && parsed.name && parsed.type) {
          const validation = this.validate(parsed);
          if (validation.isValid) {
            this.register(parsed);
          }
        }
      }
    } catch {
      // In case directory read fails, proceed gracefully
    }

    return Array.from(this.schedules.values());
  }
}
