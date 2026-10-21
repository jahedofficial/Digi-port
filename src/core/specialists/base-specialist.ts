import {
  AgentOperation,
  ClientContext,
  IOpenRouterReasoningClient,
  ISpecialistAgent,
  ScheduledTask,
  SpecialistCapability,
  SpecialistExecutionResult,
} from '../interfaces/agent.interface';
import { IPlatformAdapter } from '../interfaces/adapter.interface';
import { Platform } from '../types/account';
import { ValidationException } from '../errors/domain.errors';

/**
 * Base Specialist Agent Class
 * Implements common execution scaffolding, prerequisite validation,
 * platform adapter routing, and error classification.
 */
export abstract class BaseSpecialistAgent implements ISpecialistAgent {
  public abstract readonly agentName: string;
  public abstract readonly supportedPlatforms: Platform[];
  public abstract readonly supportedOperations: AgentOperation[];
  public abstract readonly requiresApprovalByDefault: boolean;

  protected readonly adapters: Map<Platform, IPlatformAdapter>;
  protected readonly openRouterClient?: IOpenRouterReasoningClient;

  constructor(
    adapters?: Map<Platform, IPlatformAdapter>,
    openRouterClient?: IOpenRouterReasoningClient
  ) {
    this.adapters = adapters ?? new Map<Platform, IPlatformAdapter>();
    this.openRouterClient = openRouterClient;
  }

  public getCapabilities(): SpecialistCapability {
    return {
      agentName: this.agentName,
      supportedPlatforms: this.supportedPlatforms,
      supportedOperations: this.supportedOperations,
      requiresApprovalByDefault: this.requiresApprovalByDefault,
    };
  }

  public registerAdapter(platform: Platform, adapter: IPlatformAdapter): void {
    this.adapters.set(platform, adapter);
  }

  protected getAdapter(platform: Platform): IPlatformAdapter | undefined {
    return this.adapters.get(platform);
  }

  /**
   * Validates prerequisites before task execution.
   */
  public async validatePrerequisites(
    task: ScheduledTask,
    clientContext: ClientContext
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // 1. Operation validation
    if (!this.supportedOperations.includes(task.operation)) {
      errors.push(
        `Agent '${this.agentName}' does not support operation '${task.operation}'. Supported: ${this.supportedOperations.join(', ')}`
      );
    }

    // 2. Platform validation
    if (task.platform !== 'CROSS_PLATFORM') {
      if (!this.supportedPlatforms.includes(task.platform)) {
        errors.push(
          `Agent '${this.agentName}' does not support platform '${task.platform}'. Supported: ${this.supportedPlatforms.join(', ')}`
        );
      }

      // Check adapter availability
      const adapter = this.getAdapter(task.platform);
      if (!adapter) {
        errors.push(
          `No active platform adapter registered for platform '${task.platform}' on agent '${this.agentName}'.`
        );
      }
    }

    // 3. Client context validation
    if (!clientContext.clientId) {
      errors.push('Missing clientId in client context.');
    }

    const customValidation = await this.validateCustomPrerequisites(task, clientContext);
    if (!customValidation.isValid) {
      errors.push(...customValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Hook for specialist-specific prerequisite validation.
   */
  protected async validateCustomPrerequisites(
    _task: ScheduledTask,
    _clientContext: ClientContext
  ): Promise<{ isValid: boolean; errors: string[] }> {
    return { isValid: true, errors: [] };
  }

  /**
   * Main execution coordinator delegating to performExecution with error boundary.
   */
  public async executeTask(
    task: ScheduledTask,
    clientContext: ClientContext
  ): Promise<SpecialistExecutionResult> {
    const prereq = await this.validatePrerequisites(task, clientContext);
    if (!prereq.isValid) {
      return {
        taskId: task.id,
        success: false,
        executionStatus: 'FAILED',
        summaryBangla: `টাস্ক [${task.id}] প্রাক-শর্ত যাচাইকরণে ব্যর্থ হয়েছে: ${prereq.errors.join('; ')}`,
        summaryEnglish: `Task [${task.id}] prerequisite validation failed: ${prereq.errors.join('; ')}`,
        affectedEntities: [],
        error: {
          code: 'ERR_PREREQUISITE_FAILED',
          message: prereq.errors.join('; '),
          recoverable: false,
        },
      };
    }

    try {
      return await this.performExecution(task, clientContext);
    } catch (err: unknown) {
      const errorObj = err as Error;
      const isRateLimit =
        errorObj.message.includes('rate limit') ||
        errorObj.message.includes('429') ||
        errorObj.name === 'RateLimitException';

      return {
        taskId: task.id,
        success: false,
        executionStatus: 'FAILED',
        summaryBangla: `টাস্ক [${task.id}] এক্সিকিউশনে ত্রুটি: ${errorObj.message}`,
        summaryEnglish: `Task [${task.id}] execution failed: ${errorObj.message}`,
        affectedEntities: [],
        error: {
          code: isRateLimit ? 'ERR_RATE_LIMIT_EXCEEDED' : 'ERR_EXECUTION_FAILED',
          message: errorObj.message,
          recoverable: isRateLimit,
        },
      };
    }
  }

  /**
   * Abstract execution method implemented by each specialist agent.
   */
  protected abstract performExecution(
    task: ScheduledTask,
    clientContext: ClientContext
  ): Promise<SpecialistExecutionResult>;
}
