import { Platform } from '../types/account';
import {
  AgentOperation,
  ClientContext,
  ExecutionPlan,
  ScheduledTask,
  SpecialistExecutionResult,
} from '../interfaces/agent.interface';

/**
 * State of an individual workflow execution step
 */
export type WorkflowStepStatus =
  | 'PENDING'
  | 'READY'
  | 'AWAITING_APPROVAL'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'ROLLED_BACK';

/**
 * Lifecycle state of the overall workflow
 */
export type WorkflowState =
  | 'DRAFT'
  | 'PLANNING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'ROLLED_BACK';

/**
 * Failure Recovery Policies
 */
export type RecoveryPolicy =
  | 'ABORT_WORKFLOW'
  | 'CONTINUE_ON_FAILURE'
  | 'ROLLBACK'
  | 'RETRY';

/**
 * Workflow Step definition within the DAG
 */
export interface WorkflowStep {
  id: string;
  name: string;
  task: ScheduledTask;
  dependencies: string[]; // Step IDs that must complete before this step can run
  requiresApproval?: boolean;
  timeoutMs?: number;
  recoveryPolicy?: RecoveryPolicy;
  retryConfig?: {
    maxRetries?: number;
    initialBackoffMs?: number;
    backoffMultiplier?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Workflow Template definition (JSON schema in assets/workflows/)
 */
export interface WorkflowDefinition {
  $schema?: string;
  id: string;
  name: string;
  version: string;
  description: string;
  stages: Array<{
    id: string;
    handler: string;
    timeoutMs?: number;
    requiresHuman?: boolean;
    dependencies?: string[];
  }>;
  platform?: Platform | 'CROSS_PLATFORM';
}

/**
 * Planned DAG Representation of a Workflow
 */
export interface WorkflowDAG {
  workflowId: string;
  steps: Map<string, WorkflowStep>;
  adjacencyList: Map<string, string[]>; // stepId -> downstream stepIds
  executionLayers: string[][]; // Topological layers: steps in each layer can execute concurrently
  totalSteps: number;
}

/**
 * Execution step audit trace record
 */
export interface StepExecutionRecord {
  stepId: string;
  stepName: string;
  platform: Platform | 'CROSS_PLATFORM';
  operation: AgentOperation;
  status: WorkflowStepStatus;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  retryAttempts: number;
  result?: SpecialistExecutionResult;
  error?: string;
}

/**
 * Final Structured Result returned by the Workflow Engine
 */
export interface WorkflowExecutionResult {
  workflowId: string;
  clientId: string;
  planId?: string;
  state: WorkflowState;
  startedAt: Date;
  completedAt: Date;
  totalDurationMs: number;
  totalSteps: number;
  completedStepsCount: number;
  failedStepsCount: number;
  stepRecords: StepExecutionRecord[];
  affectedEntities: SpecialistExecutionResult['affectedEntities'];
  summaryBangla: string;
  summaryEnglish: string;
  rollbackExecuted: boolean;
}

/**
 * Contract 7: IActionQueue Specification
 * Human-in-the-loop approval store for high-risk advertising operations
 */
export type ActionItemType =
  | 'CAMPAIGN_LAUNCH'
  | 'BUDGET_CHANGE'
  | 'PAUSE_AD'
  | 'TRACKING_UPDATE';

export type ActionItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface ActionItem {
  id: string;
  clientId: string;
  workflowId?: string;
  stepId?: string;
  type: ActionItemType;
  proposedChange: Record<string, unknown>;
  riskScore: number;
  status: ActionItemStatus;
  createdAt: Date;
  resolvedAt?: Date;
  reviewerId?: string;
  rejectionReason?: string;
}

export interface IActionQueue {
  enqueue(item: Omit<ActionItem, 'id' | 'status' | 'createdAt'>): Promise<ActionItem>;
  approve(id: string, reviewerId: string): Promise<ActionItem>;
  reject(id: string, reviewerId: string, reason: string): Promise<ActionItem>;
  listPending(clientId: string): Promise<ActionItem[]>;
  get(id: string): ActionItem | undefined;
}

/**
 * Rate limit & retry strategy specifications per platform
 */
export interface PlatformRateLimitProfile {
  platform: Platform;
  maxRequestsPerMinute: number;
  defaultBackoffMs: number;
  maxBackoffMs: number;
  rateLimitErrorPatterns: RegExp[];
}

export interface IRetryStrategy {
  isRetryable(error: unknown, platform: Platform): boolean;
  calculateBackoffMs(attempt: number, platform: Platform): number;
  executeWithRetry<T>(
    operation: () => Promise<T>,
    platform: Platform,
    stepId: string,
    maxRetries?: number
  ): Promise<T>;
}

/**
 * Recovery Strategy Interface
 */
export interface IRecoveryStrategy {
  determineRecovery(
    step: WorkflowStep,
    error: Error
  ): { policy: RecoveryPolicy; reason: string };
}

/**
 * Workflow Planner Interface
 */
export interface IWorkflowPlanner {
  buildWorkflowFromPlan(plan: ExecutionPlan): WorkflowDAG;
  validateDAG(dag: WorkflowDAG): { isValid: boolean; errors: string[] };
  computeTopologicalLayers(dag: WorkflowDAG): string[][];
}

/**
 * Master Workflow Engine Interface
 */
export interface IWorkflowEngine {
  createWorkflow(plan: ExecutionPlan): Promise<WorkflowDAG>;
  executeWorkflow(
    dag: WorkflowDAG,
    clientContext: ClientContext
  ): Promise<WorkflowExecutionResult>;
  getWorkflowStatus(workflowId: string): WorkflowState | undefined;
  getActionQueue(): IActionQueue;
  cancelWorkflow(workflowId: string, reason: string): Promise<boolean>;
}
