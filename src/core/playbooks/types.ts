import { Platform } from '../types/account';

export interface PlaybookExecutionStep {
  step: number;
  name: string;
  specialistAgent: string;
  action: string;
  requiredApprovals?: boolean;
  parameters?: Record<string, unknown>;
}

export interface PlaybookFailureHandling {
  retryStrategy: string;
  alertChannel: string;
  maxRetries?: number;
  onUnrecoverable: 'ABORT' | 'ROLLBACK' | 'NOTIFY';
}

export interface Playbook {
  id: string;
  name: string;
  version: string;
  targetPlatforms: Platform[];
  purpose: string;
  triggerConditions: string[];
  prerequisites: string[];
  executionSteps: PlaybookExecutionStep[];
  specialistAgents: string[];
  requiredApprovals: boolean;
  expectedOutputs: string[];
  successCriteria: string[];
  failureHandling: PlaybookFailureHandling;
  rollbackStrategy: string;
  supportedCampaignTypes?: {
    google?: string[];
    meta?: string[];
    tiktok?: string[];
  };
}

export interface IPlaybookRegistry {
  register(playbook: Playbook): void;
  get(id: string): Playbook | undefined;
  getByPlatform(platform: Platform): Playbook[];
  getAll(): Playbook[];
  has(id: string): boolean;
  validatePlaybook(playbook: unknown): { valid: boolean; errors: string[] };
}

export interface IWorkflowSelector {
  selectPlaybook(operation: string, platforms: Platform[], context?: Record<string, unknown>): Playbook | undefined;
}
