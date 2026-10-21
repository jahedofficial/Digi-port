import { Platform } from '../types/account';
import { ClientMemoryProfile } from '../memory/types';

/**
 * Types of business decisions evaluated by Decision Engine
 */
export type DecisionType =
  | 'BUDGET_REALLOCATION'
  | 'CAMPAIGN_SCALING'
  | 'UNDERPERFORMER_PAUSE'
  | 'CREATIVE_REFRESH'
  | 'BID_STRATEGY_ADJUSTMENT'
  | 'AUDIENCE_EXPANSION'
  | 'CROSS_PLATFORM_REBALANCE';

/**
 * Deterministic Priority Levels
 */
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  CRITICAL: 1000,
  HIGH: 500,
  MEDIUM: 200,
  LOW: 50,
};

/**
 * Confidence Score with factor breakdown
 */
export interface ConfidenceScore {
  score: number; // 0.0 to 1.0
  sampleSizeFactor: number;
  varianceFactor: number;
  dataCompletenessFactor: number;
  explanation: string;
}

/**
 * Approval Requirement specification
 */
export interface ApprovalRequirement {
  requiresApproval: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'STANDARD' | 'INFO';
  reason?: string;
  thresholdTriggered?: string;
}

/**
 * Types of conflicts detected between recommendations
 */
export type ConflictType =
  | 'BUDGET_COMPETITION'
  | 'AUDIENCE_OVERLAP'
  | 'OPPOSING_ACTIONS'
  | 'POLICY_RESTRICTION';

/**
 * Detected conflict details and resolution
 */
export interface DetectedConflict {
  conflictId: string;
  type: ConflictType;
  affectedRecommendationIds: string[];
  description: string;
  resolved: boolean;
  resolutionStrategy:
    | 'PRIORITIZE_HIGHER_ROAS'
    | 'APPLY_PRO_RATA_CAP'
    | 'DROP_LOWER_CONFIDENCE'
    | 'CANCEL_OPPOSING';
  resolutionExplanation: string;
}

/**
 * Actionable Recommendation produced and ranked by the Decision Engine
 */
export interface ActionableRecommendation {
  id: string;
  title: string;
  type: DecisionType;
  platform: Platform | 'CROSS_PLATFORM';
  entityId?: string;
  entityType?: 'ACCOUNT' | 'CAMPAIGN' | 'AD_SET' | 'AD';
  currentValue: number | string;
  recommendedValue: number | string;
  projectedImpact: {
    expectedRoasDelta?: number;
    expectedCostSavings?: number;
    expectedConversionsDelta?: number;
  };
  priority: PriorityLevel;
  confidence: ConfidenceScore;
  approval: ApprovalRequirement;
  explanationBangla: string;
  explanationEnglish: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for Cross-Platform Budget Allocation Evaluation
 */
export interface CrossPlatformBudgetEvaluationInput {
  clientId: string;
  totalDailyBudget: number;
  platformMetrics: Array<{
    platform: Platform;
    currentSpend: number;
    roas: number;
    cpa: number;
    conversions: number;
    isConstrained?: boolean;
  }>;
  businessGoals: {
    targetRoasFloor: number;
    maxCpa: number;
    monthlyBudgetCap: number;
  };
  platformPreferences?: {
    preferredSplit?: Record<string, number>;
  };
}

/**
 * Result of Cross-Platform Budget Allocation Evaluation
 */
export interface CrossPlatformBudgetEvaluationResult {
  allocations: Array<{
    platform: Platform;
    currentBudget: number;
    recommendedBudget: number;
    deltaAmount: number;
    deltaPercentage: number;
    marginalRoas: number;
    rationale: string;
  }>;
  blendedProjectedRoas: number;
  requiresApproval: boolean;
  approvalReasons: string[];
  explanationBangla: string;
  explanationEnglish: string;
}

/**
 * Master Result returned by Decision Engine
 */
export interface DecisionEvaluationResult {
  evaluationId: string;
  timestamp: Date;
  clientId: string;
  rankedRecommendations: ActionableRecommendation[];
  detectedConflicts: DetectedConflict[];
  requiresApprovalCount: number;
  totalProjectedSavings: number;
  summaryBangla: string;
  summaryEnglish: string;
}

/**
 * Interfaces for Sub-Engines
 */

export interface IPriorityEngine {
  calculatePriority(
    recommendation: Omit<ActionableRecommendation, 'priority' | 'confidence' | 'approval'>,
    memoryProfile?: ClientMemoryProfile
  ): PriorityLevel;
}

export interface IConfidenceScorer {
  calculateConfidence(
    sampleSize: number,
    variance: number,
    dataCompleteness: number
  ): ConfidenceScore;
}

export interface IApprovalDetector {
  detectApproval(
    recommendation: Partial<ActionableRecommendation>,
    memoryProfile?: ClientMemoryProfile
  ): ApprovalRequirement;
}

export interface IConflictResolver {
  detectAndResolveConflicts(
    recommendations: ActionableRecommendation[],
    totalBudgetCap?: number
  ): {
    resolvedRecommendations: ActionableRecommendation[];
    conflicts: DetectedConflict[];
  };
}

export interface ICrossPlatformBudgetAllocator {
  evaluateAllocation(
    input: CrossPlatformBudgetEvaluationInput
  ): CrossPlatformBudgetEvaluationResult;
}

export interface IRecommendationRanker {
  rankRecommendations(
    recommendations: ActionableRecommendation[]
  ): ActionableRecommendation[];
}

export interface IDecisionEngine {
  evaluate(
    clientId: string,
    rawRecommendations: Array<Omit<ActionableRecommendation, 'priority' | 'confidence' | 'approval'>>,
    memoryProfile?: ClientMemoryProfile,
    totalBudgetCap?: number
  ): Promise<DecisionEvaluationResult>;

  evaluateCrossPlatformBudget(
    input: CrossPlatformBudgetEvaluationInput
  ): Promise<CrossPlatformBudgetEvaluationResult>;
}
