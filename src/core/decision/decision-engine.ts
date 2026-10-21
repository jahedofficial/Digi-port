import { ClientMemoryProfile } from '../memory/types';
import {
  ActionableRecommendation,
  CrossPlatformBudgetEvaluationInput,
  CrossPlatformBudgetEvaluationResult,
  DecisionEvaluationResult,
  IApprovalDetector,
  IConfidenceScorer,
  IConflictResolver,
  ICrossPlatformBudgetAllocator,
  IDecisionEngine,
  IPriorityEngine,
  IRecommendationRanker,
} from './types';
import { PriorityEngine } from './priority-engine';
import { ConfidenceScorer } from './confidence-scorer';
import { ApprovalDetector } from './approval-detector';
import { ConflictResolver } from './conflict-resolver';
import { CrossPlatformBudgetAllocator } from './cross-platform-budget-allocator';
import { RecommendationRanker } from './recommendation-ranker';

/**
 * Enterprise Production Decision Engine
 * Orchestrates priority evaluation, confidence scoring, approval gating,
 * conflict resolution, and recommendation ranking across all platforms.
 * 
 * RULE: Never executes platform operations; all operations must be submitted to the CEO Agent.
 */
export class DecisionEngine implements IDecisionEngine {
  private readonly priorityEngine: IPriorityEngine;
  private readonly confidenceScorer: IConfidenceScorer;
  private readonly approvalDetector: IApprovalDetector;
  private readonly conflictResolver: IConflictResolver;
  private readonly budgetAllocator: ICrossPlatformBudgetAllocator;
  private readonly ranker: IRecommendationRanker;

  constructor(options?: {
    priorityEngine?: IPriorityEngine;
    confidenceScorer?: IConfidenceScorer;
    approvalDetector?: IApprovalDetector;
    conflictResolver?: IConflictResolver;
    budgetAllocator?: ICrossPlatformBudgetAllocator;
    ranker?: IRecommendationRanker;
  }) {
    this.priorityEngine = options?.priorityEngine ?? new PriorityEngine();
    this.confidenceScorer = options?.confidenceScorer ?? new ConfidenceScorer();
    this.approvalDetector = options?.approvalDetector ?? new ApprovalDetector();
    this.conflictResolver = options?.conflictResolver ?? new ConflictResolver();
    this.budgetAllocator = options?.budgetAllocator ?? new CrossPlatformBudgetAllocator();
    this.ranker = options?.ranker ?? new RecommendationRanker();
  }

  /**
   * Evaluates raw candidate recommendations, resolves conflicts, scores, and ranks them.
   */
  public async evaluate(
    clientId: string,
    rawRecommendations: Array<
      Omit<ActionableRecommendation, 'priority' | 'confidence' | 'approval'> & {
        sampleSize?: number;
        metricVariance?: number;
        dataCompleteness?: number;
      }
    >,
    memoryProfile?: ClientMemoryProfile,
    totalBudgetCap?: number
  ): Promise<DecisionEvaluationResult> {
    const enriched: ActionableRecommendation[] = rawRecommendations.map((raw) => {
      // 1. Calculate Priority
      const priority = this.priorityEngine.calculatePriority(raw, memoryProfile);

      // 2. Calculate Confidence
      const confidence = this.confidenceScorer.calculateConfidence(
        raw.sampleSize ?? 40,
        raw.metricVariance ?? 0.2,
        raw.dataCompleteness ?? 1.0
      );

      // 3. Detect Approval Requirements
      const partialRec: Partial<ActionableRecommendation> = {
        ...raw,
        priority,
        confidence,
      };
      const approval = this.approvalDetector.detectApproval(partialRec, memoryProfile);

      return {
        ...raw,
        priority,
        confidence,
        approval,
      };
    });

    // 4. Conflict Detection & Resolution
    const { resolvedRecommendations, conflicts } =
      this.conflictResolver.detectAndResolveConflicts(enriched, totalBudgetCap);

    // 5. Deterministic Ranking
    const rankedRecommendations = this.ranker.rankRecommendations(resolvedRecommendations);

    // 6. Aggregate Metrics & Summaries
    const requiresApprovalCount = rankedRecommendations.filter((r) => r.approval.requiresApproval).length;
    const totalProjectedSavings = rankedRecommendations.reduce(
      (sum, r) => sum + (r.projectedImpact.expectedCostSavings ?? 0),
      0
    );

    const summaryBangla = `সিদ্ধান্ত মূল্যায়ন সম্পন্ন: ${rankedRecommendations.length}টি সুপারিশ র‍্যাংক করা হয়েছে (${requiresApprovalCount}টির জন্য মানব অনুমোদনের প্রয়োজন)। সম্ভাব্য মোট অপচয় সাশ্রয়: $${totalProjectedSavings}।`;
    const summaryEnglish = `Decision evaluation completed: ${rankedRecommendations.length} recommendations ranked (${requiresApprovalCount} require human approval). Total projected cost savings: $${totalProjectedSavings}.`;

    return {
      evaluationId: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      clientId,
      rankedRecommendations,
      detectedConflicts: conflicts,
      requiresApprovalCount,
      totalProjectedSavings,
      summaryBangla,
      summaryEnglish,
    };
  }

  /**
   * Evaluates capital distribution across Google, Meta, and TikTok based on marginal ROAS.
   */
  public async evaluateCrossPlatformBudget(
    input: CrossPlatformBudgetEvaluationInput
  ): Promise<CrossPlatformBudgetEvaluationResult> {
    return this.budgetAllocator.evaluateAllocation(input);
  }
}
