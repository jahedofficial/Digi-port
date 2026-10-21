import { Platform } from '../types/account';
import { ClientContext } from '../interfaces/agent.interface';
import { ClientMemoryProfile } from '../memory/types';

/**
 * Risk Severity Levels
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Policy Violation Record
 */
export interface PolicyViolation {
  platform: Platform | 'CROSS_PLATFORM';
  ruleId: string;
  category: 'PROHIBITED' | 'RESTRICTED' | 'EDITORIAL' | 'TRADEMARK' | 'SPECIAL_AD_CATEGORY';
  message: string;
  offendingTextOrElement?: string;
  remediationGuidance: string;
}

/**
 * Budget Guardrail Violation Record
 */
export interface BudgetGuardrailViolation {
  type:
    | 'DAILY_SCALING_EXCEEDED'
    | 'MONTHLY_CAP_EXCEEDED'
    | 'ZERO_BUDGET_DISALLOWED'
    | 'PLATFORM_CAP_EXCEEDED';
  currentAmount: number;
  requestedAmount: number;
  maxAllowedAmount: number;
  message: string;
}

/**
 * Individual Step in a Rollback Plan
 */
export interface RollbackAction {
  stepNumber: number;
  platform: Platform;
  targetEntityId: string;
  targetEntityType: 'CAMPAIGN' | 'AD_SET' | 'AD' | 'BUDGET';
  action: 'RESTORE_BUDGET' | 'RESTORE_STATUS' | 'DELETE_CREATED_ENTITY' | 'REVERT_CHANGES';
  previousState: Record<string, unknown>;
  instructionsBangla: string;
  instructionsEnglish: string;
}

/**
 * Deterministic Rollback Plan
 */
export interface RollbackPlan {
  planId: string;
  targetTaskId: string;
  createdAt: Date;
  actions: RollbackAction[];
  isAutomated: boolean;
}

/**
 * Proposed Action Input for Risk Assessment
 */
export interface ProposedAction {
  taskId: string;
  clientId: string;
  platform: Platform | 'CROSS_PLATFORM';
  operation: string; // 'LAUNCH' | 'OPTIMIZE' | 'PAUSE' | 'UPDATE_BUDGET' | 'SET_STATUS' | 'AUDIT'
  entityType?: 'CAMPAIGN' | 'AD_SET' | 'AD' | 'BUDGET' | 'PIXEL';
  entityId?: string;
  parameters: Record<string, unknown>;
  creativeContent?: {
    headlines?: string[];
    descriptions?: string[];
    bodyText?: string;
    targetUrl?: string;
  };
  currentBudget?: number;
  requestedBudget?: number;
  previousState?: Record<string, unknown>;
  observedRoas?: number;
}

/**
 * Result of Risk Assessment
 */
export interface RiskAssessmentResult {
  assessmentId: string;
  timestamp: Date;
  clientId: string;
  targetTaskId: string;
  riskScore: number; // 0 (Zero Risk) to 100 (Critical)
  riskLevel: RiskLevel;
  canAutoExecute: boolean;
  requiresApproval: boolean;
  approvalReasons: string[];
  policyViolations: PolicyViolation[];
  budgetViolations: BudgetGuardrailViolation[];
  rollbackPlan?: RollbackPlan;
  summaryBangla: string;
  summaryEnglish: string;
}

/**
 * Interface for Policy Validation
 */
export interface IPolicyValidator {
  validateContent(
    content: {
      headlines?: string[];
      descriptions?: string[];
      bodyText?: string;
      targetUrl?: string;
    },
    platform: Platform | 'CROSS_PLATFORM'
  ): { isValid: boolean; violations: PolicyViolation[] };
}

/**
 * Interface for Budget Protection
 */
export interface IBudgetProtector {
  validateBudget(
    currentBudget: number,
    requestedBudget: number,
    monthlyBudgetCap: number,
    projectedCurrentMonthSpend?: number
  ): { isCompliant: boolean; violations: BudgetGuardrailViolation[] };
}

/**
 * Interface for Rollback Planning
 */
export interface IRollbackPlanner {
  generateRollbackPlan(action: ProposedAction): RollbackPlan | undefined;
}

/**
 * Master Risk Engine Interface
 */
export interface IRiskEngine {
  assessRisk(
    proposedAction: ProposedAction,
    clientContext: ClientContext,
    memoryProfile?: ClientMemoryProfile
  ): Promise<RiskAssessmentResult>;

  validatePolicy(
    creativeContent: {
      headlines?: string[];
      descriptions?: string[];
      bodyText?: string;
      targetUrl?: string;
    },
    platform: Platform | 'CROSS_PLATFORM'
  ): Promise<{ isValid: boolean; violations: PolicyViolation[] }>;
}
