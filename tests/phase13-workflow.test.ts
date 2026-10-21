import { describe, it, before } from 'node:test';
import * as assert from 'node:assert';
import {
  WorkflowEngine,
  WorkflowPlanner,
  TaskScheduler,
  ExecutionPipeline,
  ActionQueue,
  PlatformRetryStrategy,
  RecoveryStrategy,
  WorkflowDAG,
  ExecutionPlan,
  ClientContext,
  ISpecialistAgent,
  SpecialistCapability,
  ScheduledTask,
  SpecialistExecutionResult,
  Platform,
} from '../src/core';

describe('Phase 13 — Workflow Engine Unit Tests', () => {
  const defaultClientContext: ClientContext = {
    clientId: 'client_fashion_99',
    workspaceId: 'ws_fashion',
    currency: 'USD',
    activePlatforms: ['GOOGLE', 'META', 'TIKTOK'],
    monthlyBudgetCap: 25000,
    industry: 'ecommerce',
  };

  // Mock Specialist Agent for deterministic pipeline tests
  class MockSpecialistAgent implements ISpecialistAgent {
    constructor(
      public readonly agentName: string,
      public readonly supportedPlatforms: Platform[] = ['GOOGLE', 'META', 'TIKTOK'],
      private readonly shouldFail: boolean = false,
      private readonly failureError: string = 'Simulated operational error'
    ) {}

    public getCapabilities(): SpecialistCapability {
      return {
        agentName: this.agentName,
        supportedPlatforms: this.supportedPlatforms,
        supportedOperations: ['AUDIT', 'LAUNCH', 'OPTIMIZE', 'REPORT'],
        requiresApprovalByDefault: false,
      };
    }

    public async validatePrerequisites(): Promise<{ isValid: boolean; errors: string[] }> {
      return { isValid: true, errors: [] };
    }

    public async executeTask(
      task: ScheduledTask,
      clientContext: ClientContext
    ): Promise<SpecialistExecutionResult> {
      if (this.shouldFail) {
        throw new Error(this.failureError);
      }

      return {
        taskId: task.id,
        success: true,
        executionStatus: 'COMPLETED',
        summaryBangla: `ধাপ [${task.title}] সফলভাবে সম্পন্ন হয়েছে।`,
        summaryEnglish: `Step [${task.title}] executed successfully.`,
        affectedEntities: [
          {
            platform: task.platform,
            entityType: 'CAMPAIGN',
            entityId: `entity_${task.id}`,
            actionTaken: task.operation,
          },
        ],
      };
    }
  }

  const samplePlan: ExecutionPlan = {
    id: 'plan_launch_omnichannel_01',
    clientId: 'client_fashion_99',
    objective: 'Launch multichannel acquisition campaigns across Google and Meta',
    targetPlatforms: ['GOOGLE', 'META'],
    tasks: [
      {
        id: 'task_audit_google',
        title: 'Audit Active Google Campaigns',
        operation: 'AUDIT',
        platform: 'GOOGLE',
        agentName: 'AuditSpecialistAgent',
        parameters: { scope: 'FULL' },
        requiresApproval: false,
        order: 1,
      },
      {
        id: 'task_audit_meta',
        title: 'Audit Active Meta Campaigns',
        operation: 'AUDIT',
        platform: 'META',
        agentName: 'AuditSpecialistAgent',
        parameters: { scope: 'FULL' },
        requiresApproval: false,
        order: 1,
      },
      {
        id: 'task_launch_google',
        title: 'Launch Google Search Campaign',
        operation: 'LAUNCH',
        platform: 'GOOGLE',
        agentName: 'CampaignSpecialistAgent',
        parameters: { dailyBudget: 150 },
        requiresApproval: true,
        estimatedBudget: 150,
        order: 2,
      },
      {
        id: 'task_launch_meta',
        title: 'Launch Meta Advantage+ Campaign',
        operation: 'LAUNCH',
        platform: 'META',
        agentName: 'CampaignSpecialistAgent',
        parameters: { dailyBudget: 200 },
        requiresApproval: true,
        estimatedBudget: 200,
        order: 2,
      },
      {
        id: 'task_report_summary',
        title: 'Generate Launch Summary Report',
        operation: 'REPORT',
        platform: 'CROSS_PLATFORM',
        agentName: 'ReportingSpecialistAgent',
        parameters: { format: 'TELEGRAM' },
        requiresApproval: false,
        order: 3,
      },
    ],
    requiresApproval: false,
    estimatedBudget: 350,
    createdAt: new Date(),
    status: 'APPROVED',
  };

  // --------------------------------------------------------------------------
  // 1. Workflow Planner & DAG Builder
  // --------------------------------------------------------------------------
  describe('1. WorkflowPlanner & DAG Builder', () => {
    const planner = new WorkflowPlanner();

    it('should build a validated WorkflowDAG from an ExecutionPlan', () => {
      const dag = planner.buildWorkflowFromPlan(samplePlan);

      assert.ok(dag.workflowId.startsWith('wf_plan_launch_omnichannel_01_'));
      assert.strictEqual(dag.totalSteps, 5);
      assert.strictEqual(dag.steps.size, 5);
      assert.strictEqual(dag.executionLayers.length, 3); // 3 topological layers

      // Layer 1: Two parallel audits (order 1)
      assert.strictEqual(dag.executionLayers[0].length, 2);
      assert.ok(dag.executionLayers[0].includes('step_task_audit_google'));
      assert.ok(dag.executionLayers[0].includes('step_task_audit_meta'));

      // Layer 2: Two parallel launches (order 2)
      assert.strictEqual(dag.executionLayers[1].length, 2);
      assert.ok(dag.executionLayers[1].includes('step_task_launch_google'));
      assert.ok(dag.executionLayers[1].includes('step_task_launch_meta'));

      // Layer 3: Report summary (order 3)
      assert.strictEqual(dag.executionLayers[2].length, 1);
      assert.ok(dag.executionLayers[2].includes('step_task_report_summary'));
    });

    it('should detect cycles in a malformed DAG and reject planning', () => {
      const circularDAG: WorkflowDAG = {
        workflowId: 'wf_circular',
        steps: new Map([
          [
            'step_A',
            {
              id: 'step_A',
              name: 'Step A',
              task: samplePlan.tasks[0],
              dependencies: ['step_B'],
            },
          ],
          [
            'step_B',
            {
              id: 'step_B',
              name: 'Step B',
              task: samplePlan.tasks[1],
              dependencies: ['step_A'],
            },
          ],
        ]),
        adjacencyList: new Map([
          ['step_A', ['step_B']],
          ['step_B', ['step_A']],
        ]),
        executionLayers: [],
        totalSteps: 2,
      };

      const validation = planner.validateDAG(circularDAG);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.errors.some((e) => e.includes('Cycle detected')));
    });

    it('should detect missing dependencies in a DAG', () => {
      const missingDepDAG: WorkflowDAG = {
        workflowId: 'wf_missing_dep',
        steps: new Map([
          [
            'step_A',
            {
              id: 'step_A',
              name: 'Step A',
              task: samplePlan.tasks[0],
              dependencies: ['step_non_existent'],
            },
          ],
        ]),
        adjacencyList: new Map(),
        executionLayers: [],
        totalSteps: 1,
      };

      const validation = planner.validateDAG(missingDepDAG);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.errors.some((e) => e.includes('non-existent step')));
    });
  });

  // --------------------------------------------------------------------------
  // 2. Platform-Aware Retry Strategy
  // --------------------------------------------------------------------------
  describe('2. PlatformRetryStrategy (Google, Meta, TikTok)', () => {
    const retryStrategy = new PlatformRetryStrategy();

    it('should identify Google Ads rate limits and transient errors as retryable', () => {
      assert.strictEqual(
        retryStrategy.isRetryable(new Error('Google Ads GAQL: RESOURCE_EXHAUSTED'), 'GOOGLE'),
        true
      );
      assert.strictEqual(
        retryStrategy.isRetryable(new Error('HTTP 429 Too Many Requests'), 'GOOGLE'),
        true
      );
      assert.strictEqual(
        retryStrategy.isRetryable(new Error('ETIMEDOUT connection timeout'), 'GOOGLE'),
        true
      );
    });

    it('should identify Meta Graph API rate limits (code 17, 80004, 613) as retryable', () => {
      assert.strictEqual(
        retryStrategy.isRetryable(
          new Error('Meta Graph API: {"error": {"message": "User request limit reached", "code": 17}}'),
          'META'
        ),
        true
      );
      assert.strictEqual(
        retryStrategy.isRetryable(
          new Error('Meta Graph API: {"error": {"message": "Calls exceeded limit", "code": 613}}'),
          'META'
        ),
        true
      );
    });

    it('should identify TikTok Business API rate limits (code 40100, 40101) as retryable', () => {
      assert.strictEqual(
        retryStrategy.isRetryable(
          new Error('TikTok Business API: {"code": 40100, "message": "Too many requests"}'),
          'TIKTOK'
        ),
        true
      );
      assert.strictEqual(
        retryStrategy.isRetryable(
          new Error('TikTok Business API: {"code": 40101, "message": "Rate limit exceeded"}'),
          'TIKTOK'
        ),
        true
      );
    });

    it('should classify permanent errors (auth, policy, bad request) as non-retryable', () => {
      assert.strictEqual(
        retryStrategy.isRetryable(new Error('UNAUTHORIZED: Invalid access token'), 'GOOGLE'),
        false
      );
      assert.strictEqual(
        retryStrategy.isRetryable(new Error('POLICY_VIOLATION: Prohibited headline'), 'META'),
        false
      );
      assert.strictEqual(
        retryStrategy.isRetryable(new Error('HTTP 401 Unauthorized'), 'TIKTOK'),
        false
      );
    });

    it('should calculate exponential backoff with jitter within platform ceiling', () => {
      const backoffAttempt1 = retryStrategy.calculateBackoffMs(1, 'GOOGLE');
      const backoffAttempt3 = retryStrategy.calculateBackoffMs(3, 'GOOGLE');

      assert.ok(backoffAttempt1 >= 2000 && backoffAttempt1 <= 3000);
      assert.ok(backoffAttempt3 >= backoffAttempt1);
    });

    it('executeWithRetry should retry transient errors and return when operation succeeds', async () => {
      let attempts = 0;
      const result = await retryStrategy.executeWithRetry(
        async () => {
          attempts++;
          if (attempts < 2) {
            throw new Error('HTTP 429 Too Many Requests');
          }
          return 'SUCCESS_DATA';
        },
        'GOOGLE',
        'step_test',
        3
      );

      assert.strictEqual(result, 'SUCCESS_DATA');
      assert.strictEqual(attempts, 2);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Recovery Strategy
  // --------------------------------------------------------------------------
  describe('3. RecoveryStrategy', () => {
    const recoveryStrategy = new RecoveryStrategy();

    it('should trigger ABORT_WORKFLOW on critical policy violations', () => {
      const step = {
        id: 'step_1',
        name: 'Launch Ad',
        task: samplePlan.tasks[2],
        dependencies: [],
      };

      const recovery = recoveryStrategy.determineRecovery(
        step,
        new Error('Policy violation: Prohibited claims detected')
      );

      assert.strictEqual(recovery.policy, 'ABORT_WORKFLOW');
      assert.ok(recovery.reason.includes('policy violation'));
    });

    it('should trigger ROLLBACK on failing campaign mutations (LAUNCH, OPTIMIZE)', () => {
      const step = {
        id: 'step_launch',
        name: 'Launch Campaign',
        task: samplePlan.tasks[2], // LAUNCH operation
        dependencies: [],
      };

      const recovery = recoveryStrategy.determineRecovery(
        step,
        new Error('Network disconnected after budget allocation')
      );

      assert.strictEqual(recovery.policy, 'ROLLBACK');
      assert.ok(recovery.reason.includes('Mutating operation'));
    });

    it('should trigger CONTINUE_ON_FAILURE on non-critical diagnostic tasks (AUDIT, REPORT)', () => {
      const step = {
        id: 'step_audit',
        name: 'Audit Ad',
        task: samplePlan.tasks[0], // AUDIT operation
        dependencies: [],
      };

      const recovery = recoveryStrategy.determineRecovery(
        step,
        new Error('Google search impression share metric unavailable')
      );

      assert.strictEqual(recovery.policy, 'CONTINUE_ON_FAILURE');
      assert.ok(recovery.reason.includes('Diagnostic task'));
    });
  });

  // --------------------------------------------------------------------------
  // 4. Action Queue (Contract 7 Implementation)
  // --------------------------------------------------------------------------
  describe('4. ActionQueue (Contract 7: Human-in-the-Loop Approval Store)', () => {
    const queue = new ActionQueue();

    it('enqueue should register a new pending action item with ID and timestamp', async () => {
      const item = await queue.enqueue({
        clientId: 'client_fashion_99',
        workflowId: 'wf_test_01',
        type: 'CAMPAIGN_LAUNCH',
        proposedChange: { budget: 500 },
        riskScore: 65,
      });

      assert.ok(item.id.startsWith('act_'));
      assert.strictEqual(item.status, 'PENDING');
      assert.strictEqual(item.clientId, 'client_fashion_99');
      assert.strictEqual(item.riskScore, 65);
      assert.ok(item.createdAt instanceof Date);
    });

    it('approve should transition action to APPROVED and record reviewer ID', async () => {
      const item = await queue.enqueue({
        clientId: 'client_fashion_99',
        type: 'BUDGET_CHANGE',
        proposedChange: { newDailyBudget: 250 },
        riskScore: 40,
      });

      const approved = await queue.approve(item.id, 'reviewer_admin_01');
      assert.strictEqual(approved.status, 'APPROVED');
      assert.strictEqual(approved.reviewerId, 'reviewer_admin_01');
      assert.ok(approved.resolvedAt instanceof Date);
    });

    it('reject should transition action to REJECTED and record reason', async () => {
      const item = await queue.enqueue({
        clientId: 'client_fashion_99',
        type: 'PAUSE_AD',
        proposedChange: { campaignId: 'camp_001' },
        riskScore: 85,
      });

      const rejected = await queue.reject(item.id, 'reviewer_lead_02', 'Budget ceiling reached');
      assert.strictEqual(rejected.status, 'REJECTED');
      assert.strictEqual(rejected.reviewerId, 'reviewer_lead_02');
      assert.strictEqual(rejected.rejectionReason, 'Budget ceiling reached');
    });

    it('listPending should filter only PENDING items for a given client', async () => {
      const pendingList = await queue.listPending('client_fashion_99');
      assert.ok(pendingList.length >= 1);
      assert.ok(pendingList.every((i) => i.status === 'PENDING'));
    });
  });

  // --------------------------------------------------------------------------
  // 5. Task Scheduler
  // --------------------------------------------------------------------------
  describe('5. TaskScheduler', () => {
    const planner = new WorkflowPlanner();
    const scheduler = new TaskScheduler();

    it('should determine ready steps based on dependency satisfaction', () => {
      const dag = planner.buildWorkflowFromPlan(samplePlan);
      scheduler.initializeDAG(dag);

      // Initially, only layer 1 steps (audits) should be ready
      const readyInitial = scheduler.getReadySteps(dag);
      assert.strictEqual(readyInitial.length, 2);
      assert.ok(readyInitial.some((s) => s.id === 'step_task_audit_google'));
      assert.ok(readyInitial.some((s) => s.id === 'step_task_audit_meta'));

      // Mark first step completed
      scheduler.markStepCompleted(readyInitial[0], {
        taskId: readyInitial[0].task.id,
        success: true,
        executionStatus: 'COMPLETED',
        summaryBangla: '',
        summaryEnglish: '',
        affectedEntities: [],
      });

      // Layer 2 steps require BOTH audits to complete, so still only 1 step ready
      const readyNext = scheduler.getReadySteps(dag);
      assert.strictEqual(readyNext.length, 1);
      assert.strictEqual(readyNext[0].id, 'step_task_audit_meta');

      // Mark second audit completed
      scheduler.markStepCompleted(readyNext[0], {
        taskId: readyNext[0].task.id,
        success: true,
        executionStatus: 'COMPLETED',
        summaryBangla: '',
        summaryEnglish: '',
        affectedEntities: [],
      });

      // Now Layer 2 steps (launches) become ready
      const readyLaunches = scheduler.getReadySteps(dag);
      assert.strictEqual(readyLaunches.length, 2);
      assert.ok(readyLaunches.some((s) => s.id === 'step_task_launch_google'));
      assert.ok(readyLaunches.some((s) => s.id === 'step_task_launch_meta'));
    });
  });

  // --------------------------------------------------------------------------
  // 6. Execution Pipeline & End-to-End Orchestration
  // --------------------------------------------------------------------------
  describe('6. ExecutionPipeline', () => {
    const planner = new WorkflowPlanner();

    it('should execute full DAG through Specialist Agents and collect structured results', async () => {
      const scheduler = new TaskScheduler();
      const actionQueue = new ActionQueue();
      const retryStrategy = new PlatformRetryStrategy();
      const recoveryStrategy = new RecoveryStrategy();

      const pipeline = new ExecutionPipeline(
        scheduler,
        actionQueue,
        retryStrategy,
        recoveryStrategy,
        [
          new MockSpecialistAgent('AuditSpecialistAgent'),
          new MockSpecialistAgent('CampaignSpecialistAgent'),
          new MockSpecialistAgent('ReportingSpecialistAgent'),
        ]
      );

      const dag = planner.buildWorkflowFromPlan(samplePlan);
      const result = await pipeline.execute(dag, defaultClientContext);

      assert.strictEqual(result.state, 'COMPLETED');
      assert.strictEqual(result.totalSteps, 5);
      assert.strictEqual(result.completedStepsCount, 5);
      assert.strictEqual(result.failedStepsCount, 0);
      assert.strictEqual(result.rollbackExecuted, false);
      assert.ok(result.totalDurationMs >= 0);
      assert.ok(result.affectedEntities.length >= 5);
      assert.ok(result.summaryBangla.includes('সফলভাবে সম্পন্ন হয়েছে'));
      assert.ok(result.summaryEnglish.includes('executed successfully'));
    });

    it('should trigger rollback and abort when mutating campaign step encounters critical error', async () => {
      const scheduler = new TaskScheduler();
      const actionQueue = new ActionQueue();
      const retryStrategy = new PlatformRetryStrategy();
      const recoveryStrategy = new RecoveryStrategy();

      const pipeline = new ExecutionPipeline(
        scheduler,
        actionQueue,
        retryStrategy,
        recoveryStrategy,
        [
          new MockSpecialistAgent('AuditSpecialistAgent'),
          new MockSpecialistAgent('CampaignSpecialistAgent', ['GOOGLE', 'META'], true, 'Google API Budget Ceiling Error'),
          new MockSpecialistAgent('ReportingSpecialistAgent'),
        ]
      );

      const dag = planner.buildWorkflowFromPlan(samplePlan);
      const result = await pipeline.execute(dag, defaultClientContext);

      assert.strictEqual(result.state, 'ROLLED_BACK');
      assert.strictEqual(result.rollbackExecuted, true);
      assert.ok(result.failedStepsCount >= 1);
      assert.ok(result.summaryBangla.includes('রোলব্যাক করা হয়েছে'));
    });
  });

  // --------------------------------------------------------------------------
  // 7. Master Workflow Engine & Template Ingestion
  // --------------------------------------------------------------------------
  describe('7. WorkflowEngine (Master Engine)', () => {
    const engine = new WorkflowEngine({
      specialistRoster: [
        new MockSpecialistAgent('AuditSpecialistAgent'),
        new MockSpecialistAgent('CampaignSpecialistAgent'),
        new MockSpecialistAgent('ReportingSpecialistAgent'),
        new MockSpecialistAgent('TrackingSpecialistAgent'),
        new MockSpecialistAgent('OptimizationSpecialistAgent'),
        new MockSpecialistAgent('CroSpecialistAgent'),
        new MockSpecialistAgent('MerchantCatalogSpecialistAgent'),
        new MockSpecialistAgent('CreativeSpecialistAgent'),
      ],
    });

    it('should create and execute workflow returning comprehensive structured results', async () => {
      const dag = await engine.createWorkflow(samplePlan);
      assert.ok(dag.workflowId);
      assert.strictEqual(engine.getWorkflowStatus(dag.workflowId), 'APPROVED');

      const result = await engine.executeWorkflow(dag, defaultClientContext);
      assert.strictEqual(result.state, 'COMPLETED');
      assert.strictEqual(engine.getWorkflowStatus(dag.workflowId), 'COMPLETED');
      assert.strictEqual(engine.getWorkflowResult(dag.workflowId)?.workflowId, dag.workflowId);
    });

    it('should load all 5 workflow definitions from assets/workflows/', async () => {
      const templates = await engine.loadWorkflowTemplates();
      assert.ok(templates.length >= 5);

      const templateIds = templates.map((t) => t.id);
      assert.ok(templateIds.includes('workflow-ad-launch-pipeline'));
      assert.ok(templateIds.includes('workflow-full-audit-pipeline'));
      assert.ok(templateIds.includes('workflow-daily-optimization-pipeline'));
      assert.ok(templateIds.includes('workflow-tracking-setup-pipeline'));
      assert.ok(templateIds.includes('workflow-merchant-center-pipeline'));
    });

    it('cancelWorkflow should cancel an active or registered workflow', async () => {
      const dag = await engine.createWorkflow(samplePlan);
      const cancelled = await engine.cancelWorkflow(dag.workflowId, 'Client requested manual abort');

      assert.strictEqual(cancelled, true);
      assert.strictEqual(engine.getWorkflowStatus(dag.workflowId), 'CANCELLED');
    });

    it('getActionQueue should provide access to the Human-in-the-Loop store', () => {
      const queue = engine.getActionQueue();
      assert.ok(queue);
      assert.strictEqual(typeof queue.enqueue, 'function');
      assert.strictEqual(typeof queue.approve, 'function');
      assert.strictEqual(typeof queue.reject, 'function');
    });
  });
});
