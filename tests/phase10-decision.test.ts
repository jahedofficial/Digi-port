import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  DecisionEngine,
  PriorityEngine,
  ConfidenceScorer,
  ApprovalDetector,
  ConflictResolver,
  CrossPlatformBudgetAllocator,
  RecommendationRanker,
  ClientMemoryProfile,
  ActionableRecommendation,
  CrossPlatformBudgetEvaluationInput,
} from '../src/core';

describe('Phase 10 — Decision Engine Unit Tests', () => {
  const sampleMemoryProfile: ClientMemoryProfile = {
    clientId: 'client_retail_001',
    businessGoals: {
      targetRoasFloor: 3.0,
      maxAllowableCpa: 45.0,
      monthlyBudgetCeiling: 30000,
    },
    approvalRules: {
      autoApproveBudgetThreshold: 200,
      requireHumanForCreativeDelete: true,
      requireHumanForAudienceDelete: true,
      highRiskRoasProtectionThreshold: 3.0,
      requireApprovalForNewCampaign: true,
    },
    rawEntries: [],
    updatedAt: new Date(),
  };

  // --------------------------------------------------------------------------
  // 1. Priority Engine
  // --------------------------------------------------------------------------
  describe('1. PriorityEngine', () => {
    const priorityEngine = new PriorityEngine();

    it('should assign CRITICAL priority when cost savings exceed $500', () => {
      const priority = priorityEngine.calculatePriority({
        id: 'rec_01',
        title: 'Pause bleeding search ad group',
        type: 'UNDERPERFORMER_PAUSE',
        platform: 'GOOGLE',
        currentValue: 1.2,
        recommendedValue: 'PAUSED',
        projectedImpact: { expectedCostSavings: 650 },
        explanationBangla: 'অতিরিক্ত অপচয় রোধ',
        explanationEnglish: 'Prevent high waste',
      }, sampleMemoryProfile);

      assert.strictEqual(priority, 'CRITICAL');
    });

    it('should assign CRITICAL priority when ROAS is less than 50% of target floor', () => {
      const priority = priorityEngine.calculatePriority({
        id: 'rec_02',
        title: 'Pause severely underperforming campaign',
        type: 'UNDERPERFORMER_PAUSE',
        platform: 'META',
        currentValue: 1.1, // Target floor is 3.0, 1.1 is < 1.5
        recommendedValue: 'PAUSED',
        projectedImpact: { expectedCostSavings: 200 },
        explanationBangla: 'আরওএএস লক্ষ্যমাত্রার নিচে',
        explanationEnglish: 'ROAS far below floor',
      }, sampleMemoryProfile);

      assert.strictEqual(priority, 'CRITICAL');
    });

    it('should assign HIGH priority for budget reallocations and moderate savings', () => {
      const priority = priorityEngine.calculatePriority({
        id: 'rec_03',
        title: 'Rebalance budget to top performing channel',
        type: 'BUDGET_REALLOCATION',
        platform: 'CROSS_PLATFORM',
        currentValue: 100,
        recommendedValue: 180,
        projectedImpact: { expectedCostSavings: 160 },
        explanationBangla: 'বাজেট পুনর্বন্টন',
        explanationEnglish: 'Budget reallocation',
      }, sampleMemoryProfile);

      assert.strictEqual(priority, 'HIGH');
    });

    it('should assign MEDIUM for creative refresh and LOW for minor housekeeping', () => {
      const priorityCreative = priorityEngine.calculatePriority({
        id: 'rec_04',
        title: 'Rotate fatigued video creative',
        type: 'CREATIVE_REFRESH',
        platform: 'TIKTOK',
        currentValue: 'active',
        recommendedValue: 'rotate',
        projectedImpact: {},
        explanationBangla: 'ক্রিয়েটিভ ক্লান্তি',
        explanationEnglish: 'Creative fatigue',
      }, sampleMemoryProfile);
      assert.strictEqual(priorityCreative, 'MEDIUM');

      const priorityMinor = priorityEngine.calculatePriority({
        id: 'rec_05',
        title: 'Minor bid adjustment',
        type: 'BID_STRATEGY_ADJUSTMENT',
        platform: 'GOOGLE',
        currentValue: 1.5,
        recommendedValue: 1.55,
        projectedImpact: { expectedCostSavings: 15 },
        explanationBangla: 'সামান্য বিড পরিবর্তন',
        explanationEnglish: 'Minor bid change',
      }, sampleMemoryProfile);
      assert.strictEqual(priorityMinor, 'LOW');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Confidence Scorer
  // --------------------------------------------------------------------------
  describe('2. ConfidenceScorer', () => {
    const scorer = new ConfidenceScorer();

    it('should calculate high confidence score for large sample size and low variance', () => {
      const result = scorer.calculateConfidence(65, 0.1, 1.0);

      assert.ok(result.score >= 0.85);
      assert.strictEqual(result.sampleSizeFactor, 1.0);
      assert.strictEqual(result.varianceFactor, 1.0);
      assert.ok(result.explanation.includes('High statistical confidence'));
    });

    it('should calculate lower confidence score for small sample size and high volatility', () => {
      const result = scorer.calculateConfidence(4, 0.65, 0.7);

      assert.ok(result.score < 0.5);
      assert.ok(result.explanation.includes('Low confidence') || result.explanation.includes('Moderate'));
    });
  });

  // --------------------------------------------------------------------------
  // 3. Approval Detector
  // --------------------------------------------------------------------------
  describe('3. ApprovalDetector', () => {
    const approvalDetector = new ApprovalDetector();

    it('should require approval when budget adjustment exceeds ±20% scaling guardrail', () => {
      const req = approvalDetector.detectApproval({
        type: 'CAMPAIGN_SCALING',
        currentValue: 100,
        recommendedValue: 150, // +50% change (exceeds 20%)
      }, sampleMemoryProfile);

      assert.strictEqual(req.requiresApproval, true);
      assert.strictEqual(req.severity, 'HIGH');
      assert.strictEqual(req.thresholdTriggered, 'SCALING_GUARDRAIL_20_PERCENT');
    });

    it('should require CRITICAL approval when attempting to pause high-ROAS campaign', () => {
      const req = approvalDetector.detectApproval({
        type: 'UNDERPERFORMER_PAUSE',
        currentValue: 3.5, // >= 3.0 protection threshold
        recommendedValue: 'PAUSED',
      }, sampleMemoryProfile);

      assert.strictEqual(req.requiresApproval, true);
      assert.strictEqual(req.severity, 'CRITICAL');
      assert.strictEqual(req.thresholdTriggered, 'HIGH_ROAS_PROTECTION_GUARDRAIL');
    });

    it('should not require approval for minor budget change within auto-approve threshold', () => {
      const req = approvalDetector.detectApproval({
        type: 'CAMPAIGN_SCALING',
        currentValue: 500,
        recommendedValue: 550, // +10% change, delta $50 (< $200 threshold)
      }, sampleMemoryProfile);

      assert.strictEqual(req.requiresApproval, false);
      assert.strictEqual(req.severity, 'INFO');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Conflict Resolver
  // --------------------------------------------------------------------------
  describe('4. ConflictResolver', () => {
    const resolver = new ConflictResolver();

    it('should resolve opposing actions on the same entity by prioritizing higher confidence', () => {
      const recs: ActionableRecommendation[] = [
        {
          id: 'rec_pause',
          title: 'Pause Underperforming Campaign A',
          type: 'UNDERPERFORMER_PAUSE',
          platform: 'META',
          entityId: 'camp_meta_1',
          currentValue: 1.1,
          recommendedValue: 'PAUSED',
          projectedImpact: { expectedCostSavings: 250 },
          priority: 'CRITICAL',
          confidence: { score: 0.92, sampleSizeFactor: 1.0, varianceFactor: 0.8, dataCompletenessFactor: 1.0, explanation: 'High' },
          approval: { requiresApproval: false, severity: 'INFO' },
          explanationBangla: 'পজ',
          explanationEnglish: 'Pause',
        },
        {
          id: 'rec_scale',
          title: 'Scale Campaign A Budget',
          type: 'CAMPAIGN_SCALING',
          platform: 'META',
          entityId: 'camp_meta_1',
          currentValue: 100,
          recommendedValue: 120,
          projectedImpact: { expectedRoasDelta: 0.2 },
          priority: 'MEDIUM',
          confidence: { score: 0.55, sampleSizeFactor: 0.45, varianceFactor: 0.6, dataCompletenessFactor: 0.8, explanation: 'Medium' },
          approval: { requiresApproval: false, severity: 'INFO' },
          explanationBangla: 'স্কেল',
          explanationEnglish: 'Scale',
        },
      ];

      const result = resolver.detectAndResolveConflicts(recs);
      assert.strictEqual(result.conflicts.length, 1);
      assert.strictEqual(result.conflicts[0].type, 'OPPOSING_ACTIONS');
      assert.strictEqual(result.resolvedRecommendations.length, 1);
      // Retained the critical pause directive and dropped conflicting scale directive
      assert.strictEqual(result.resolvedRecommendations[0].id, 'rec_pause');
    });

    it('should resolve budget competition when total requests exceed budget ceiling', () => {
      const recs: ActionableRecommendation[] = [
        {
          id: 'rec_google_scale',
          title: 'Scale Google Ads',
          type: 'CAMPAIGN_SCALING',
          platform: 'GOOGLE',
          entityId: 'camp_g_1',
          currentValue: 200,
          recommendedValue: 400, // +$200
          projectedImpact: { expectedRoasDelta: 0.8 },
          priority: 'HIGH',
          confidence: { score: 0.85, sampleSizeFactor: 0.9, varianceFactor: 0.8, dataCompletenessFactor: 1.0, explanation: 'High' },
          approval: { requiresApproval: true, severity: 'HIGH' },
          explanationBangla: '',
          explanationEnglish: '',
        },
        {
          id: 'rec_meta_scale',
          title: 'Scale Meta Ads',
          type: 'CAMPAIGN_SCALING',
          platform: 'META',
          entityId: 'camp_m_1',
          currentValue: 200,
          recommendedValue: 400, // +$200
          projectedImpact: { expectedRoasDelta: 0.3 },
          priority: 'HIGH',
          confidence: { score: 0.85, sampleSizeFactor: 0.9, varianceFactor: 0.8, dataCompletenessFactor: 1.0, explanation: 'High' },
          approval: { requiresApproval: true, severity: 'HIGH' },
          explanationBangla: '',
          explanationEnglish: '',
        },
      ];

      // Total requested increase = $400, but cap is only $250
      const result = resolver.detectAndResolveConflicts(recs, 250);
      assert.strictEqual(result.conflicts.length, 1);
      assert.strictEqual(result.conflicts[0].type, 'BUDGET_COMPETITION');

      // Top ROAS delta (Google +0.8) gets full requested increase of $200
      const googleRec = result.resolvedRecommendations.find((r) => r.id === 'rec_google_scale');
      assert.strictEqual(googleRec?.recommendedValue, 400);

      // Remaining budget ($50) allocated to Meta
      const metaRec = result.resolvedRecommendations.find((r) => r.id === 'rec_meta_scale');
      assert.strictEqual(metaRec?.recommendedValue, 250); // 200 + 50
    });
  });

  // --------------------------------------------------------------------------
  // 5. Cross-Platform Budget Allocation Evaluation
  // --------------------------------------------------------------------------
  describe('5. CrossPlatformBudgetAllocator', () => {
    const allocator = new CrossPlatformBudgetAllocator();

    it('should allocate more capital to higher ROAS platforms within scaling guardrail', () => {
      const input: CrossPlatformBudgetEvaluationInput = {
        clientId: 'client_retail_001',
        totalDailyBudget: 1000,
        platformMetrics: [
          { platform: 'META', currentSpend: 400, roas: 5.2, cpa: 22, conversions: 80 },
          { platform: 'GOOGLE', currentSpend: 400, roas: 2.1, cpa: 48, conversions: 25 },
          { platform: 'TIKTOK', currentSpend: 200, roas: 3.4, cpa: 30, conversions: 35 },
        ],
        businessGoals: {
          targetRoasFloor: 3.0,
          maxCpa: 45,
          monthlyBudgetCap: 30000,
        },
      };

      const result = allocator.evaluateAllocation(input);

      assert.strictEqual(result.allocations.length, 3);
      assert.ok(result.blendedProjectedRoas >= 3.0);
      assert.ok(result.explanationBangla.includes('META'));
      assert.ok(result.explanationEnglish.includes('META'));

      // Meta (ROAS 5.2) should receive positive delta bounded by +20% guardrail
      const metaAlloc = result.allocations.find((a) => a.platform === 'META');
      assert.ok(metaAlloc!.deltaPercentage > 0);
      assert.ok(metaAlloc!.deltaPercentage <= 20);

      // Google (ROAS 2.1, below floor) should receive spend reduction
      const googleAlloc = result.allocations.find((a) => a.platform === 'GOOGLE');
      assert.ok(googleAlloc!.deltaPercentage < 0);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Recommendation Ranker
  // --------------------------------------------------------------------------
  describe('6. RecommendationRanker', () => {
    const ranker = new RecommendationRanker();

    it('should rank recommendations deterministically by priority, financial impact, and confidence', () => {
      const recs: ActionableRecommendation[] = [
        {
          id: 'rec_medium',
          title: 'Medium optimization',
          type: 'CREATIVE_REFRESH',
          platform: 'META',
          currentValue: '',
          recommendedValue: '',
          projectedImpact: { expectedCostSavings: 50 },
          priority: 'MEDIUM',
          confidence: { score: 0.8, sampleSizeFactor: 0.8, varianceFactor: 0.8, dataCompletenessFactor: 1.0, explanation: '' },
          approval: { requiresApproval: false, severity: 'INFO' },
          explanationBangla: '',
          explanationEnglish: '',
        },
        {
          id: 'rec_critical',
          title: 'Critical bleed stop',
          type: 'UNDERPERFORMER_PAUSE',
          platform: 'GOOGLE',
          currentValue: '',
          recommendedValue: '',
          projectedImpact: { expectedCostSavings: 800 },
          priority: 'CRITICAL',
          confidence: { score: 0.95, sampleSizeFactor: 1.0, varianceFactor: 0.9, dataCompletenessFactor: 1.0, explanation: '' },
          approval: { requiresApproval: true, severity: 'CRITICAL' },
          explanationBangla: '',
          explanationEnglish: '',
        },
        {
          id: 'rec_high',
          title: 'High priority scale',
          type: 'CAMPAIGN_SCALING',
          platform: 'TIKTOK',
          currentValue: '',
          recommendedValue: '',
          projectedImpact: { expectedCostSavings: 200 },
          priority: 'HIGH',
          confidence: { score: 0.85, sampleSizeFactor: 0.9, varianceFactor: 0.8, dataCompletenessFactor: 1.0, explanation: '' },
          approval: { requiresApproval: true, severity: 'HIGH' },
          explanationBangla: '',
          explanationEnglish: '',
        },
      ];

      const ranked = ranker.rankRecommendations(recs);
      assert.strictEqual(ranked[0].id, 'rec_critical');
      assert.strictEqual(ranked[1].id, 'rec_high');
      assert.strictEqual(ranked[2].id, 'rec_medium');
    });
  });

  // --------------------------------------------------------------------------
  // 7. Master Decision Engine Orchestration
  // --------------------------------------------------------------------------
  describe('7. Master Decision Engine Orchestration', () => {
    const engine = new DecisionEngine();

    it('should evaluate raw recommendations, enrich with scores, resolve conflicts, and return structured result', async () => {
      const rawRecs = [
        {
          id: 'raw_01',
          title: 'Pause Underperforming Google AdSet',
          type: 'UNDERPERFORMER_PAUSE' as const,
          platform: 'GOOGLE' as const,
          entityId: 'adset_g_1',
          currentValue: 1.2,
          recommendedValue: 'PAUSED',
          projectedImpact: { expectedCostSavings: 550 },
          explanationBangla: 'গুগল অ্যাডসেট অপচয় বন্ধ',
          explanationEnglish: 'Stop Google AdSet spend bleed',
          sampleSize: 45,
          metricVariance: 0.15,
        },
        {
          id: 'raw_02',
          title: 'Rebalance Meta Budget to Advantage+',
          type: 'BUDGET_REALLOCATION' as const,
          platform: 'META' as const,
          entityId: 'camp_m_adv',
          currentValue: 200,
          recommendedValue: 230, // +15% within 20% guardrail
          projectedImpact: { expectedRoasDelta: 0.6, expectedCostSavings: 100 },
          explanationBangla: 'মেটা বাজেট পুনর্বন্টন',
          explanationEnglish: 'Rebalance Meta budget',
          sampleSize: 60,
          metricVariance: 0.1,
        },
      ];

      const evaluation = await engine.evaluate('client_retail_001', rawRecs, sampleMemoryProfile);

      assert.strictEqual(evaluation.clientId, 'client_retail_001');
      assert.strictEqual(evaluation.rankedRecommendations.length, 2);
      assert.strictEqual(evaluation.totalProjectedSavings, 650);
      assert.ok(evaluation.rankedRecommendations[0].confidence.score >= 0.8);
      assert.strictEqual(evaluation.rankedRecommendations[0].priority, 'CRITICAL');
      assert.ok(evaluation.summaryBangla.includes('সিদ্ধান্ত'));
      assert.ok(evaluation.summaryEnglish.includes('Decision evaluation'));
    });
  });
});
