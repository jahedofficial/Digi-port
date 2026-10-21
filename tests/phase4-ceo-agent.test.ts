import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CEOAgent,
  IntentAnalyzer,
  PlanValidator,
  ISpecialistAgent,
  SpecialistCapability,
  ScheduledTask,
  ClientContext,
  SpecialistExecutionResult,
  StructuredLogger,
  TypedEventBus,
  BudgetCapException,
  PolicyViolationException,
  ValidationException,
} from '../src/core';

describe('Phase 4 — CEO Agent Unit Tests', () => {
  const defaultContext: ClientContext = {
    clientId: 'client_fashion_001',
    workspaceId: 'ws_fashion',
    currency: 'USD',
    activePlatforms: ['GOOGLE', 'META'],
    brandVoice: 'Trendy & Premium',
    monthlyBudgetCap: 5000,
    industry: 'ecommerce',
  };

  describe('1. IntentAnalyzer', () => {
    const analyzer = new IntentAnalyzer();

    it('should parse single-platform Google Ads audit request', async () => {
      const intent = await analyzer.analyze(
        'Perform a comprehensive audit of my Google Ads search and PMax campaigns',
        defaultContext
      );

      assert.deepStrictEqual(intent.targetPlatforms, ['GOOGLE']);
      assert.strictEqual(intent.operation, 'AUDIT');
      assert.strictEqual(intent.playbookId, 'campaign-audit');
      assert.strictEqual(intent.requiresHumanReview, false);
    });

    it('should parse Meta Advantage+ campaign launch request with budget', async () => {
      const intent = await analyzer.analyze(
        'Launch a new Meta Advantage+ Sales campaign with $600 daily budget for my ecommerce brand',
        defaultContext
      );

      assert.deepStrictEqual(intent.targetPlatforms, ['META']);
      assert.strictEqual(intent.operation, 'LAUNCH');
      assert.strictEqual(intent.playbookId, 'campaign-creation');
      assert.strictEqual(intent.estimatedBudget, 600);
      assert.strictEqual(intent.requiresHumanReview, true);
    });

    it('should parse TikTok conversion tracking request', async () => {
      const intent = await analyzer.analyze(
        'Setup and verify TikTok Pixel and Events API tracking',
        defaultContext
      );

      assert.deepStrictEqual(intent.targetPlatforms, ['TIKTOK']);
      assert.strictEqual(intent.operation, 'VERIFY_TRACKING');
      assert.strictEqual(intent.playbookId, 'conversion-tracking');
    });

    it('should parse cross-platform optimization request with Bengali input', async () => {
      const intent = await analyzer.analyze(
        'Amader Google, Meta ebong TikTok shob campaign optimize koro ROAS barate',
        defaultContext
      );

      assert.ok(intent.targetPlatforms.includes('GOOGLE'));
      assert.ok(intent.targetPlatforms.includes('META'));
      assert.ok(intent.targetPlatforms.includes('TIKTOK'));
      assert.strictEqual(intent.operation, 'OPTIMIZE');
      assert.strictEqual(intent.isBilingualBengali, true);
    });
  });

  describe('2. PlanValidator', () => {
    const validator = new PlanValidator();

    it('should validate compliant execution plan', () => {
      const plan = {
        id: 'plan_test_01',
        clientId: 'client_fashion_001',
        objective: 'Test audit',
        targetPlatforms: ['GOOGLE'] as any,
        tasks: [{
          id: 'task_01',
          title: 'Google Audit',
          operation: 'AUDIT' as const,
          platform: 'GOOGLE' as const,
          agentName: 'AuditSpecialistAgent',
          parameters: {},
          requiresApproval: false,
          order: 1,
        }],
        requiresApproval: false,
        estimatedBudget: 0,
        createdAt: new Date(),
        status: 'APPROVED' as const,
      };

      const res = validator.validate(plan, defaultContext);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.budgetApproved, true);
    });

    it('should reject plans exceeding monthly budget cap', () => {
      const plan = {
        id: 'plan_test_overbudget',
        clientId: 'client_fashion_001',
        objective: 'Massive scale',
        targetPlatforms: ['GOOGLE'] as any,
        tasks: [{
          id: 'task_01',
          title: 'Google Scale',
          operation: 'LAUNCH' as const,
          platform: 'GOOGLE' as const,
          agentName: 'CampaignSpecialistAgent',
          parameters: {},
          requiresApproval: true,
          order: 1,
        }],
        requiresApproval: true,
        estimatedBudget: 15000, // Monthly cap is 5000
        createdAt: new Date(),
        status: 'DRAFT' as const,
      };

      assert.throws(() => {
        validator.validate(plan, defaultContext);
      }, BudgetCapException);
    });

    it('should reject plans with duplicate task IDs', () => {
      const plan = {
        id: 'plan_dup',
        clientId: 'client_fashion_001',
        objective: 'Dup test',
        targetPlatforms: ['GOOGLE'] as any,
        tasks: [
          { id: 'task_1', title: 'T1', operation: 'AUDIT' as const, platform: 'GOOGLE' as const, agentName: 'A', parameters: {}, requiresApproval: false, order: 1 },
          { id: 'task_1', title: 'T2', operation: 'AUDIT' as const, platform: 'GOOGLE' as const, agentName: 'A', parameters: {}, requiresApproval: false, order: 2 },
        ],
        requiresApproval: false,
        estimatedBudget: 0,
        createdAt: new Date(),
        status: 'DRAFT' as const,
      };

      assert.throws(() => {
        validator.validate(plan, defaultContext);
      }, ValidationException);
    });
  });

  describe('3. CEOAgent Orchestration & Execution', () => {
    // Helper Mock Specialists
    class MockAuditAgent implements ISpecialistAgent {
      getCapabilities(): SpecialistCapability {
        return {
          agentName: 'AuditSpecialistAgent',
          supportedPlatforms: ['GOOGLE', 'META', 'TIKTOK'],
          supportedOperations: ['AUDIT'],
          requiresApprovalByDefault: false,
        };
      }
      async validatePrerequisites() { return { isValid: true, errors: [] }; }
      async executeTask(task: ScheduledTask): Promise<SpecialistExecutionResult> {
        return {
          taskId: task.id,
          success: true,
          executionStatus: 'COMPLETED',
          summaryBangla: `${task.platform}-এ অডিট সম্পন্ন হয়েছে। কোন অসংগতি পাওয়া যায়নি।`,
          summaryEnglish: `Audit completed on ${task.platform}. No critical issues detected.`,
          affectedEntities: [{ platform: task.platform, entityType: 'CAMPAIGN', entityId: 'c1', actionTaken: 'AUDITED' }],
          metricsObserved: { roas: 3.4, ctr: '2.1%' },
        };
      }
    }

    class MockCampaignAgent implements ISpecialistAgent {
      getCapabilities(): SpecialistCapability {
        return {
          agentName: 'CampaignSpecialistAgent',
          supportedPlatforms: ['GOOGLE', 'META', 'TIKTOK'],
          supportedOperations: ['LAUNCH', 'PAUSE'],
          requiresApprovalByDefault: true,
        };
      }
      async validatePrerequisites() { return { isValid: true, errors: [] }; }
      async executeTask(task: ScheduledTask): Promise<SpecialistExecutionResult> {
        return {
          taskId: task.id,
          success: true,
          executionStatus: 'COMPLETED',
          summaryBangla: `${task.platform}-এ ক্যাম্পেইন তৈরি করা হয়েছে।`,
          summaryEnglish: `Campaign created on ${task.platform}.`,
          affectedEntities: [{ platform: task.platform, entityType: 'CAMPAIGN', entityId: 'c_new_1', actionTaken: 'CREATED' }],
        };
      }
    }

    it('should parse objective into multi-platform execution plan', async () => {
      const logger = new StructuredLogger('TestCEO');
      const eventBus = new TypedEventBus(logger);
      const ceo = new CEOAgent(logger, eventBus);

      ceo.registerSpecialist(new MockAuditAgent());
      ceo.registerSpecialist(new MockCampaignAgent());

      let eventFired = false;
      eventBus.subscribe('ceo.plan_created', () => { eventFired = true; });

      const plan = await ceo.parseObjective(
        'Perform an audit across Google and Meta ad accounts',
        defaultContext
      );

      assert.ok(plan.id.startsWith('plan_'));
      assert.strictEqual(plan.clientId, 'client_fashion_001');
      assert.deepStrictEqual(plan.targetPlatforms, ['GOOGLE', 'META']);
      assert.strictEqual(plan.tasks.length, 2);
      assert.strictEqual(plan.tasks[0].platform, 'GOOGLE');
      assert.strictEqual(plan.tasks[1].platform, 'META');
      assert.ok(eventFired);
    });

    it('should coordinate execution of approved plan across specialists', async () => {
      const logger = new StructuredLogger('TestCEO');
      const eventBus = new TypedEventBus(logger);
      const ceo = new CEOAgent(logger, eventBus);

      ceo.registerSpecialist(new MockAuditAgent());

      const plan = await ceo.parseObjective('Audit Google Ads account', defaultContext);
      assert.strictEqual(plan.requiresApproval, false);

      const summary = await ceo.coordinateExecution(plan, defaultContext);

      assert.strictEqual(summary.success, true);
      assert.strictEqual(summary.completedTasks, 1);
      assert.strictEqual(summary.results.length, 1);
      assert.strictEqual(summary.results[0].success, true);
      assert.ok(summary.summaryBangla.includes('সম্পন্ন'));
      assert.ok(summary.summaryEnglish.includes('completed'));
    });

    it('should enforce human approval gate before executing mutating tasks', async () => {
      const logger = new StructuredLogger('TestCEO');
      const ceo = new CEOAgent(logger);

      ceo.registerSpecialist(new MockCampaignAgent());

      // Launch prompt requires approval
      const plan = await ceo.parseObjective(
        'Launch new Google Ads campaign with $800 daily budget',
        defaultContext
      );

      assert.strictEqual(plan.requiresApproval, true);
      assert.strictEqual(plan.status, 'PENDING_APPROVAL');

      // Attempting to execute without approval must fail with PolicyViolationException
      await assert.rejects(async () => {
        await ceo.coordinateExecution(plan, defaultContext);
      }, PolicyViolationException);

      // Now approve the plan
      const approved = await ceo.approvePlan(plan.id, 'admin_user_01');
      assert.strictEqual(approved, true);
      assert.strictEqual(plan.status, 'APPROVED');

      // Execution should now succeed
      const summary = await ceo.coordinateExecution(plan, defaultContext);
      assert.strictEqual(summary.success, true);
    });

    it('should handle specialist failure and trigger recovery action', async () => {
      const logger = new StructuredLogger('TestCEO');
      const ceo = new CEOAgent(logger);

      const rateLimitRecovery = await ceo.handleSpecialistFailure('task_01', {
        code: 'ERR_RATE_LIMIT_EXCEEDED',
        message: 'Rate limit hit',
        recoverable: true,
      });
      assert.strictEqual(rateLimitRecovery.action, 'RETRY');
      assert.strictEqual(rateLimitRecovery.retryAfterSeconds, 60);

      const authRecovery = await ceo.handleSpecialistFailure('task_02', {
        code: 'ERR_PREREQUISITE_FAILED',
        message: 'Missing token',
        recoverable: false,
      });
      assert.strictEqual(authRecovery.action, 'ABORT');
    });

    it('should reject plan upon manager rejection', async () => {
      const logger = new StructuredLogger('TestCEO');
      const ceo = new CEOAgent(logger);

      const plan = await ceo.parseObjective(
        'Launch new Meta Ads campaign with $500 budget',
        defaultContext
      );

      const rejected = await ceo.rejectPlan(plan.id, 'manager_user', 'Budget reallocation needed');
      assert.strictEqual(rejected, true);
      assert.strictEqual(plan.status, 'REJECTED');

      await assert.rejects(async () => {
        await ceo.coordinateExecution(plan, defaultContext);
      }, PolicyViolationException);
    });
  });
});
