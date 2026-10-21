import { 
  ICEOAgent, 
  ISpecialistAgent, 
  SpecialistCapability, 
  ExecutionPlan, 
  ScheduledTask, 
  PlanExecutionSummary, 
  SpecialistExecutionResult, 
  ClientContext, 
  RecoveryAction,
  IOpenRouterReasoningClient 
} from '../interfaces/agent.interface';
import { ILogger } from '../interfaces/logger.interface';
import { IEventBus } from '../interfaces/event-bus.interface';
import { IntentAnalyzer } from './intent-analyzer';
import { PlanValidator } from './plan-validator';
import { ValidationException, PolicyViolationException } from '../errors/domain.errors';

import { StructuredLogger } from '../logging/logger.service';

export class CEOAgent implements ICEOAgent {
  private readonly specialists = new Map<string, ISpecialistAgent>();
  private readonly plans = new Map<string, ExecutionPlan>();
  private readonly intentAnalyzer: IntentAnalyzer;
  private readonly planValidator: PlanValidator;
  private readonly logger: ILogger;

  constructor(
    logger?: ILogger,
    private readonly eventBus?: IEventBus,
    reasoningClient?: IOpenRouterReasoningClient
  ) {
    this.logger = logger ?? new StructuredLogger('CEOAgent');
    this.intentAnalyzer = new IntentAnalyzer(reasoningClient);
    this.planValidator = new PlanValidator();
  }

  registerSpecialist(agent: ISpecialistAgent): void {
    const caps = agent.getCapabilities();
    this.specialists.set(caps.agentName, agent);
    this.logger.info(`[CEOAgent] Registered specialist: ${caps.agentName} (Platforms: ${caps.supportedPlatforms.join(', ')})`);
  }

  getRegisteredSpecialists(): SpecialistCapability[] {
    return Array.from(this.specialists.values()).map(s => s.getCapabilities());
  }

  async parseObjective(prompt: string, clientContext: ClientContext): Promise<ExecutionPlan> {
    this.logger.info(`[CEOAgent] Parsing marketer objective for client [${clientContext.clientId}]: "${prompt}"`);

    const intent = await this.intentAnalyzer.analyze(prompt, clientContext);
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const tasks: ScheduledTask[] = [];
    let orderIndex = 1;

    for (const platform of intent.targetPlatforms) {
      const agentName = this.selectSpecialistForOperation(intent.operation);

      tasks.push({
        id: `task_${planId}_${platform.toLowerCase()}_${orderIndex}`,
        title: `${intent.operation} on ${platform} (${intent.industryTemplate || 'General'})`,
        operation: intent.operation,
        platform,
        agentName,
        parameters: {
          industry: intent.industryTemplate,
          playbook: intent.playbookId,
          rawPrompt: intent.rawPrompt,
          bilingual: intent.isBilingualBengali,
        },
        requiresApproval: intent.requiresHumanReview,
        estimatedBudget: intent.estimatedBudget > 0 ? Math.round(intent.estimatedBudget / intent.targetPlatforms.length) : undefined,
        order: orderIndex++,
      });
    }

    const plan: ExecutionPlan = {
      id: planId,
      clientId: clientContext.clientId,
      objective: prompt,
      targetPlatforms: intent.targetPlatforms,
      playbookId: intent.playbookId,
      templateId: intent.industryTemplate,
      tasks,
      requiresApproval: intent.requiresHumanReview,
      estimatedBudget: intent.estimatedBudget,
      createdAt: new Date(),
      status: intent.requiresHumanReview ? 'PENDING_APPROVAL' : 'APPROVED',
    };

    // Validate plan structure and budget against client context
    this.planValidator.validate(plan, clientContext);

    this.plans.set(planId, plan);

    this.eventBus?.publish('ceo.plan_created', {
      planId,
      clientId: clientContext.clientId,
      targetPlatforms: plan.targetPlatforms,
      requiresApproval: plan.requiresApproval,
      taskCount: plan.tasks.length,
    });

    return plan;
  }

  async coordinateExecution(plan: ExecutionPlan, clientContext: ClientContext): Promise<PlanExecutionSummary> {
    this.logger.info(`[CEOAgent] Coordinating execution of plan [${plan.id}] (Status: ${plan.status})`);

    // Guard: Unapproved plans cannot be executed
    if (plan.requiresApproval && plan.status !== 'APPROVED') {
      this.logger.warn(`[CEOAgent] Plan [${plan.id}] blocked: requires human approval before execution`);
      throw new PolicyViolationException(
        `Plan [${plan.id}] cannot execute without human approval`,
        ['HUMAN_APPROVAL_REQUIRED']
      );
    }

    plan.status = 'EXECUTING';
    const results: SpecialistExecutionResult[] = [];
    let successfulTasks = 0;

    for (const task of plan.tasks) {
      const specialist = this.specialists.get(task.agentName);
      if (!specialist) {
        throw new ValidationException(
          `No registered specialist agent found with name '${task.agentName}' for task '${task.id}'`,
          [task.agentName]
        );
      }

      this.logger.info(`[CEOAgent] Delegating task [${task.id}] to specialist [${task.agentName}] on ${task.platform}`);

      // 1. Validate prerequisites with specialist
      const prereqs = await specialist.validatePrerequisites(task, clientContext);
      if (!prereqs.isValid) {
        const failureResult: SpecialistExecutionResult = {
          taskId: task.id,
          success: false,
          executionStatus: 'FAILED',
          summaryBangla: `টাস্ক ${task.title} প্রি-রেকুইজিট ভ্যালিডেশনে ব্যর্থ হয়েছে।`,
          summaryEnglish: `Task ${task.title} failed prerequisite validation: ${prereqs.errors.join(', ')}`,
          affectedEntities: [],
          error: {
            code: 'ERR_PREREQUISITE_FAILED',
            message: prereqs.errors.join('; '),
            recoverable: false,
          },
        };
        results.push(failureResult);

        const recovery = await this.handleSpecialistFailure(task.id, failureResult.error!);
        if (recovery.action === 'ABORT') {
          plan.status = 'FAILED';
          break;
        }
        continue;
      }

      // 2. Execute task through specialist
      try {
        const res = await specialist.executeTask(task, clientContext);
        results.push(res);
        if (res.success) {
          successfulTasks++;
        } else if (res.error) {
          const recovery = await this.handleSpecialistFailure(task.id, res.error);
          if (recovery.action === 'ABORT') {
            plan.status = 'FAILED';
            break;
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const errObj = { code: 'ERR_SPECIALIST_EXECUTION', message: errorMsg, recoverable: false };
        results.push({
          taskId: task.id,
          success: false,
          executionStatus: 'FAILED',
          summaryBangla: `স্পেশালিস্ট এজেন্টে অপ্রত্যাশিত ত্রুটি: ${errorMsg}`,
          summaryEnglish: `Unexpected specialist error: ${errorMsg}`,
          affectedEntities: [],
          error: errObj,
        });

        const recovery = await this.handleSpecialistFailure(task.id, errObj);
        if (recovery.action === 'ABORT') {
          plan.status = 'FAILED';
          break;
        }
      }
    }

    const allSucceeded = successfulTasks === plan.tasks.length;
    plan.status = allSucceeded ? 'COMPLETED' : 'FAILED';

    const summaryBangla = allSucceeded
      ? `সবগুলো টাস্ক (${successfulTasks}/${plan.tasks.length}) সফলভাবে সম্পন্ন হয়েছে।`
      : `প্ল্যান আংশিক সম্পন্ন হয়েছে: ${successfulTasks}/${plan.tasks.length} টাস্ক সফল।`;

    const summaryEnglish = allSucceeded
      ? `All ${successfulTasks} scheduled tasks completed successfully.`
      : `Plan completed with partial success: ${successfulTasks}/${plan.tasks.length} tasks succeeded.`;

    const summary: PlanExecutionSummary = {
      planId: plan.id,
      success: allSucceeded,
      completedTasks: successfulTasks,
      totalTasks: plan.tasks.length,
      results,
      summaryBangla,
      summaryEnglish,
      executedAt: new Date(),
    };

    this.eventBus?.publish('ceo.plan_executed', {
      planId: plan.id,
      success: allSucceeded,
      completedTasks: successfulTasks,
      totalTasks: plan.tasks.length,
    });

    return summary;
  }

  async submitForApproval(planId: string): Promise<boolean> {
    const plan = this.plans.get(planId);
    if (!plan) return false;

    plan.status = 'PENDING_APPROVAL';
    this.logger.info(`[CEOAgent] Plan [${planId}] submitted for human approval`);

    this.eventBus?.publish('ceo.plan_pending_approval', {
      planId,
      clientId: plan.clientId,
      estimatedBudget: plan.estimatedBudget,
    });

    return true;
  }

  async approvePlan(planId: string, approvedBy: string): Promise<boolean> {
    const plan = this.plans.get(planId);
    if (!plan) return false;

    plan.status = 'APPROVED';
    this.logger.info(`[CEOAgent] Plan [${planId}] APPROVED by ${approvedBy}`);

    this.eventBus?.publish('ceo.plan_approved', {
      planId,
      approvedBy,
      timestamp: new Date(),
    });

    return true;
  }

  async rejectPlan(planId: string, rejectedBy: string, reason: string): Promise<boolean> {
    const plan = this.plans.get(planId);
    if (!plan) return false;

    plan.status = 'REJECTED';
    this.logger.info(`[CEOAgent] Plan [${planId}] REJECTED by ${rejectedBy} (Reason: ${reason})`);

    this.eventBus?.publish('ceo.plan_rejected', {
      planId,
      rejectedBy,
      reason,
      timestamp: new Date(),
    });

    return true;
  }

  async handleSpecialistFailure(
    taskId: string, 
    error: { code: string; message: string; recoverable: boolean }
  ): Promise<RecoveryAction> {
    this.logger.warn(`[CEOAgent] Handling failure in task [${taskId}]: [${error.code}] ${error.message}`);

    if (error.code.includes('RATE_LIMIT')) {
      return { action: 'RETRY', retryAfterSeconds: 60, reason: 'Platform rate limit hit. Waiting for cooldown.' };
    }

    if (error.code.includes('PREREQUISITE') || error.code.includes('AUTH') || error.code.includes('POLICY')) {
      return { action: 'ABORT', reason: 'Critical prerequisite, credential, or policy violation cannot be auto-recovered.' };
    }

    if (error.recoverable) {
      return { action: 'RETRY', retryAfterSeconds: 5, reason: 'Transient recoverable error.' };
    }

    return { action: 'SKIP', reason: 'Non-critical failure; continuing remaining plan tasks.' };
  }

  private selectSpecialistForOperation(operation: string): string {
    switch (operation) {
      case 'LAUNCH':
        return 'CampaignSpecialistAgent';
      case 'OPTIMIZE':
        return 'OptimizationSpecialistAgent';
      case 'PAUSE':
        return 'CampaignSpecialistAgent';
      case 'VERIFY_TRACKING':
        return 'TrackingSpecialistAgent';
      case 'AUDIT':
      default:
        return 'AuditSpecialistAgent';
    }
  }
}
