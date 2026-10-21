import { IEventBus } from '../interfaces/event-bus.interface';
import { ILogger } from '../interfaces/logger.interface';
import { StructuredLogger } from '../logging/logger.service';
import { HeartbeatStatus, IHeartbeat } from './types';

/**
 * System Heartbeat Monitor
 * Emits periodic system health pulses, checks memory footprints,
 * monitors active background tasks, and acts as a dead-man switch.
 */
export class Heartbeat implements IHeartbeat {
  private readonly logger: ILogger;
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private pulseCount: number = 0;
  private lastPulseAt?: Date;
  private startedAt?: Date;
  private activeJobsCountGetter: () => number;

  constructor(options?: {
    intervalMs?: number;
    activeJobsCountGetter?: () => number;
    logger?: ILogger;
    eventBus?: IEventBus;
  }) {
    this.logger = options?.logger ?? new StructuredLogger('Heartbeat');
    this.activeJobsCountGetter = options?.activeJobsCountGetter ?? (() => 0);
    this.intervalMs = options?.intervalMs ?? 30000;
    this.eventBus = options?.eventBus;
  }

  private intervalMs: number;
  private eventBus?: IEventBus;

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startedAt = new Date();
    this.logger.info(`[Heartbeat] Starting system watchdog pulse (Interval: ${this.intervalMs}ms)`);

    this.timer = setInterval(async () => {
      try {
        await this.pulse();
      } catch (err) {
        this.logger.error(`[Heartbeat] Pulse execution error: ${err}`);
      }
    }, this.intervalMs);

    // Initial immediate pulse
    this.pulse().catch(() => {});
  }

  public stop(): void {
    if (!this.isRunning) return;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.logger.info('[Heartbeat] Stopped system watchdog pulse');
  }

  public async pulse(): Promise<HeartbeatStatus> {
    this.pulseCount++;
    this.lastPulseAt = new Date();

    const mem = process.memoryUsage();
    const memoryUsageMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
    const activeJobs = this.activeJobsCountGetter();
    const uptimeSeconds = this.startedAt
      ? Math.floor((this.lastPulseAt.getTime() - this.startedAt.getTime()) / 1000)
      : 0;

    const status: HeartbeatStatus['status'] =
      memoryUsageMb > 1024 ? 'DEGRADED' : 'HEALTHY';

    const heartbeatStatus: HeartbeatStatus = {
      status: this.isRunning ? status : 'STOPPED',
      pulseCount: this.pulseCount,
      lastPulseAt: this.lastPulseAt,
      activeJobsCount: activeJobs,
      memoryUsageMb,
      uptimeSeconds,
    };

    if (this.eventBus) {
      await this.eventBus.publish('heartbeat.tick', heartbeatStatus);
    }

    return heartbeatStatus;
  }

  public getStatus(): HeartbeatStatus {
    const mem = process.memoryUsage();
    const memoryUsageMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
    const uptimeSeconds = this.startedAt
      ? Math.floor((Date.now() - this.startedAt.getTime()) / 1000)
      : 0;

    return {
      status: this.isRunning ? (memoryUsageMb > 1024 ? 'DEGRADED' : 'HEALTHY') : 'STOPPED',
      pulseCount: this.pulseCount,
      lastPulseAt: this.lastPulseAt,
      activeJobsCount: this.activeJobsCountGetter(),
      memoryUsageMb,
      uptimeSeconds,
    };
  }
}
