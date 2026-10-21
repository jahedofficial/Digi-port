import { IRecoveryStrategy, RecoveryPolicy, WorkflowStep } from './types';

/**
 * Deterministic Workflow Recovery Strategy
 * Decides whether to ABORT, ROLLBACK, RETRY, or CONTINUE_ON_FAILURE when a step fails.
 */
export class RecoveryStrategy implements IRecoveryStrategy {
  public determineRecovery(
    step: WorkflowStep,
    error: Error
  ): { policy: RecoveryPolicy; reason: string } {
    // 1. Explicit step policy overrides
    if (step.recoveryPolicy) {
      return {
        policy: step.recoveryPolicy,
        reason: `Using explicitly configured step recovery policy: ${step.recoveryPolicy}`,
      };
    }

    const message = error.message.toLowerCase();

    // 2. Critical Safety & Policy Violations: Must abort immediately
    if (
      message.includes('policy violation') ||
      message.includes('prohibited') ||
      message.includes('budget limit exceeded') ||
      message.includes('safe mode')
    ) {
      return {
        policy: 'ABORT_WORKFLOW',
        reason: 'Critical policy violation or budget ceiling breach encountered. Workflow aborted to prevent account penalty.',
      };
    }

    // 3. Mutating operations (LAUNCH, OPTIMIZE) that failed require ROLLBACK
    if (step.task.operation === 'LAUNCH' || step.task.operation === 'OPTIMIZE') {
      return {
        policy: 'ROLLBACK',
        reason: `Mutating operation (${step.task.operation}) failed mid-execution. Initiating deterministic rollback of modified ad entities.`,
      };
    }

    // 4. Diagnostic/Auditing operations are non-critical and can be bypassed without crashing the workflow
    if (
      step.task.operation === 'AUDIT' ||
      step.task.operation === 'CRO_AUDIT' ||
      step.task.operation === 'CATALOG_AUDIT' ||
      step.task.operation === 'CREATIVE_ANALYSIS'
    ) {
      return {
        policy: 'CONTINUE_ON_FAILURE',
        reason: `Diagnostic task (${step.task.operation}) encountered non-critical error; continuing downstream workflow stages.`,
      };
    }

    // Default conservative fallback
    return {
      policy: 'ABORT_WORKFLOW',
      reason: `Unrecovered error in step [${step.name}]: ${error.message}. Aborting remaining stages.`,
    };
  }
}
