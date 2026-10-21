import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  RiskEngine,
  PolicyValidator,
  BudgetProtector,
  RollbackPlanner,
  ClientContext,
  ClientMemoryProfile,
  ProposedAction,
} from '../src/core';

describe('Phase 11 — Risk Engine Unit Tests', () => {
  const defaultClientContext: ClientContext = {
    clientId: 'client_fashion_001',
    workspaceId: 'ws_01',
    currency: 'USD',
    activePlatforms: ['GOOGLE', 'META', 'TIKTOK'],
    monthlyBudgetCap: 20000,
    industry: 'ecommerce',
  };

  const defaultMemoryProfile: ClientMemoryProfile = {
    clientId: 'client_fashion_001',
    businessGoals: {
      targetRoasFloor: 3.0,
      maxAllowableCpa: 45,
      monthlyBudgetCeiling: 20000,
    },
    approvalRules: {
      autoApproveBudgetThreshold: 150,
      requireHumanForCreativeDelete: true,
      requireHumanForAudienceDelete: true,
      highRiskRoasProtectionThreshold: 3.0,
      requireApprovalForNewCampaign: true,
    },
    rawEntries: [],
    updatedAt: new Date(),
  };

  // --------------------------------------------------------------------------
  // 1. Policy Validator (Google, Meta, TikTok)
  // --------------------------------------------------------------------------
  describe('1. PolicyValidator', () => {
    const validator = new PolicyValidator();

    it('should detect prohibited sensational claims (miracle cure, 100% guarantee)', () => {
      const result = validator.validateContent(
        {
          headlines: ['100% Guaranteed Cure for All Skin Issues'],
          descriptions: ['Try our miracle remedy today and get rich quick.'],
        },
        'GOOGLE'
      );

      assert.strictEqual(result.isValid, false);
      assert.ok(result.violations.length >= 1);
      assert.strictEqual(result.violations[0].category, 'PROHIBITED');
      assert.strictEqual(result.violations[0].ruleId, 'POLICY_PROHIBITED_MISLEADING_CONTENT');
    });

    it('should detect Meta Special Ad Category keywords (housing, loans)', () => {
      const result = validator.validateContent(
        {
          headlines: ['Low Mortgage Rates for Home Buyers'],
          descriptions: ['Fast credit card approval with zero down payment.'],
        },
        'META'
      );

      assert.strictEqual(result.isValid, false);
      assert.ok(result.violations.some((v) => v.category === 'SPECIAL_AD_CATEGORY'));
      assert.ok(result.violations.some((v) => v.ruleId === 'META_SPECIAL_AD_CATEGORY_REQUIRED'));
    });

    it('should detect Meta personal attributes violations', () => {
      const result = validator.validateContent(
        {
          headlines: ['Are you bankrupt and in debt?'],
          descriptions: ['Struggling with bad credit? We can help.'],
        },
        'META'
      );

      assert.strictEqual(result.isValid, false);
      assert.ok(result.violations.some((v) => v.ruleId === 'META_PERSONAL_ATTRIBUTES'));
    });

    it('should detect TikTok health and diet pill restrictions', () => {
      const result = validator.validateContent(
        {
          headlines: ['Magic Diet Pills for Summer'],
          descriptions: ['Lose 10 kg in 5 days with this secret pill.'],
        },
        'TIKTOK'
      );

      assert.strictEqual(result.isValid, false);
      assert.ok(result.violations.some((v) => v.platform === 'TIKTOK'));
    });

    it('should detect editorial capitalization and gimmicky punctuation violations', () => {
      const result = validator.validateContent(
        {
          headlines: ['BUY NOW THIS IS THE GREATEST DEAL EVERRR'],
          descriptions: ['Huge discounts now, click here!!!!!! $$$'],
        },
        'GOOGLE'
      );

      assert.strictEqual(result.isValid, false);
      assert.ok(result.violations.some((v) => v.ruleId === 'EDITORIAL_STYLE_VIOLATION'));
    });

    it('should pass compliant creative content cleanly', () => {
      const result = validator.validateContent(
        {
          headlines: ['Premium Handcrafted Leather Boots', 'Durable Autumn Footwear'],
          descriptions: ['Shop our artisan collection designed for comfort and longevity.'],
          targetUrl: 'https://example.com/collection/autumn-boots',
        },
        'CROSS_PLATFORM'
      );

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.violations.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Budget Protector (Scaling Guardrails & Monthly Ceilings)
  // --------------------------------------------------------------------------
  describe('2. BudgetProtector', () => {
    const protector = new BudgetProtector();

    it('should reject budget scaling greater than ±20% single-day guardrail', () => {
      // Current $100 -> Requested $140 (+40% change, exceeds 20%)
      const result = protector.validateBudget(100, 140, 20000);

      assert.strictEqual(result.isCompliant, false);
      assert.strictEqual(result.violations.length, 1);
      assert.strictEqual(result.violations[0].type, 'DAILY_SCALING_EXCEEDED');
      assert.strictEqual(result.violations[0].maxAllowedAmount, 120);
    });

    it('should allow budget scaling within ±20% guardrail', () => {
      // Current $100 -> Requested $118 (+18% change, compliant)
      const result = protector.validateBudget(100, 118, 20000);

      assert.strictEqual(result.isCompliant, true);
      assert.strictEqual(result.violations.length, 0);
    });

    it('should reject zero or negative budget requests', () => {
      const resultZero = protector.validateBudget(100, 0, 20000);
      assert.strictEqual(resultZero.isCompliant, false);
      assert.strictEqual(resultZero.violations[0].type, 'ZERO_BUDGET_DISALLOWED');

      const resultNegative = protector.validateBudget(100, -25, 20000);
      assert.strictEqual(resultNegative.isCompliant, false);
      assert.strictEqual(resultNegative.violations[0].type, 'ZERO_BUDGET_DISALLOWED');
    });

    it('should reject daily budget that breaches monthly budget ceiling', () => {
      // Monthly cap is $3,000, daily $200 projects $6,000 monthly
      const result = protector.validateBudget(100, 200, 3000);

      assert.strictEqual(result.isCompliant, false);
      assert.ok(result.violations.some((v) => v.type === 'MONTHLY_CAP_EXCEEDED'));
    });
  });

  // --------------------------------------------------------------------------
  // 3. Rollback Planner
  // --------------------------------------------------------------------------
  describe('3. RollbackPlanner', () => {
    const planner = new RollbackPlanner();

    it('should generate deterministic rollback plan for budget update', () => {
      const action: ProposedAction = {
        taskId: 'task_budget_scale_01',
        clientId: 'client_01',
        platform: 'GOOGLE',
        operation: 'UPDATE_BUDGET',
        entityId: 'camp_google_01',
        parameters: { newDailyBudget: 120 },
        currentBudget: 100,
        requestedBudget: 120,
      };

      const plan = planner.generateRollbackPlan(action);
      assert.ok(plan);
      assert.strictEqual(plan.actions.length, 1);
      assert.strictEqual(plan.actions[0].action, 'RESTORE_BUDGET');
      assert.strictEqual(plan.actions[0].previousState.dailyBudget, 100);
      assert.ok(plan.actions[0].instructionsBangla.includes('$100'));
      assert.ok(plan.actions[0].instructionsEnglish.includes('$100'));
    });

    it('should generate deterministic rollback plan for campaign pause', () => {
      const action: ProposedAction = {
        taskId: 'task_pause_01',
        clientId: 'client_01',
        platform: 'META',
        operation: 'PAUSE',
        entityId: 'camp_meta_1',
        parameters: {},
        previousState: { status: 'ACTIVE' },
      };

      const plan = planner.generateRollbackPlan(action);
      assert.ok(plan);
      assert.strictEqual(plan.actions.length, 1);
      assert.strictEqual(plan.actions[0].action, 'RESTORE_STATUS');
      assert.strictEqual(plan.actions[0].previousState.status, 'ACTIVE');
    });

    it('should return undefined rollback plan for read-only audit actions', () => {
      const action: ProposedAction = {
        taskId: 'task_audit_01',
        clientId: 'client_01',
        platform: 'CROSS_PLATFORM',
        operation: 'AUDIT',
        parameters: {},
      };

      const plan = planner.generateRollbackPlan(action);
      assert.strictEqual(plan, undefined);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Master Risk Engine Orchestration
  // --------------------------------------------------------------------------
  describe('4. Master Risk Engine Orchestration', () => {
    const riskEngine = new RiskEngine();

    it('should approve compliant low-risk action with auto-execution allowed', async () => {
      const action: ProposedAction = {
        taskId: 'task_safe_scale',
        clientId: 'client_fashion_001',
        platform: 'GOOGLE',
        operation: 'OPTIMIZE',
        entityId: 'camp_pmax_01',
        parameters: { newDailyBudget: 110 },
        currentBudget: 100,
        requestedBudget: 110, // +10% within 20% guardrail
        creativeContent: {
          headlines: ['Designer Bags On Sale'],
          descriptions: ['Discover exclusive craftsmanship and classic style.'],
        },
      };

      const assessment = await riskEngine.assessRisk(
        action,
        defaultClientContext,
        defaultMemoryProfile
      );

      assert.strictEqual(assessment.canAutoExecute, true);
      assert.strictEqual(assessment.requiresApproval, false);
      assert.strictEqual(assessment.riskLevel, 'LOW');
      assert.ok(assessment.riskScore <= 35);
      assert.ok(assessment.rollbackPlan);
      assert.strictEqual(assessment.rollbackPlan.actions[0].action, 'RESTORE_BUDGET');
      assert.ok(assessment.summaryBangla.includes('অনুমোদিত'));
    });

    it('should block auto-execution and flag CRITICAL risk on high-ROAS campaign pause', async () => {
      const action: ProposedAction = {
        taskId: 'task_risky_pause',
        clientId: 'client_fashion_001',
        platform: 'META',
        operation: 'PAUSE',
        entityId: 'camp_adv_plus_01',
        parameters: {},
        observedRoas: 4.8, // >= 3.0 protection threshold
        previousState: { status: 'ACTIVE' },
      };

      const assessment = await riskEngine.assessRisk(
        action,
        defaultClientContext,
        defaultMemoryProfile
      );

      assert.strictEqual(assessment.canAutoExecute, false);
      assert.strictEqual(assessment.requiresApproval, true);
      assert.ok(assessment.approvalReasons.some((r) => r.includes('High-Risk Operation')));
      assert.ok(assessment.summaryBangla.includes('অনুমোদন প্রয়োজন'));
    });

    it('should flag HIGH risk and require approval when creative violates advertising policy', async () => {
      const action: ProposedAction = {
        taskId: 'task_policy_violation',
        clientId: 'client_fashion_001',
        platform: 'GOOGLE',
        operation: 'LAUNCH',
        parameters: {},
        creativeContent: {
          headlines: ['Get Rich Quick with Miracle Oil'],
          descriptions: ['100% Guaranteed cure for aging!'],
        },
      };

      const assessment = await riskEngine.assessRisk(
        action,
        defaultClientContext,
        defaultMemoryProfile
      );

      assert.strictEqual(assessment.canAutoExecute, false);
      assert.strictEqual(assessment.requiresApproval, true);
      assert.ok(assessment.policyViolations.length >= 1);
      assert.ok(assessment.riskScore >= 50);
      assert.ok(assessment.summaryEnglish.includes('BLOCKED'));
    });
  });
});
