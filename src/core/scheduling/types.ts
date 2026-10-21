import { AgentOperation } from '../interfaces/agent.interface';
import { WorkflowExecutionResult } from '../workflow/types';

/**
 * Supported scheduling types
 */
export type ScheduleType = 'CRON' | 'INTERVAL' | 'EVENT_TRIGGER' | 'ONE_OFF';

/**
 * Status of a schedule in the registry
 */
export type ScheduleStatus = 'ACTIVE' | 'PAUSED' | 'DISABLED' | 'COMPLETED';

/**
 * Execution status of an individual scheduled job
 */
export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

/**
 * Schedule definition registered in the system or loaded from assets/schedules/
 */
export interface ScheduleDefinition {
  $schema?: string;
  id: string;
  name: string;
  description: string;
  clientId: string; // Specific clientId or '*' for omnichannel/all clients
  type: ScheduleType;
  cronExpression?: string; // Standard 5-field cron (minute, hour, dayOfMonth, month, dayOfWeek)
  intervalSeconds?: number;
  eventPattern?: string; // e.g., 'roas.breach', 'tracking.error', 'budget.spike'
  targetWorkflowId: string; // Identifier of workflow template to execute
  targetOperation?: AgentOperation;
  parameters?: Record<string, unknown>;
  status: ScheduleStatus;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Record of a scheduled job instance
 */
export interface ScheduledJob {
  jobId: string;
  scheduleId: string;
  clientId: string;
  targetWorkflowId: string;
  status: JobStatus;
  triggerType: ScheduleType;
  triggeredAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  workflowResult?: WorkflowExecutionResult;
  error?: string;
  retryAttempts?: number;
}

/**
 * Incoming event payload for event-driven trigger execution
 */
export interface SystemEventTriggerPayload {
  eventId: string;
  eventType: string; // e.g., 'roas.floor_breach', 'pixel.event_drop', 'budget.daily_exhausted'
  clientId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

/**
 * Heartbeat monitor status
 */
export interface HeartbeatStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'STOPPED';
  pulseCount: number;
  lastPulseAt?: Date;
  activeJobsCount: number;
  memoryUsageMb: number;
  uptimeSeconds: number;
}

/**
 * Comprehensive Scheduler Status Report
 */
export interface SchedulerStatusReport {
  heartbeat: HeartbeatStatus;
  totalSchedules: number;
  activeSchedules: number;
  totalJobsExecuted: number;
  failedJobsCount: number;
  upcomingSchedules: Array<{
    scheduleId: string;
    name: string;
    nextRunAt?: Date;
    cronExpression?: string;
  }>;
}

/**
 * Interfaces for Phase 14 Sub-Engines
 */

export interface ICronParser {
  validate(expression: string): boolean;
  getNextRun(expression: string, fromDate?: Date): Date;
  isDue(expression: string, lastRunAt?: Date, now?: Date): boolean;
}

export interface IHeartbeat {
  start(): void;
  stop(): void;
  pulse(): Promise<HeartbeatStatus>;
  getStatus(): HeartbeatStatus;
}

export interface IEventTriggerManager {
  registerTrigger(schedule: ScheduleDefinition): void;
  handleEvent(event: SystemEventTriggerPayload): Promise<ScheduledJob[]>;
  unregisterTrigger(scheduleId: string): boolean;
}

export interface IScheduleRegistry {
  register(schedule: ScheduleDefinition): void;
  get(scheduleId: string): ScheduleDefinition | undefined;
  list(filter?: { clientId?: string; status?: ScheduleStatus }): ScheduleDefinition[];
  updateStatus(scheduleId: string, status: ScheduleStatus): boolean;
  updateLastRun(scheduleId: string, runTime: Date, nextRunTime?: Date): void;
  loadFromDirectory(dirPath?: string): Promise<ScheduleDefinition[]>;
  validate(schedule: Partial<ScheduleDefinition>): { isValid: boolean; errors: string[] };
}

export interface IJobScheduler {
  scheduleJob(schedule: ScheduleDefinition, triggerType: ScheduleType): Promise<ScheduledJob>;
  getJob(jobId: string): ScheduledJob | undefined;
  listJobs(filter?: { clientId?: string; status?: JobStatus }): ScheduledJob[];
  cancelJob(jobId: string): boolean;
}

export interface ISchedulingEngine {
  start(): Promise<void>;
  stop(): Promise<void>;
  tick(): Promise<ScheduledJob[]>;
  dispatchManualRun(scheduleId: string): Promise<ScheduledJob>;
  handleEvent(event: SystemEventTriggerPayload): Promise<ScheduledJob[]>;
  getStatus(): SchedulerStatusReport;
  getRegistry(): IScheduleRegistry;
  getJobScheduler(): IJobScheduler;
}
