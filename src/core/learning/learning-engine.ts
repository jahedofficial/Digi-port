import * as fs from 'fs/promises';
import * as path from 'path';
import { ILogger } from '../interfaces/logger.interface';
import { StructuredLogger } from '../logging/logger.service';
import { StrategyLearning } from './strategy-learning';
import { PlaybookImprovement } from './playbook-improvement';
import { MemoryFeedback } from './memory-feedback';
import { KnowledgeImprovementRecommendations } from './knowledge-recommendations';
import { CrossPlatformInsightRecommendations } from './cross-platform-insights';
import {
  ICrossPlatformInsights,
  IKnowledgeRecommendations,
  ILearningEngine,
  IMemoryFeedback,
  IPlaybookImprovement,
  IStrategyLearning,
  LearningCategory,
  LearningEngineReport,
  LearningRecommendation,
  ValidatedExecutionOutcome,
} from './types';

/**
 * Enterprise Learning Engine (Phase 15 Implementation)
 * Ingests strictly approved executions and validated outcomes, synthesizing
 * evidence-backed recommendations across Strategy, Playbooks, Memory, Knowledge, and Cross-Platform Portfolios.
 *
 * Invariant Rules:
 * 1. Learn ONLY from approved executions and validated outcomes.
 * 2. Generate recommendations ONLY. Zero automatic modifications.
 * 3. All updates require manual approval.
 * 4. Zero platform operations.
 * 5. Never bypass the CEO Agent.
 * 6. Store persisted outputs under /data/learning/.
 */
export class LearningEngine implements ILearningEngine {
  private readonly logger: ILogger;
  private readonly strategyLearning: IStrategyLearning;
  private readonly playbookImprovement: IPlaybookImprovement;
  private readonly memoryFeedback: IMemoryFeedback;
  private readonly knowledgeRecommendations: IKnowledgeRecommendations;
  private readonly crossPlatformInsights: ICrossPlatformInsights;

  private readonly recommendations = new Map<string, LearningRecommendation>();
  private outcomesAnalyzedCount: number = 0;
  private readonly storageDirectory: string;

  constructor(options?: {
    strategyLearning?: IStrategyLearning;
    playbookImprovement?: IPlaybookImprovement;
    memoryFeedback?: IMemoryFeedback;
    knowledgeRecommendations?: IKnowledgeRecommendations;
    crossPlatformInsights?: ICrossPlatformInsights;
    storageDirectory?: string;
    logger?: ILogger;
  }) {
    this.logger = options?.logger ?? new StructuredLogger('LearningEngine');
    this.strategyLearning = options?.strategyLearning ?? new StrategyLearning();
    this.playbookImprovement = options?.playbookImprovement ?? new PlaybookImprovement();
    this.memoryFeedback = options?.memoryFeedback ?? new MemoryFeedback();
    this.knowledgeRecommendations =
      options?.knowledgeRecommendations ?? new KnowledgeImprovementRecommendations();
    this.crossPlatformInsights =
      options?.crossPlatformInsights ?? new CrossPlatformInsightRecommendations();

    this.storageDirectory =
      options?.storageDirectory ?? path.resolve(process.cwd(), 'data', 'learning');
  }

  /**
   * Ingest validated execution outcome and run all 5 learning modules
   */
  public async ingestOutcome(
    outcome: ValidatedExecutionOutcome
  ): Promise<LearningRecommendation[]> {
    // Invariant Enforcement: Learn ONLY from approved executions and validated outcomes
    if (!outcome.approvalConfirmed) {
      this.logger.warn('[LearningEngine] Refusing unapproved execution outcome. Approval confirmed = false.');
      throw new Error('Learning Engine Invariant Violation: Outcome was not approved by human or CEO authority.');
    }

    if (!outcome.isValidatedOutcome) {
      this.logger.warn('[LearningEngine] Refusing unvalidated execution outcome. Validated = false.');
      throw new Error('Learning Engine Invariant Violation: Outcome metrics and status were not formally validated.');
    }

    if (outcome.workflowExecutionResult.state !== 'COMPLETED') {
      this.logger.warn(`[LearningEngine] Refusing non-completed workflow [${outcome.workflowExecutionResult.state}].`);
      throw new Error(`Learning Engine Invariant Violation: Cannot learn from state [${outcome.workflowExecutionResult.state}].`);
    }

    this.logger.info(
      `[LearningEngine] Ingesting approved outcome for client [${outcome.clientContext.clientId}] from workflow [${outcome.workflowExecutionResult.workflowId}]`
    );

    this.outcomesAnalyzedCount++;

    // Run all 5 sub-engines in parallel
    const [
      strategyRecs,
      playbookRecs,
      memoryRecs,
      knowledgeRecs,
      crossPlatformRecs,
    ] = await Promise.all([
      this.strategyLearning.analyzeStrategy(outcome),
      this.playbookImprovement.analyzePlaybook(outcome),
      this.memoryFeedback.analyzeMemoryFeedback(outcome),
      this.knowledgeRecommendations.analyzeKnowledge(outcome),
      this.crossPlatformInsights.analyzeCrossPlatform(outcome),
    ]);

    const newRecs: LearningRecommendation[] = [
      ...strategyRecs,
      ...playbookRecs,
      ...memoryRecs,
      ...knowledgeRecs,
      ...crossPlatformRecs,
    ];

    // Store in active registry and ensure invariant holds
    for (const rec of newRecs) {
      rec.requiresManualApproval = true; // Invariant guarantee
      this.recommendations.set(rec.id, rec);
    }

    // Persist to disk under data/learning/
    await this.persistToDisk();

    return newRecs;
  }

  /**
   * Generate comprehensive learning insight report
   */
  public async generateLearningReport(clientId?: string): Promise<LearningEngineReport> {
    const allRecs = this.listRecommendations({ clientId });

    const recommendationsByCategory: Record<LearningCategory, number> = {
      STRATEGY_IMPROVEMENT: 0,
      PLAYBOOK_IMPROVEMENT: 0,
      MEMORY_FEEDBACK: 0,
      KNOWLEDGE_IMPROVEMENT: 0,
      CROSS_PLATFORM_INSIGHT: 0,
    };

    for (const rec of allRecs) {
      recommendationsByCategory[rec.category]++;
    }

    const report: LearningEngineReport = {
      reportId: `lrn_rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      generatedAt: new Date(),
      outcomesAnalyzedCount: this.outcomesAnalyzedCount,
      totalRecommendationsGenerated: allRecs.length,
      recommendationsByCategory,
      recommendations: allRecs,
      complianceDeclaration: {
        learnedOnlyFromApprovedOutcomes: true,
        automaticModificationsPrevented: true,
        manualApprovalRequiredForAll: true,
        zeroDirectPlatformCalls: true,
      },
    };

    return report;
  }

  /**
   * List recommendations with optional category, status, and client filters
   */
  public listRecommendations(filter?: {
    category?: LearningCategory;
    status?: 'PROPOSED' | 'APPROVED' | 'REJECTED';
    clientId?: string;
  }): LearningRecommendation[] {
    let recs = Array.from(this.recommendations.values());

    if (filter?.category) {
      recs = recs.filter((r) => r.category === filter.category);
    }
    if (filter?.status) {
      recs = recs.filter((r) => r.status === filter.status);
    }
    if (filter?.clientId) {
      recs = recs.filter(
        (r) => r.targetEntityId === filter.clientId || r.targetEntityType !== 'CLIENT_MEMORY'
      );
    }

    return recs;
  }

  /**
   * Manually approve a recommendation (Rule: All updates require manual approval)
   */
  public async approveRecommendation(
    recommendationId: string,
    reviewerId: string,
    notes?: string
  ): Promise<LearningRecommendation> {
    const rec = this.recommendations.get(recommendationId);
    if (!rec) {
      throw new Error(`Recommendation [${recommendationId}] not found`);
    }

    rec.status = 'APPROVED';
    rec.reviewedAt = new Date();
    rec.reviewedBy = reviewerId;
    rec.reviewNotes = notes;

    this.logger.info(`[LearningEngine] Recommendation [${rec.id}] APPROVED by reviewer [${reviewerId}]`);
    await this.persistToDisk();
    return rec;
  }

  /**
   * Manually reject a recommendation
   */
  public async rejectRecommendation(
    recommendationId: string,
    reviewerId: string,
    reason: string
  ): Promise<LearningRecommendation> {
    const rec = this.recommendations.get(recommendationId);
    if (!rec) {
      throw new Error(`Recommendation [${recommendationId}] not found`);
    }

    rec.status = 'REJECTED';
    rec.reviewedAt = new Date();
    rec.reviewedBy = reviewerId;
    rec.reviewNotes = reason;

    this.logger.info(`[LearningEngine] Recommendation [${rec.id}] REJECTED by reviewer [${reviewerId}]`);
    await this.persistToDisk();
    return rec;
  }

  /**
   * Persist recommendations and audit snapshots into data/learning/
   */
  private async persistToDisk(): Promise<void> {
    try {
      await fs.mkdir(this.storageDirectory, { recursive: true });
      const filePath = path.join(this.storageDirectory, 'recommendations.json');
      const data = JSON.stringify(Array.from(this.recommendations.values()), null, 2);
      await fs.writeFile(filePath, data, 'utf-8');
    } catch (err) {
      this.logger.warn(`[LearningEngine] Failed to persist recommendations to disk: ${err}`);
    }
  }

  /**
   * Load existing recommendations from disk if available
   */
  public async loadFromDisk(): Promise<void> {
    try {
      const filePath = path.join(this.storageDirectory, 'recommendations.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content) as LearningRecommendation[];
      for (const rec of parsed) {
        this.recommendations.set(rec.id, rec);
      }
      this.logger.info(`[LearningEngine] Loaded ${parsed.length} recommendations from disk.`);
    } catch {
      // Clean slate if file not present
    }
  }
}
