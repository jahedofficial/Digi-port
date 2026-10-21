import * as fs from 'fs/promises';
import * as path from 'path';
import { ClientContext, ExecutionPlan, ISpecialistAgent } from '../interfaces/agent.interface';
import { IEventBus } from '../interfaces/event-bus.interface';
import { ILogger } from '../interfaces/logger.interface';
import { StructuredLogger } from '../logging/logger.service';
import { ActionQueue } from './action-queue';
import { ExecutionPipeline } from './execution-pipeline';
import { RecoveryStrategy } from './recovery-strategy';
import { PlatformRetryStrategy } from './retry-strategy';
import { TaskScheduler } from './task-scheduler';
import {
  IActionQueue,
  IWorkflowEngine,
  WorkflowDAG,
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowState,
} from './types';
import { WorkflowPlanner } from './workflow-planner';

/**
 * Enterprise Workflow Engine
 * Master orchestrator responsible for workflow planning, DAG dependency resolution,
 * human approval checkpoints, specialist agent coordination, and structured outcome reporting.
 */
export class WorkflowEngine implements IWorkflowEngine {
  private readonly logger: ILogger;
  private readonly planner: WorkflowPlanner;
  private readonly scheduler: TaskScheduler;
  private readonly actionQueue: ActionQueue;
  private readonly retryStrategy: PlatformRetryStrategy;
  private readonly recoveryStrategy: RecoveryStrategy;
  private readonly pipeline: ExecutionPipeline;
  private readonly activeWorkflows = new Map<string, WorkflowDAG>();
  private readonly workflowStates = new Map<string, WorkflowState>();
  private readonly workflowResults = new Map<string, WorkflowExecutionResult>();
  private readonly workflowTemplates = new Map<string, WorkflowDefinition>();

  constructor(options?: {
    planner?: WorkflowPlanner;
    scheduler?: TaskScheduler;
    actionQueue?: ActionQueue;
    retryStrategy?: PlatformRetryStrategy;
    recoveryStrategy?: RecoveryStrategy;
    pipeline?: ExecutionPipeline;
    specialistRoster?: ISpecialistAgent[];
    logger?: ILogger;
    eventBus?: IEventBus;
  }) {
    this.logger = options?.logger ?? new StructuredLogger('WorkflowEngine');
    this.planner = options?.planner ?? new WorkflowPlanner();
    this.actionQueue = options?.actionQueue ?? new ActionQueue(options?.eventBus);
    this.scheduler = options?.scheduler ?? new TaskScheduler(options?.eventBus);
    this.retryStrategy = options?.retryStrategy ?? new PlatformRetryStrategy();
    this.recoveryStrategy = options?.recoveryStrategy ?? new RecoveryStrategy();

    this.pipeline =
      options?.pipeline ??
      new ExecutionPipeline(
        this.scheduler,
        this.actionQueue,
        this.retryStrategy,
        this.recoveryStrategy,
        options?.specialistRoster,
        this.logger
      );
  }

  /**
   * Plan and compile an ExecutionPlan into a validated WorkflowDAG
   */
  public async createWorkflow(plan: ExecutionPlan): Promise<WorkflowDAG> {
    this.logger.info(`[WorkflowEngine] Creating workflow DAG from plan [${plan.id}] (${plan.tasks.length} tasks)`);
    const dag = this.planner.buildWorkflowFromPlan(plan);
    this.activeWorkflows.set(dag.workflowId, dag);
    this.workflowStates.set(dag.workflowId, 'APPROVED');
    return dag;
  }

  /**
   * Execute an approved WorkflowDAG to completion
   */
  public async executeWorkflow(
    dag: WorkflowDAG,
    clientContext: ClientContext
  ): Promise<WorkflowExecutionResult> {
    this.workflowStates.set(dag.workflowId, 'RUNNING');
    try {
      const result = await this.pipeline.execute(dag, clientContext);
      this.workflowStates.set(dag.workflowId, result.state);
      this.workflowResults.set(dag.workflowId, result);
      return result;
    } catch (err) {
      this.workflowStates.set(dag.workflowId, 'FAILED');
      throw err;
    }
  }

  /**
   * Retrieve current lifecycle state of a workflow
   */
  public getWorkflowStatus(workflowId: string): WorkflowState | undefined {
    return this.workflowStates.get(workflowId);
  }

  /**
   * Retrieve structured result of an executed workflow
   */
  public getWorkflowResult(workflowId: string): WorkflowExecutionResult | undefined {
    return this.workflowResults.get(workflowId);
  }

  /**
   * Access the Human-in-the-Loop approval queue
   */
  public getActionQueue(): IActionQueue {
    return this.actionQueue;
  }

  /**
   * Cancel an active or queued workflow
   */
  public async cancelWorkflow(workflowId: string, reason: string): Promise<boolean> {
    const currentState = this.workflowStates.get(workflowId);
    if (!currentState || currentState === 'COMPLETED' || currentState === 'FAILED' || currentState === 'CANCELLED') {
      return false;
    }

    this.logger.warn(`[WorkflowEngine] Cancelling workflow [${workflowId}]: ${reason}`);
    this.workflowStates.set(workflowId, 'CANCELLED');
    return true;
  }

  /**
   * Load workflow template definitions from assets/workflows/
   */
  public async loadWorkflowTemplates(dirPath?: string): Promise<WorkflowDefinition[]> {
    const resolvedPath =
      dirPath ?? path.resolve(process.cwd(), 'assets', 'workflows');

    try {
      const files = await fs.readdir(resolvedPath);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      for (const file of jsonFiles) {
        const fullPath = path.join(resolvedPath, file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const parsed = JSON.parse(content) as WorkflowDefinition;
        if (parsed.id && parsed.stages) {
          this.workflowTemplates.set(parsed.id, parsed);
        }
      }
    } catch {
      // Fallback
    }

    return Array.from(this.workflowTemplates.values());
  }

  /**
   * Register a specialist agent into the execution pipeline roster
   */
  public registerSpecialist(specialist: ISpecialistAgent): void {
    this.pipeline.registerSpecialist(specialist);
  }
}
