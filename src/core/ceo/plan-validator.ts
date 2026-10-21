import { ExecutionPlan, ClientContext } from '../interfaces/agent.interface';
import { BudgetCapException, ValidationException } from '../errors/domain.errors';

export interface PlanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  budgetApproved: boolean;
}

export class PlanValidator {
  validate(plan: ExecutionPlan, context: ClientContext): PlanValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Structural Validation
    if (!plan.id || plan.id.trim().length === 0) {
      errors.push("ExecutionPlan 'id' is required");
    }

    if (!plan.clientId || plan.clientId !== context.clientId) {
      errors.push(`Plan clientId '${plan.clientId}' does not match ClientContext '${context.clientId}'`);
    }

    if (!plan.tasks || plan.tasks.length === 0) {
      errors.push('ExecutionPlan must contain at least one ScheduledTask');
    }

    // 2. Task Order & Platform Check
    const taskIds = new Set<string>();
    for (const task of plan.tasks) {
      if (taskIds.has(task.id)) {
        errors.push(`Duplicate task ID detected: '${task.id}'`);
      }
      taskIds.add(task.id);

      if (task.platform !== 'CROSS_PLATFORM' && !plan.targetPlatforms.includes(task.platform)) {
        errors.push(`Task '${task.id}' targets platform '${task.platform}' which is not in plan targetPlatforms: [${plan.targetPlatforms.join(', ')}]`);
      }
    }

    // 3. Budget Protection Rules
    let budgetApproved = true;
    if (context.monthlyBudgetCap && context.monthlyBudgetCap > 0) {
      if (plan.estimatedBudget > context.monthlyBudgetCap) {
        errors.push(
          `Plan estimated budget (${plan.estimatedBudget} ${context.currency}) exceeds monthly budget cap (${context.monthlyBudgetCap} ${context.currency})`
        );
        budgetApproved = false;
        throw new BudgetCapException(
          `Budget cap exceeded for client ${context.clientId}`,
          plan.estimatedBudget,
          context.monthlyBudgetCap
        );
      }
    }

    // 4. Approval Enforcement
    const mutatingOperations = ['LAUNCH', 'OPTIMIZE', 'PAUSE'];
    const hasMutatingTask = plan.tasks.some(t => mutatingOperations.includes(t.operation));
    if (hasMutatingTask && !plan.requiresApproval && plan.status === 'DRAFT') {
      warnings.push('Plan contains state-mutating operations; approval flag has been enforced');
      plan.requiresApproval = true;
    }

    if (errors.length > 0) {
      throw new ValidationException('ExecutionPlan validation failed', errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      budgetApproved,
    };
  }
}
