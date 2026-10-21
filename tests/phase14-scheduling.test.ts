import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert';
import {
  SchedulingEngine,
  CronParser,
  Heartbeat,
  ScheduleRegistry,
  JobScheduler,
  EventTriggerManager,
  ScheduleDefinition,
  IWorkflowEngine,
  WorkflowDAG,
  ClientContext,
  WorkflowExecutionResult,
  IActionQueue,
  ExecutionPlan,
  ActionQueue,
} from '../src/core';

describe('Phase 14 — Scheduling Engine Unit Tests', () => {
  // Mock WorkflowEngine satisfying Blueprint rule: jobs dispatch strictly through WorkflowEngine
  class MockWorkflowEngine implements IWorkflowEngine {
    public executedDags: WorkflowDAG[] = [];

    public async createWorkflow(plan: ExecutionPlan): Promise<WorkflowDAG> {
      return {
        workflowId: `wf_mock_${plan.id}`,
        steps: new Map(),
        adjacencyList: new Map(),
        executionLayers: [],
        totalSteps: plan.tasks.length,
      };
    }

    public async executeWorkflow(
      dag: WorkflowDAG,
      clientContext: ClientContext
    ): Promise<WorkflowExecutionResult> {
      this.executedDags.push(dag);
      return {
        workflowId: dag.workflowId,
        clientId: clientContext.clientId,
        state: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        totalDurationMs: 120,
        totalSteps: dag.totalSteps,
        completedStepsCount: dag.totalSteps,
        failedStepsCount: 0,
        stepRecords: [],
        affectedEntities: [
          {
            platform: 'GOOGLE',
            entityType: 'CAMPAIGN',
            entityId: 'camp_sched_01',
            actionTaken: 'SCHEDULED_AUDIT',
          },
        ],
        summaryBangla: 'শিডিউল্ড ওয়ার্কফ্লো সফলভাবে সম্পন্ন হয়েছে।',
        summaryEnglish: 'Scheduled workflow completed successfully.',
        rollbackExecuted: false,
      };
    }

    public getWorkflowStatus(): 'COMPLETED' {
      return 'COMPLETED';
    }

    public getActionQueue(): IActionQueue {
      return new ActionQueue();
    }

    public async cancelWorkflow(): Promise<boolean> {
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 1. Pure TypeScript Cron Parser
  // --------------------------------------------------------------------------
  describe('1. CronParser', () => {
    const parser = new CronParser();

    it('should validate standard 5-field cron expressions', () => {
      assert.strictEqual(parser.validate('* * * * *'), true);
      assert.strictEqual(parser.validate('0 8 * * *'), true);
      assert.strictEqual(parser.validate('*/15 * * * *'), true);
      assert.strictEqual(parser.validate('0 2 * * 1'), true);
      assert.strictEqual(parser.validate('0 0 1 * *'), true);
      assert.strictEqual(parser.validate('0,30 9-17 * * 1-5'), true);
    });

    it('should reject invalid cron expressions', () => {
      assert.strictEqual(parser.validate(''), false);
      assert.strictEqual(parser.validate('* * * *'), false); // Only 4 fields
      assert.strictEqual(parser.validate('* * * * * *'), false); // 6 fields
      assert.strictEqual(parser.validate('65 * * * *'), false); // Minute > 59
      assert.strictEqual(parser.validate('* 25 * * *'), false); // Hour > 23
      assert.strictEqual(parser.validate('* * 32 * *'), false); // Day > 31
      assert.strictEqual(parser.validate('invalid cron'), false);
    });

    it('should accurately calculate getNextRun for hourly and daily schedules', () => {
      // From 2026-10-21 07:30:00 UTC, next '0 8 * * *' should be 2026-10-21 08:00:00 UTC
      const fromMorning = new Date(Date.UTC(2026, 9, 21, 7, 30, 0));
      const nextMorning = parser.getNextRun('0 8 * * *', fromMorning);
      assert.strictEqual(nextMorning.getUTCHours(), 8);
      assert.strictEqual(nextMorning.getUTCMinutes(), 0);
      assert.strictEqual(nextMorning.getUTCDate(), 21);

      // From 2026-10-21 09:30:00 UTC, next '0 8 * * *' should be 2026-10-22 08:00:00 UTC
      const fromAfternoon = new Date(Date.UTC(2026, 9, 21, 9, 30, 0));
      const nextDay = parser.getNextRun('0 8 * * *', fromAfternoon);
      assert.strictEqual(nextDay.getUTCHours(), 8);
      assert.strictEqual(nextDay.getUTCMinutes(), 0);
      assert.strictEqual(nextDay.getUTCDate(), 22);

      // From 2026-10-21 10:02:00 UTC, next '*/15 * * * *' should be 2026-10-21 10:15:00 UTC
      const fromQuarter = new Date(Date.UTC(2026, 9, 21, 10, 2, 0));
      const nextQuarter = parser.getNextRun('*/15 * * * *', fromQuarter);
      assert.strictEqual(nextQuarter.getUTCMinutes(), 15);
      assert.strictEqual(nextQuarter.getUTCHours(), 10);
    });

    it('should determine isDue correctly based on lastRunAt and now', () => {
      const lastRun = new Date(Date.UTC(2026, 9, 21, 7, 0, 0));
      const nowDue = new Date(Date.UTC(2026, 9, 21, 8, 0, 0));
      const nowNotDue = new Date(Date.UTC(2026, 9, 21, 7, 30, 0));

      assert.strictEqual(parser.isDue('0 8 * * *', lastRun, nowDue), true);
      assert.strictEqual(parser.isDue('0 8 * * *', lastRun, nowNotDue), false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. System Heartbeat
  // --------------------------------------------------------------------------
  describe('2. Heartbeat Monitor', () => {
    let heartbeat: Heartbeat;

    before(() => {
      heartbeat = new Heartbeat({
        intervalMs: 100, // Fast interval for testing
        activeJobsCountGetter: () => 2,
      });
    });

    after(() => {
      heartbeat.stop();
    });

    it('should emit periodic health pulses with memory metrics and uptime', async () => {
      heartbeat.start();
      const status = await heartbeat.pulse();

      assert.strictEqual(status.status, 'HEALTHY');
      assert.ok(status.pulseCount >= 1);
      assert.strictEqual(status.activeJobsCount, 2);
      assert.ok(status.memoryUsageMb > 0);
      assert.ok(status.lastPulseAt instanceof Date);
    });

    it('getStatus should reflect current heartbeat state', () => {
      const current = heartbeat.getStatus();
      assert.strictEqual(current.status, 'HEALTHY');
      assert.ok(current.pulseCount >= 1);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Schedule Registry & Template Loading
  // --------------------------------------------------------------------------
  describe('3. ScheduleRegistry', () => {
    const registry = new ScheduleRegistry();

    it('should register a valid CRON schedule and compute nextRunAt', () => {
      registry.register({
        id: 'sched_test_cron',
        name: 'Test Daily Audit',
        description: 'Audit test schedule',
        clientId: 'client_01',
        type: 'CRON',
        cronExpression: '0 8 * * *',
        targetWorkflowId: 'workflow-full-audit-pipeline',
        targetOperation: 'AUDIT',
        status: 'ACTIVE',
      });

      const sched = registry.get('sched_test_cron');
      assert.ok(sched);
      assert.strictEqual(sched.name, 'Test Daily Audit');
      assert.strictEqual(sched.status, 'ACTIVE');
      assert.ok(sched.nextRunAt instanceof Date);
    });

    it('should reject malformed schedule definitions', () => {
      assert.throws(
        () =>
          registry.register({
            id: 'sched_invalid',
            name: 'Invalid Schedule',
            description: 'Missing type and workflow',
            clientId: 'client_01',
            type: 'CRON',
            cronExpression: 'invalid_cron',
            targetWorkflowId: '',
            status: 'ACTIVE',
          }),
        /Schedule registration failed/
      );
    });

    it('should load all schedule templates from assets/schedules/', async () => {
      const loaded = await registry.loadFromDirectory();
      assert.ok(loaded.length >= 6);

      const scheduleIds = loaded.map((s) => s.id);
      assert.ok(scheduleIds.includes('sched_daily_spend_pacing'));
      assert.ok(scheduleIds.includes('sched_weekly_performance_audit'));
      assert.ok(scheduleIds.includes('sched_monthly_executive_report'));
      assert.ok(scheduleIds.includes('sched_hourly_guardrail_monitor'));
      assert.ok(scheduleIds.includes('sched_event_roas_breach'));
      assert.ok(scheduleIds.includes('sched_event_tracking_loss'));
    });

    it('updateStatus should toggle status between ACTIVE and PAUSED', () => {
      const success = registry.updateStatus('sched_test_cron', 'PAUSED');
      assert.strictEqual(success, true);
      assert.strictEqual(registry.get('sched_test_cron')?.status, 'PAUSED');

      registry.updateStatus('sched_test_cron', 'ACTIVE');
      assert.strictEqual(registry.get('sched_test_cron')?.status, 'ACTIVE');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Job Scheduler & Workflow Dispatching
  // --------------------------------------------------------------------------
  describe('4. JobScheduler (WorkflowEngine Delegation)', () => {
    const mockWorkflowEngine = new MockWorkflowEngine();
    const registry = new ScheduleRegistry();
    const jobScheduler = new JobScheduler(mockWorkflowEngine, registry);

    const testSchedule: ScheduleDefinition = {
      id: 'sched_job_test',
      name: 'Automated Optimization Schedule',
      description: 'Executes optimization workflow',
      clientId: 'client_fashion_99',
      type: 'CRON',
      cronExpression: '0 8 * * *',
      targetWorkflowId: 'workflow-daily-optimization-pipeline',
      targetOperation: 'OPTIMIZE',
      status: 'ACTIVE',
    };

    before(() => {
      registry.register(testSchedule);
    });

    it('scheduleJob should queue and execute job strictly through WorkflowEngine', async () => {
      const job = await jobScheduler.scheduleJob(testSchedule, 'CRON');

      assert.ok(job.jobId.startsWith('job_'));
      assert.strictEqual(job.clientId, 'client_fashion_99');
      assert.strictEqual(job.triggerType, 'CRON');

      // Wait a tick for async execution
      await new Promise((r) => setTimeout(r, 10));

      const executedJob = jobScheduler.getJob(job.jobId);
      assert.ok(executedJob);
      assert.strictEqual(executedJob.status, 'COMPLETED');
      assert.ok(executedJob.completedAt);
      assert.strictEqual(executedJob.workflowResult?.state, 'COMPLETED');

      // Verify that WorkflowEngine was called
      assert.strictEqual(mockWorkflowEngine.executedDags.length, 1);
    });

    it('cancelJob should cancel a queued job before it runs', () => {
      // Mock an immediately queued job
      const fakeJob = {
        jobId: 'job_to_cancel',
        scheduleId: 'sched_test',
        clientId: 'client_01',
        targetWorkflowId: 'wf_01',
        status: 'QUEUED' as const,
        triggerType: 'CRON' as const,
        triggeredAt: new Date(),
      };
      (jobScheduler as unknown as { jobs: Map<string, typeof fakeJob> }).jobs.set('job_to_cancel', fakeJob);

      const cancelled = jobScheduler.cancelJob('job_to_cancel');
      assert.strictEqual(cancelled, true);
      assert.strictEqual(jobScheduler.getJob('job_to_cancel')?.status, 'SKIPPED');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Event Trigger Manager
  // --------------------------------------------------------------------------
  describe('5. EventTriggerManager', () => {
    const mockWorkflowEngine = new MockWorkflowEngine();
    const registry = new ScheduleRegistry();
    const jobScheduler = new JobScheduler(mockWorkflowEngine, registry);
    const triggerManager = new EventTriggerManager(jobScheduler);

    const eventSchedule: ScheduleDefinition = {
      id: 'sched_trigger_roas',
      name: 'Emergency ROAS Drop Trigger',
      description: 'Triggered when ROAS drops below floor',
      clientId: 'client_fashion_99',
      type: 'EVENT_TRIGGER',
      eventPattern: 'roas.floor_breach',
      targetWorkflowId: 'workflow-daily-optimization-pipeline',
      targetOperation: 'OPTIMIZE',
      status: 'ACTIVE',
    };

    before(() => {
      triggerManager.registerTrigger(eventSchedule);
    });

    it('handleEvent should match incoming event and dispatch reactive job', async () => {
      const dispatched = await triggerManager.handleEvent({
        eventId: 'evt_001',
        eventType: 'roas.floor_breach',
        clientId: 'client_fashion_99',
        timestamp: new Date(),
        data: { currentRoas: 1.8, floor: 3.0 },
      });

      assert.strictEqual(dispatched.length, 1);
      assert.strictEqual(dispatched[0].scheduleId, 'sched_trigger_roas');
      assert.strictEqual(dispatched[0].triggerType, 'EVENT_TRIGGER');
    });

    it('handleEvent should ignore events when clientId does not match', async () => {
      const dispatched = await triggerManager.handleEvent({
        eventId: 'evt_002',
        eventType: 'roas.floor_breach',
        clientId: 'client_different_99',
        timestamp: new Date(),
        data: {},
      });

      assert.strictEqual(dispatched.length, 0);
    });

    it('handleEvent should ignore events when pattern does not match', async () => {
      const dispatched = await triggerManager.handleEvent({
        eventId: 'evt_003',
        eventType: 'unrelated.event_type',
        clientId: 'client_fashion_99',
        timestamp: new Date(),
        data: {},
      });

      assert.strictEqual(dispatched.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Master Scheduling Engine & Status Reports
  // --------------------------------------------------------------------------
  describe('6. SchedulingEngine (Master Orchestrator)', () => {
    const mockWorkflowEngine = new MockWorkflowEngine();
    let engine: SchedulingEngine;

    before(async () => {
      engine = new SchedulingEngine({
        workflowEngine: mockWorkflowEngine,
      });

      // Load all standard schedules
      await engine.getRegistry().loadFromDirectory();
      await engine.start();
    });

    after(async () => {
      await engine.stop();
    });

    it('getStatus should return comprehensive report with heartbeat and upcoming schedules', () => {
      const status = engine.getStatus();

      assert.strictEqual(status.heartbeat.status, 'HEALTHY');
      assert.ok(status.totalSchedules >= 6);
      assert.ok(status.activeSchedules >= 6);
      assert.ok(Array.isArray(status.upcomingSchedules));
      assert.ok(status.upcomingSchedules.length > 0);
      assert.ok(status.upcomingSchedules[0].scheduleId);
      assert.ok(status.upcomingSchedules[0].nextRunAt);
    });

    it('dispatchManualRun should immediately execute an on-demand job for a schedule', async () => {
      const job = await engine.dispatchManualRun('sched_daily_spend_pacing');

      assert.ok(job.jobId.startsWith('job_'));
      assert.strictEqual(job.scheduleId, 'sched_daily_spend_pacing');
      assert.strictEqual(job.triggerType, 'ONE_OFF');

      // Wait a tick for async execution
      await new Promise((r) => setTimeout(r, 10));

      const executedJob = engine.getJobScheduler().getJob(job.jobId);
      assert.ok(executedJob);
      assert.strictEqual(executedJob.status, 'COMPLETED');
    });

    it('handleEvent should trigger reactive workflow via master engine', async () => {
      const dispatched = await engine.handleEvent({
        eventId: 'evt_master_01',
        eventType: 'roas.floor_breach',
        clientId: 'client_any',
        timestamp: new Date(),
        data: { roas: 1.5 },
      });

      assert.ok(dispatched.length >= 1);
      assert.strictEqual(dispatched[0].scheduleId, 'sched_event_roas_breach');
    });
  });
});
