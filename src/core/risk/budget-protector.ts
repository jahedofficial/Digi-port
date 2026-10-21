import { BudgetGuardrailViolation, IBudgetProtector } from './types';

/**
 * Budget Protection Engine
 * Enforces financial guardrails:
 * - Single-day budget scaling is capped at ±20%.
 * - Protects total monthly expenditure against client-approved ceilings.
 * - Prevents zero or negative budget allocations.
 */
export class BudgetProtector implements IBudgetProtector {
  private static readonly MAX_SINGLE_DAY_SCALING_PERCENT = 20;

  public validateBudget(
    currentBudget: number,
    requestedBudget: number,
    monthlyBudgetCap: number,
    projectedCurrentMonthSpend: number = 0
  ): { isCompliant: boolean; violations: BudgetGuardrailViolation[] } {
    const violations: BudgetGuardrailViolation[] = [];

    // 1. Minimum Budget Validation
    if (requestedBudget <= 0) {
      violations.push({
        type: 'ZERO_BUDGET_DISALLOWED',
        currentAmount: currentBudget,
        requestedAmount: requestedBudget,
        maxAllowedAmount: 1,
        message: 'Daily budget must be greater than $0. Use PAUSE operation to stop spend.',
      });
      return { isCompliant: false, violations };
    }

    // 2. Single-Day Scaling Guardrail (±20%)
    if (currentBudget > 0) {
      const deltaAmount = Math.abs(requestedBudget - currentBudget);
      const percentageChange = (deltaAmount / currentBudget) * 100;

      if (percentageChange > BudgetProtector.MAX_SINGLE_DAY_SCALING_PERCENT) {
        const maxAllowed = Math.round(currentBudget * 1.2 * 100) / 100;
        violations.push({
          type: 'DAILY_SCALING_EXCEEDED',
          currentAmount: currentBudget,
          requestedAmount: requestedBudget,
          maxAllowedAmount: maxAllowed,
          message: `Single-day budget change of ${percentageChange.toFixed(1)}% exceeds the allowable scaling guardrail (±20%). Maximum allowed: $${maxAllowed}.`,
        });
      }
    }

    // 3. Monthly Budget Ceiling Protection
    if (monthlyBudgetCap > 0) {
      // Projected remaining month spend at requested daily rate (assuming 30-day baseline)
      const projectedTotalMonthly = projectedCurrentMonthSpend + requestedBudget * 30;

      if (requestedBudget * 30 > monthlyBudgetCap * 1.05 || projectedTotalMonthly > monthlyBudgetCap * 1.1) {
        violations.push({
          type: 'MONTHLY_CAP_EXCEEDED',
          currentAmount: currentBudget,
          requestedAmount: requestedBudget,
          maxAllowedAmount: Math.round((monthlyBudgetCap / 30) * 100) / 100,
          message: `Requested daily budget ($${requestedBudget}) projects monthly spend of $${Math.round(requestedBudget * 30)}, exceeding client monthly budget ceiling of $${monthlyBudgetCap}.`,
        });
      }
    }

    return {
      isCompliant: violations.length === 0,
      violations,
    };
  }
}
