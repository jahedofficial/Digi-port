import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Platform } from '../types/account';
import { IPlatformAdapterRegistry } from '../adapters/types';
import { LoggerService } from '../logging/logger.service';

export interface LivenessStatus {
  status: 'UP' | 'DOWN';
  uptimeSeconds: number;
  pid: number;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  systemLoad: number[];
  freeMemoryMb: number;
}

export interface ReadinessStatus {
  status: 'READY' | 'NOT_READY';
  checks: {
    diskWritable: boolean;
    dataDirExists: boolean;
    learningDirExists: boolean;
  };
  details: string[];
}

export interface PlatformHealthStatus {
  overall: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  platforms: Record<
    Platform,
    {
      connected: boolean;
      latencyMs: number;
      error?: string;
    }
  >;
}

export class HealthMonitorService {
  private readonly logger: LoggerService;
  private readonly adapterRegistry?: IPlatformAdapterRegistry;
  private readonly startTime: number;

  constructor(adapterRegistry?: IPlatformAdapterRegistry, logger?: LoggerService) {
    this.adapterRegistry = adapterRegistry;
    this.logger = logger || new LoggerService('HealthMonitorService');
    this.startTime = Date.now();
  }

  /**
   * Liveness Probe: checks if the Node.js runtime process is alive and responsive.
   */
  getLiveness(): LivenessStatus {
    const mem = process.memoryUsage();
    return {
      status: 'UP',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      pid: process.pid,
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      },
      systemLoad: os.loadavg(),
      freeMemoryMb: Math.round(os.freemem() / (1024 * 1024)),
    };
  }

  /**
   * Readiness Probe: verifies if the application is ready to accept production requests.
   */
  getReadiness(workspaceRoot = process.cwd()): ReadinessStatus {
    const dataDir = path.join(workspaceRoot, 'data');
    const learningDir = path.join(workspaceRoot, 'data', 'learning');
    const details: string[] = [];

    const dataDirExists = fs.existsSync(dataDir);
    const learningDirExists = fs.existsSync(learningDir);

    let diskWritable = false;
    try {
      const testFile = path.join(dataDir, `.health_${Date.now()}.tmp`);
      fs.writeFileSync(testFile, 'health_check', 'utf8');
      fs.unlinkSync(testFile);
      diskWritable = true;
    } catch (err: any) {
      details.push(`Disk write check failed: ${err.message}`);
    }

    const isReady = diskWritable && dataDirExists;

    return {
      status: isReady ? 'READY' : 'NOT_READY',
      checks: {
        diskWritable,
        dataDirExists,
        learningDirExists,
      },
      details,
    };
  }

  /**
   * Platform Connectivity Probe: non-destructive health checks for Google, Meta, and TikTok.
   */
  async getPlatformHealth(): Promise<PlatformHealthStatus> {
    const platforms: Record<Platform, { connected: boolean; latencyMs: number; error?: string }> = {
      GOOGLE: { connected: false, latencyMs: 0 },
      META: { connected: false, latencyMs: 0 },
      TIKTOK: { connected: false, latencyMs: 0 },
    };

    if (!this.adapterRegistry) {
      return { overall: 'DOWN', platforms };
    }

    const verifyResults = await this.adapterRegistry.verifyAllConnections();

    let connectedCount = 0;
    for (const [platform, res] of Object.entries(verifyResults)) {
      const p = platform as Platform;
      platforms[p] = {
        connected: res.connected,
        latencyMs: res.latencyMs || 10,
        error: res.error,
      };
      if (res.connected) connectedCount++;
    }

    const overall = connectedCount === 3 ? 'HEALTHY' : connectedCount > 0 ? 'DEGRADED' : 'DOWN';

    return {
      overall,
      platforms,
    };
  }
}
