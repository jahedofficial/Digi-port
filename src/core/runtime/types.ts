import { Platform } from '../types/account';

export type SystemState = 
  | 'BOOTING'
  | 'VALIDATING_ENVIRONMENT'
  | 'VALIDATING_CREDENTIALS'
  | 'RUNNING_HEALTHY'
  | 'RUNNING_DEGRADED'
  | 'LOCKED_SAFE_MODE'
  | 'SHUTTING_DOWN'
  | 'TERMINATED';

export interface BootstrapOptions {
  customEnv?: Record<string, string | undefined>;
  enableSignalHandlers?: boolean;
  shutdownTimeoutMs?: number;
  skipPlatformValidation?: boolean;
}

export interface PlatformReadiness {
  platform: Platform;
  ready: boolean;
  message: string;
}

export interface SystemHealthReport {
  state: SystemState;
  uptimeSeconds: number;
  startedAt: Date;
  modules: Array<{ name: string; version: string }>;
  platforms: Record<Platform, boolean>;
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
}
