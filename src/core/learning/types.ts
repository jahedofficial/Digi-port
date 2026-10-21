import { Platform } from '../types/account';
import { UnifiedReportMetric } from '../types/metric';
import { ClientContext } from '../interfaces/agent.interface';
import { ClientMemoryProfile } from '../memory/types';
import { WorkflowExecutionResult } from '../workflow/types';

/**
 * The 5 Learning Engine Recommendation Categories (Phase 15 Blueprint)
 */
export type LearningCategory =
  | 'STRATEGY_IMPROVEMENT'
  | 'PLAYBOOK_IMPROVEMENT'
  | 'MEMORY_FEEDBACK'
  | 'KNOWLEDGE_IMPROVEMENT'
  | 'CROSS_PLATFORM_INSIGHT';

export type TargetEntityType =
  | 'STRATEGY'
  | 'PLAYBOOK'
  | 'CLIENT_MEMORY'
  | 'KNOWLEDGE_MODULE'
  | 'CROSS_PLATFORM_PORTFOLIO';

export type ValidationOutcomeType =
  | 'PROVEN_LIFT'
  | 'EFFICIENCY_GAIN'
  | 'RISK_REDUCTION'
  | 'BOTTLENECK_IDENTIFIED'
  | 'BENCHMARK_DRIFT';

/**
 * Standard Learning Recommendation Contract
 * Rule: Generates recommendations ONLY. Never modifies systems automatically.
 * All updates strictly require manual approval.
 */
export interface LearningRecommendation {
  id: string;
  category: LearningCategory;
  title: string;
  targetEntityId: string;
  targetEntityType: TargetEntityType;
  platform?: Platform | 'CROSS_PLATFORM';
  currentPattern: string;
  proposedPattern: string;
  confidenceScore: number; // 0.0 to 1.0
  evidence: {
    sampleSize: number;
    metricsObserved: Record<string, unknown>;
    validationOutcome: ValidationOutcomeType;
  };
  rationaleEnglish: string;
  rationaleBangla: string;
  requiresManualApproval: true; // Invariant: Must always be true
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  proposedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

/**
 * Validated execution outcome payload accepted by the Learning Engine
 * Rule: Learn ONLY from approved executions and validated outcomes.
 */
export interface ValidatedExecutionOutcome {
  workflowExecutionResult: WorkflowExecutionResult;
  metrics: UnifiedReportMetric[];
  clientContext: ClientContext;
  clientMemory?: ClientMemoryProfile;
  isValidatedOutcome: boolean;
  approvalConfirmed: boolean;
}

/**
 * Comprehensive Learning Insight Report
 */
export interface LearningEngineReport {
  reportId: string;
  generatedAt: Date;
  outcomesAnalyzedCount: number;
  totalRecommendationsGenerated: number;
  recommendationsByCategory: Record<LearningCategory, number>;
  recommendations: LearningRecommendation[];
  complianceDeclaration: {
    learnedOnlyFromApprovedOutcomes: boolean;
    automaticModificationsPrevented: boolean;
    manualApprovalRequiredForAll: true;
    zeroDirectPlatformCalls: true;
  };
}

/**
 * Sub-Engine Interfaces
 */

export interface IStrategyLearning {
  analyzeStrategy(outcome: ValidatedExecutionOutcome): Promise<LearningRecommendation[]>;
}

export interface IPlaybookImprovement {
  analyzePlaybook(outcome: ValidatedExecutionOutcome): Promise<LearningRecommendation[]>;
}

export interface IMemoryFeedback {
  analyzeMemoryFeedback(outcome: ValidatedExecutionOutcome): Promise<LearningRecommendation[]>;
}

export interface IKnowledgeRecommendations {
  analyzeKnowledge(outcome: ValidatedExecutionOutcome): Promise<LearningRecommendation[]>;
}

export interface ICrossPlatformInsights {
  analyzeCrossPlatform(outcome: ValidatedExecutionOutcome): Promise<LearningRecommendation[]>;
}

export interface ILearningEngine {
  ingestOutcome(outcome: ValidatedExecutionOutcome): Promise<LearningRecommendation[]>;
  generateLearningReport(clientId?: string): Promise<LearningEngineReport>;
  listRecommendations(filter?: {
    category?: LearningCategory;
    status?: 'PROPOSED' | 'APPROVED' | 'REJECTED';
    clientId?: string;
  }): LearningRecommendation[];
  approveRecommendation(recommendationId: string, reviewerId: string, notes?: string): Promise<LearningRecommendation>;
  rejectRecommendation(recommendationId: string, reviewerId: string, reason: string): Promise<LearningRecommendation>;
}
