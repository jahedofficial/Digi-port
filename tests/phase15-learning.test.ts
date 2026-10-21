import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  LearningEngine,
  StrategyLearning,
  PlaybookImprovement,
  MemoryFeedback,
  KnowledgeImprovementRecommendations,
  CrossPlatformInsightRecommendations,
  ValidatedExecutionOutcome,
  ClientContext,
  ClientMemoryProfile,
  UnifiedReportMetric,
  WorkflowExecutionResult,
} from '../src/core';

describe('Phase 15 — Learning Engine Unit Tests', () => {
  const sampleClientContext: ClientContext = {
    clientId: 'client_luxury_brand',
    workspaceId: 'ws_luxury',
    currency: 'USD',
    activePlatforms: ['GOOGLE', 'META', 'TIKTOK'],
    monthlyBudgetCap: 50000,
    industry: 'ecommerce',
  };

  const sampleClientMemory: ClientMemoryProfile = {
    clientId: 'client_luxury_brand',
    businessGoals: {
      targetRoasFloor: 3.0,
      maxAllowableCpa: 60,
      monthlyBudgetCeiling: 50000,
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

  const sampleMetrics: UnifiedReportMetric[] = [
    {
      entityId: 'camp_google_search_pmax',
      entityType: 'CAMPAIGN',
      platform: 'GOOGLE',
      date: '2026-10-21',
      currency: 'USD',
      spend: 2500,
      impressions: 60000,
      clicks: 2200,
      conversions: 80,
      conversionValue: 12000, // 4.8x ROAS, $31.25 CPA
      ctr: 3.67,
      cpc: 1.14,
      cpa: 31.25,
      roas: 4.8,
    },
    {
      entityId: 'camp_meta_advantage',
      entityType: 'CAMPAIGN',
      platform: 'META',
      date: '2026-10-21',
      currency: 'USD',
      spend: 2000,
      impressions: 90000,
      clicks: 1800,
      conversions: 30,
      conversionValue: 4200, // 2.1x ROAS, $66.67 CPA
      ctr: 2.0,
      cpc: 1.11,
      cpa: 66.67,
      roas: 2.1,
    },
    {
      entityId: 'camp_tiktok_spark',
      entityType: 'CAMPAIGN',
      platform: 'TIKTOK',
      date: '2026-10-21',
      currency: 'USD',
      spend: 1000,
      impressions: 70000,
      clicks: 1200,
      conversions: 25,
      conversionValue: 3500, // 3.5x ROAS
      ctr: 1.71,
      cpc: 0.83,
      cpa: 40.0,
      roas: 3.5,
      videoHookRate: 0.16, // Low hook rate (fatigue)
    },
  ];

  const sampleWorkflowResult: WorkflowExecutionResult = {
    workflowId: 'wf_audit_optimization_validated_01',
    clientId: 'client_luxury_brand',
    state: 'COMPLETED',
    startedAt: new Date(Date.now() - 45000),
    completedAt: new Date(),
    totalDurationMs: 45000,
    totalSteps: 5,
    completedStepsCount: 5,
    failedStepsCount: 0,
    stepRecords: [
      {
        stepId: 'step_google_audit',
        stepName: 'Google Search & PMax Diagnostic Audit',
        platform: 'GOOGLE',
        operation: 'AUDIT',
        status: 'COMPLETED',
        durationMs: 8000,
        retryAttempts: 0,
      },
      {
        stepId: 'step_meta_capi_audit',
        stepName: 'Meta CAPI & Pixel Diagnostic Audit',
        platform: 'META',
        operation: 'AUDIT',
        status: 'COMPLETED',
        durationMs: 18000, // High latency step
        retryAttempts: 2, // Incurred retries
      },
      {
        stepId: 'step_tiktok_hook_audit',
        stepName: 'TikTok Creative & Hook Rate Velocity Audit',
        platform: 'TIKTOK',
        operation: 'AUDIT',
        status: 'COMPLETED',
        durationMs: 9000,
        retryAttempts: 0,
      },
      {
        stepId: 'step_optimization',
        stepName: 'Cross-Platform Budget Rebalancing',
        platform: 'CROSS_PLATFORM',
        operation: 'OPTIMIZE',
        status: 'COMPLETED',
        durationMs: 5000,
        retryAttempts: 0,
      },
    ],
    affectedEntities: [],
    summaryBangla: 'অডিট সফলভাবে সম্পন্ন।',
    summaryEnglish: 'Audit completed successfully.',
    rollbackExecuted: false,
  };

  const validOutcome: ValidatedExecutionOutcome = {
    workflowExecutionResult: sampleWorkflowResult,
    metrics: sampleMetrics,
    clientContext: sampleClientContext,
    clientMemory: sampleClientMemory,
    isValidatedOutcome: true,
    approvalConfirmed: true,
  };

  // --------------------------------------------------------------------------
  // 1. Strategy Learning
  // --------------------------------------------------------------------------
  describe('1. StrategyLearning', () => {
    const strategyLearning = new StrategyLearning();

    it('should recommend tROAS scaling when high ROAS and volume are validated', async () => {
      const recs = await strategyLearning.analyzeStrategy(validOutcome);

      assert.ok(recs.length >= 1);
      const scalingRec = recs.find((r) => r.title.includes('Target ROAS Scaling'));
      assert.ok(scalingRec);
      assert.strictEqual(scalingRec.category, 'STRATEGY_IMPROVEMENT');
      assert.strictEqual(scalingRec.targetEntityType, 'STRATEGY');
      assert.strictEqual(scalingRec.requiresManualApproval, true);
      assert.strictEqual(scalingRec.status, 'PROPOSED');
      assert.ok(scalingRec.confidenceScore >= 0.85);
      assert.ok(scalingRec.rationaleBangla.includes('লাভজনক'));
    });

    it('should recommend creative rotation sprint when TikTok hook rate drops', async () => {
      const recs = await strategyLearning.analyzeStrategy(validOutcome);

      const creativeRec = recs.find((r) => r.title.includes('Creative Sprint Rotation'));
      assert.ok(creativeRec);
      assert.strictEqual(creativeRec.category, 'STRATEGY_IMPROVEMENT');
      assert.strictEqual(creativeRec.platform, 'TIKTOK');
      assert.strictEqual(creativeRec.requiresManualApproval, true);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Playbook Improvement
  // --------------------------------------------------------------------------
  describe('2. PlaybookImprovement', () => {
    const playbookImprovement = new PlaybookImprovement();

    it('should recommend rate-limit pre-check for steps with retries', async () => {
      const recs = await playbookImprovement.analyzePlaybook(validOutcome);

      const retryRec = recs.find((r) => r.title.includes('Rate-Limit Pre-Check'));
      assert.ok(retryRec);
      assert.strictEqual(retryRec.category, 'PLAYBOOK_IMPROVEMENT');
      assert.strictEqual(retryRec.targetEntityType, 'PLAYBOOK');
      assert.strictEqual(retryRec.requiresManualApproval, true);
    });

    it('should recommend parallelizing or decoupling steps with high duration', async () => {
      const recs = await playbookImprovement.analyzePlaybook(validOutcome);

      const latencyRec = recs.find((r) => r.title.includes('Parallelize'));
      assert.ok(latencyRec);
      assert.strictEqual(latencyRec.category, 'PLAYBOOK_IMPROVEMENT');
      assert.strictEqual(latencyRec.requiresManualApproval, true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Memory Feedback
  // --------------------------------------------------------------------------
  describe('3. MemoryFeedback', () => {
    const memoryFeedback = new MemoryFeedback();

    it('should propose raising ROAS floor when performance consistently beats baseline', async () => {
      const recs = await memoryFeedback.analyzeMemoryFeedback(validOutcome);

      const roasRec = recs.find((r) => r.title.includes('ROAS Floor'));
      assert.ok(roasRec);
      assert.strictEqual(roasRec.category, 'MEMORY_FEEDBACK');
      assert.strictEqual(roasRec.targetEntityType, 'CLIENT_MEMORY');
      assert.strictEqual(roasRec.requiresManualApproval, true);
      assert.strictEqual(roasRec.status, 'PROPOSED');
      assert.ok(roasRec.proposedPattern.includes('3.6')); // 3.0 * 1.2
    });

    it('should propose tightening CPA ceiling when acquisition cost is low', async () => {
      // Create high-conversion scenario where CPA ($31.25) is below 75% of maxCpa ($60)
      const recs = await memoryFeedback.analyzeMemoryFeedback(validOutcome);

      const cpaRec = recs.find((r) => r.title.includes('CPA Ceiling'));
      assert.ok(cpaRec);
      assert.strictEqual(cpaRec.category, 'MEMORY_FEEDBACK');
      assert.strictEqual(cpaRec.requiresManualApproval, true);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Knowledge Recommendations
  // --------------------------------------------------------------------------
  describe('4. KnowledgeImprovementRecommendations', () => {
    const knowledgeRecs = new KnowledgeImprovementRecommendations();

    it('should recommend updating documented video decay curve benchmark in Knowledge Base', async () => {
      const recs = await knowledgeRecs.analyzeKnowledge(validOutcome);

      const decayRec = recs.find((r) => r.title.includes('TikTok Video Decay Curve'));
      assert.ok(decayRec);
      assert.strictEqual(decayRec.category, 'KNOWLEDGE_IMPROVEMENT');
      assert.strictEqual(decayRec.targetEntityType, 'KNOWLEDGE_MODULE');
      assert.strictEqual(decayRec.targetEntityId, 'tiktok-ads');
      assert.strictEqual(decayRec.requiresManualApproval, true);
    });

    it('should recommend Meta CAPI normalization expansion', async () => {
      const recs = await knowledgeRecs.analyzeKnowledge(validOutcome);

      const capiRec = recs.find((r) => r.title.includes('Meta CAPI'));
      assert.ok(capiRec);
      assert.strictEqual(capiRec.category, 'KNOWLEDGE_IMPROVEMENT');
      assert.strictEqual(capiRec.requiresManualApproval, true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Cross-Platform Insights
  // --------------------------------------------------------------------------
  describe('5. CrossPlatformInsightRecommendations', () => {
    const crossPlatform = new CrossPlatformInsightRecommendations();

    it('should recommend reallocating daily budget from saturated Meta ad sets to Google', async () => {
      const recs = await crossPlatform.analyzeCrossPlatform(validOutcome);

      const reallocRec = recs.find((r) => r.title.includes('Reallocate 15% Daily Ad Budget'));
      assert.ok(reallocRec);
      assert.strictEqual(reallocRec.category, 'CROSS_PLATFORM_INSIGHT');
      assert.strictEqual(reallocRec.targetEntityType, 'CROSS_PLATFORM_PORTFOLIO');
      assert.strictEqual(reallocRec.requiresManualApproval, true);
      assert.ok(reallocRec.confidenceScore >= 0.85);
    });

    it('should recommend synchronizing TikTok creative pushes with Google Brand Search bidding', async () => {
      const recs = await crossPlatform.analyzeCrossPlatform(validOutcome);

      const synergyRec = recs.find((r) => r.title.includes('Synchronize TikTok Spark Ad'));
      assert.ok(synergyRec);
      assert.strictEqual(synergyRec.category, 'CROSS_PLATFORM_INSIGHT');
      assert.strictEqual(synergyRec.requiresManualApproval, true);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Master Learning Engine & Invariant Rule Enforcement
  // --------------------------------------------------------------------------
  describe('6. LearningEngine (Master Orchestrator & Invariants)', () => {
    const tempStorageDir = path.resolve(process.cwd(), 'data', 'learning_test');
    let engine: LearningEngine;

    before(async () => {
      await fs.mkdir(tempStorageDir, { recursive: true });
      engine = new LearningEngine({ storageDirectory: tempStorageDir });
    });

    it('INVARIANT 1: should reject unapproved execution outcomes', async () => {
      const unapprovedOutcome: ValidatedExecutionOutcome = {
        ...validOutcome,
        approvalConfirmed: false,
      };

      await assert.rejects(
        () => engine.ingestOutcome(unapprovedOutcome),
        /Outcome was not approved/
      );
    });

    it('INVARIANT 1: should reject unvalidated execution outcomes', async () => {
      const unvalidatedOutcome: ValidatedExecutionOutcome = {
        ...validOutcome,
        isValidatedOutcome: false,
      };

      await assert.rejects(
        () => engine.ingestOutcome(unvalidatedOutcome),
        /Outcome metrics and status were not formally validated/
      );
    });

    it('INVARIANT 1: should reject failed workflow outcomes', async () => {
      const failedOutcome: ValidatedExecutionOutcome = {
        ...validOutcome,
        workflowExecutionResult: {
          ...sampleWorkflowResult,
          state: 'FAILED',
        },
      };

      await assert.rejects(
        () => engine.ingestOutcome(failedOutcome),
        /Cannot learn from state \[FAILED\]/
      );
    });

    it('INVARIANT 2 & 3: should ingest approved outcome and verify 100% of recommendations require manual approval', async () => {
      const recs = await engine.ingestOutcome(validOutcome);

      assert.ok(recs.length >= 5);
      for (const rec of recs) {
        assert.strictEqual(
          rec.requiresManualApproval,
          true,
          `Recommendation [${rec.title}] must require manual approval`
        );
        assert.strictEqual(
          rec.status,
          'PROPOSED',
          `Recommendation [${rec.title}] must start in PROPOSED status`
        );
      }
    });

    it('generateLearningReport should aggregate metrics and verify compliance declaration', async () => {
      const report = await engine.generateLearningReport();

      assert.ok(report.reportId.startsWith('lrn_rep_'));
      assert.ok(report.totalRecommendationsGenerated >= 5);
      assert.strictEqual(report.complianceDeclaration.learnedOnlyFromApprovedOutcomes, true);
      assert.strictEqual(report.complianceDeclaration.automaticModificationsPrevented, true);
      assert.strictEqual(report.complianceDeclaration.manualApprovalRequiredForAll, true);
      assert.strictEqual(report.complianceDeclaration.zeroDirectPlatformCalls, true);
    });

    it('approveRecommendation should transition recommendation to APPROVED with reviewer ID', async () => {
      const recs = engine.listRecommendations();
      assert.ok(recs.length > 0);

      const targetRec = recs[0];
      const approved = await engine.approveRecommendation(
        targetRec.id,
        'lead_strategist_01',
        'Approved for deployment in upcoming sprint'
      );

      assert.strictEqual(approved.status, 'APPROVED');
      assert.strictEqual(approved.reviewedBy, 'lead_strategist_01');
      assert.ok(approved.reviewedAt instanceof Date);
    });

    it('rejectRecommendation should transition recommendation to REJECTED with reason', async () => {
      const recs = engine.listRecommendations({ status: 'PROPOSED' });
      assert.ok(recs.length > 0);

      const targetRec = recs[0];
      const rejected = await engine.rejectRecommendation(
        targetRec.id,
        'compliance_officer_02',
        'Client preference prohibits tROAS at current spend level'
      );

      assert.strictEqual(rejected.status, 'REJECTED');
      assert.strictEqual(rejected.reviewedBy, 'compliance_officer_02');
      assert.strictEqual(rejected.reviewNotes, 'Client preference prohibits tROAS at current spend level');
    });

    it('INVARIANT 6: should persist recommendations to data/learning/ and re-load cleanly', async () => {
      const newEngine = new LearningEngine({ storageDirectory: tempStorageDir });
      await newEngine.loadFromDisk();

      const loadedRecs = newEngine.listRecommendations();
      assert.ok(loadedRecs.length >= 5);
      assert.ok(loadedRecs.some((r) => r.status === 'APPROVED'));
      assert.ok(loadedRecs.some((r) => r.status === 'REJECTED'));
    });

    after(async () => {
      try {
        await fs.rm(tempStorageDir, { recursive: true, force: true });
      } catch {
        // Ignore
      }
    });
  });
});
