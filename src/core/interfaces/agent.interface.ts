import { Platform } from '../types/account';

export type AgentOperation =
  | 'AUDIT'
  | 'LAUNCH'
  | 'OPTIMIZE'
  | 'PAUSE'
  | 'VERIFY_TRACKING'
  | 'REPORT'
  | 'CRO_AUDIT'
  | 'CATALOG_AUDIT'
  | 'CREATIVE_ANALYSIS';

export interface ClientContext {
  clientId: string;
  workspaceId: string;
  brandVoice?: string;
  currency: string;
  activePlatforms: Platform[];
  targetAudience?: string;
  monthlyBudgetCap?: number;
  industry?: string;
}

export interface ScheduledTask {
  id: string;
  title: string;
  operation: AgentOperation;
  platform: Platform | 'CROSS_PLATFORM';
  agentName: string;
  parameters: Record<string, unknown>;
  requiresApproval: boolean;
  estimatedBudget?: number;
  order: number;
}

export interface ExecutionPlan {
  id: string;
  clientId: string;
  objective: string;
  targetPlatforms: Platform[];
  playbookId?: string;
  templateId?: string;
  tasks: ScheduledTask[];
  requiresApproval: boolean;
  estimatedBudget: number;
  createdAt: Date;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
}

export interface SpecialistExecutionResult {
  taskId: string;
  success: boolean;
  executionStatus: 'COMPLETED' | 'PENDING_APPROVAL' | 'FAILED';
  summaryBangla: string;
  summaryEnglish: string;
  affectedEntities: Array<{
    platform: string;
    entityType: 'CAMPAIGN' | 'AD_SET' | 'AD' | 'PIXEL';
    entityId: string;
    actionTaken: string;
  }>;
  metricsObserved?: Record<string, number | string>;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

export interface PlanExecutionSummary {
  planId: string;
  success: boolean;
  completedTasks: number;
  totalTasks: number;
  results: SpecialistExecutionResult[];
  summaryBangla: string;
  summaryEnglish: string;
  executedAt: Date;
}

export interface SpecialistCapability {
  agentName: string;
  supportedPlatforms: Platform[];
  supportedOperations: AgentOperation[];
  requiresApprovalByDefault: boolean;
}

export interface RecoveryAction {
  action: 'RETRY' | 'ABORT' | 'SKIP' | 'FALLBACK';
  retryAfterSeconds?: number;
  fallbackTaskId?: string;
  reason?: string;
}

export interface ISpecialistAgent {
  getCapabilities(): SpecialistCapability;
  validatePrerequisites(task: ScheduledTask, clientContext: ClientContext): Promise<{ isValid: boolean; errors: string[] }>;
  executeTask(task: ScheduledTask, clientContext: ClientContext): Promise<SpecialistExecutionResult>;
}

export interface IOpenRouterReasoningClient {
  reason(prompt: string, systemPrompt?: string): Promise<{ rawText: string; structuredJson?: Record<string, unknown> }>;
}

export interface ICEOAgent {
  parseObjective(prompt: string, clientContext: ClientContext): Promise<ExecutionPlan>;
  coordinateExecution(plan: ExecutionPlan, clientContext: ClientContext): Promise<PlanExecutionSummary>;
  registerSpecialist(agent: ISpecialistAgent): void;
  getRegisteredSpecialists(): SpecialistCapability[];
  submitForApproval(planId: string): Promise<boolean>;
  approvePlan(planId: string, approvedBy: string): Promise<boolean>;
  rejectPlan(planId: string, rejectedBy: string, reason: string): Promise<boolean>;
  handleSpecialistFailure(taskId: string, error: { code: string; message: string; recoverable: boolean }): Promise<RecoveryAction>;
}
