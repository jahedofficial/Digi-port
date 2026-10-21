import { IRollbackPlanner, ProposedAction, RollbackAction, RollbackPlan } from './types';

/**
 * Deterministic Rollback Planner
 * Generates automated, reversible recovery steps for all modifying (WRITE) operations.
 */
export class RollbackPlanner implements IRollbackPlanner {
  public generateRollbackPlan(action: ProposedAction): RollbackPlan | undefined {
    const mutatingOperations = [
      'LAUNCH',
      'CREATE_CAMPAIGN',
      'OPTIMIZE',
      'PAUSE',
      'UPDATE_BUDGET',
      'SET_STATUS',
    ];

    if (!mutatingOperations.includes(action.operation.toUpperCase())) {
      return undefined; // Read-only operations (AUDIT, REPORT) require no rollback
    }

    const platform = action.platform === 'CROSS_PLATFORM' ? 'GOOGLE' : action.platform;
    const actions: RollbackAction[] = [];

    // 1. Rollback for Budget Modifications
    if (
      action.operation === 'UPDATE_BUDGET' ||
      action.operation === 'OPTIMIZE' ||
      action.requestedBudget !== undefined
    ) {
      const originalBudget = action.currentBudget ?? (action.previousState?.dailyBudget as number) ?? 100;
      actions.push({
        stepNumber: 1,
        platform,
        targetEntityId: action.entityId ?? 'campaign_primary',
        targetEntityType: 'BUDGET',
        action: 'RESTORE_BUDGET',
        previousState: { dailyBudget: originalBudget },
        instructionsBangla: `ক্যাম্পেইন [${action.entityId ?? 'primary'}]-এর দৈনিক বাজেট পূর্বাবস্থায় ($${originalBudget}) ফিরিয়ে আনা হবে।`,
        instructionsEnglish: `Revert daily budget for campaign [${action.entityId ?? 'primary'}] back to original state ($${originalBudget}).`,
      });
    }

    // 2. Rollback for Status Changes (e.g. Pausing)
    if (action.operation === 'PAUSE' || action.operation === 'SET_STATUS') {
      const originalStatus = (action.previousState?.status as string) ?? 'ACTIVE';
      actions.push({
        stepNumber: actions.length + 1,
        platform,
        targetEntityId: action.entityId ?? 'campaign_primary',
        targetEntityType: 'CAMPAIGN',
        action: 'RESTORE_STATUS',
        previousState: { status: originalStatus },
        instructionsBangla: `ক্যাম্পেইনের স্ট্যাটাস পূর্বের [${originalStatus}] অবস্থায় রিভার্ট করা হবে।`,
        instructionsEnglish: `Revert campaign status back to previous state [${originalStatus}].`,
      });
    }

    // 3. Rollback for Campaign Launch
    if (action.operation === 'LAUNCH' || action.operation === 'CREATE_CAMPAIGN') {
      actions.push({
        stepNumber: 1,
        platform,
        targetEntityId: action.entityId ?? 'newly_created_campaign',
        targetEntityType: 'CAMPAIGN',
        action: 'RESTORE_STATUS',
        previousState: { status: 'PAUSED' },
        instructionsBangla: `ত্রুটি দেখা দিলে নতুন তৈরি ক্যাম্পেইনটি তাৎক্ষণিকভাবে পজ (PAUSE) করে খরচ বন্ধ করা হবে।`,
        instructionsEnglish: `Immediately pause newly launched campaign to stop spend if anomalous behavior is detected.`,
      });
    }

    return {
      planId: `rb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      targetTaskId: action.taskId,
      createdAt: new Date(),
      actions,
      isAutomated: true,
    };
  }
}
