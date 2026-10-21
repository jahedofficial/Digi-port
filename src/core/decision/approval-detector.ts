import { ClientMemoryProfile } from '../memory/types';
import { ActionableRecommendation, ApprovalRequirement, IApprovalDetector } from './types';

/**
 * Deterministic Approval Detector
 * Enforces human-in-the-loop gates based on budget thresholds, scaling guardrails, and client policies.
 */
export class ApprovalDetector implements IApprovalDetector {
  public detectApproval(
    recommendation: Partial<ActionableRecommendation>,
    memoryProfile?: ClientMemoryProfile
  ): ApprovalRequirement {
    const approvalRules = memoryProfile?.approvalRules;
    const autoApproveLimit = approvalRules?.autoApproveBudgetThreshold ?? 200;
    const highRiskRoasThreshold = approvalRules?.highRiskRoasProtectionThreshold ?? 3.0;

    // 1. Budget Scaling & Delta Evaluation
    if (
      recommendation.type === 'BUDGET_REALLOCATION' ||
      recommendation.type === 'CAMPAIGN_SCALING' ||
      recommendation.type === 'CROSS_PLATFORM_REBALANCE'
    ) {
      const cur = typeof recommendation.currentValue === 'number' ? recommendation.currentValue : 0;
      const rec = typeof recommendation.recommendedValue === 'number' ? recommendation.recommendedValue : 0;
      const delta = Math.abs(rec - cur);
      const percentDelta = cur > 0 ? (delta / cur) * 100 : 100;

      // Scaling Guardrail: > 20% single day change
      if (percentDelta > 20) {
        return {
          requiresApproval: true,
          severity: 'HIGH',
          reason: `Budget adjustment of ${percentDelta.toFixed(1)}% exceeds the single-day scaling guardrail (±20%).`,
          thresholdTriggered: 'SCALING_GUARDRAIL_20_PERCENT',
        };
      }

      // Client Auto-Approve Threshold
      if (delta > autoApproveLimit) {
        return {
          requiresApproval: true,
          severity: 'HIGH',
          reason: `Budget delta ($${delta}) exceeds the client auto-approval limit ($${autoApproveLimit}).`,
          thresholdTriggered: 'CLIENT_AUTO_APPROVE_THRESHOLD',
        };
      }
    }

    // 2. High-Risk Action: Pausing a High-ROAS Campaign
    if (recommendation.type === 'UNDERPERFORMER_PAUSE') {
      const curRoas = typeof recommendation.currentValue === 'number' ? recommendation.currentValue : 0;
      if (curRoas >= highRiskRoasThreshold) {
        return {
          requiresApproval: true,
          severity: 'CRITICAL',
          reason: `Pausing campaign with ROAS ${curRoas}x (>= ${highRiskRoasThreshold}x protection threshold) is a high-risk action requiring manager confirmation.`,
          thresholdTriggered: 'HIGH_ROAS_PROTECTION_GUARDRAIL',
        };
      }
    }

    // 3. Creative / Audience deletion
    if (
      (recommendation.type === 'CREATIVE_REFRESH' && approvalRules?.requireHumanForCreativeDelete) ||
      (recommendation.type === 'AUDIENCE_EXPANSION' && approvalRules?.requireHumanForAudienceDelete)
    ) {
      return {
        requiresApproval: true,
        severity: 'STANDARD',
        reason: 'Client governance requires human sign-off for asset modification/deletion.',
        thresholdTriggered: 'GOVERNANCE_ASSET_MODIFICATION',
      };
    }

    // 4. Safe / Read-Only / Within Threshold
    return {
      requiresApproval: false,
      severity: 'INFO',
    };
  }
}
