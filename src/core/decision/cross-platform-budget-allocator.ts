import { Platform } from '../types/account';
import {
  CrossPlatformBudgetEvaluationInput,
  CrossPlatformBudgetEvaluationResult,
  ICrossPlatformBudgetAllocator,
} from './types';

/**
 * Cross-Platform Budget Allocation Evaluator
 * Balances capital distribution across Google, Meta, and TikTok based on marginal ROAS and CPA efficiency.
 */
export class CrossPlatformBudgetAllocator implements ICrossPlatformBudgetAllocator {
  public evaluateAllocation(
    input: CrossPlatformBudgetEvaluationInput
  ): CrossPlatformBudgetEvaluationResult {
    const { totalDailyBudget, platformMetrics, businessGoals } = input;
    const approvalReasons: string[] = [];

    // 1. Calculate performance weight per platform based on ROAS vs floor
    const totalCurrentSpend = platformMetrics.reduce((sum, p) => sum + p.currentSpend, 0);
    const safeTotalBudget = totalDailyBudget > 0 ? totalDailyBudget : totalCurrentSpend;

    // Determine performance score for each platform
    const platformWeights = platformMetrics.map((p) => {
      const roasRatio = p.roas / Math.max(businessGoals.targetRoasFloor, 0.1);
      const cpaBonus = p.cpa > 0 && p.cpa <= businessGoals.maxCpa ? 1.2 : 0.8;
      const weight = Math.max(0.1, roasRatio * cpaBonus);
      return {
        platform: p.platform,
        currentSpend: p.currentSpend,
        roas: p.roas,
        cpa: p.cpa,
        weight,
      };
    });

    const totalWeight = platformWeights.reduce((sum, pw) => sum + pw.weight, 0);

    // 2. Compute Target Budget with ±20% single-day guardrail
    const allocations: CrossPlatformBudgetEvaluationResult['allocations'] = platformWeights.map(
      (pw) => {
        const rawTargetBudget = (pw.weight / totalWeight) * safeTotalBudget;
        const currentBudget = pw.currentSpend > 0 ? pw.currentSpend : safeTotalBudget / platformMetrics.length;

        // Apply ±20% scaling guardrail
        const maxAllowed = currentBudget * 1.2;
        const minAllowed = currentBudget * 0.8;
        const boundedTarget = Math.max(minAllowed, Math.min(maxAllowed, rawTargetBudget));
        const finalRecommended = Math.round(boundedTarget);

        const deltaAmount = finalRecommended - currentBudget;
        const deltaPercentage = currentBudget > 0 ? Math.round((deltaAmount / currentBudget) * 100) : 0;

        let rationale = `Stable performance: maintaining budget within normal pacing boundaries.`;
        if (deltaAmount > 0) {
          rationale = `High ROAS (${pw.roas}x vs ${businessGoals.targetRoasFloor}x floor): expanding budget by +${deltaPercentage}% within the daily scaling guardrail.`;
        } else if (deltaAmount < 0) {
          rationale = `Sub-optimal efficiency (ROAS ${pw.roas}x): reducing spend by ${deltaPercentage}% to reallocate toward higher-yielding channels.`;
        }

        if (Math.abs(deltaPercentage) >= 20) {
          approvalReasons.push(
            `${pw.platform} budget adjustment of ${deltaPercentage}% reached the maximum daily scaling limit.`
          );
        }

        return {
          platform: pw.platform,
          currentBudget,
          recommendedBudget: finalRecommended,
          deltaAmount,
          deltaPercentage,
          marginalRoas: pw.roas,
          rationale,
        };
      }
    );

    // 3. Compute Projected Blended ROAS
    const totalRecommended = allocations.reduce((sum, a) => sum + a.recommendedBudget, 0);
    const totalProjectedRevenue = allocations.reduce(
      (sum, a) => sum + a.recommendedBudget * a.marginalRoas,
      0
    );
    const blendedProjectedRoas =
      totalRecommended > 0
        ? Math.round((totalProjectedRevenue / totalRecommended) * 100) / 100
        : businessGoals.targetRoasFloor;

    const requiresApproval = approvalReasons.length > 0;

    // Bilingual summary construction
    const topPerformer = [...allocations].sort((a, b) => b.marginalRoas - a.marginalRoas)[0];
    const explanationBangla = `ক্রস-প্ল্যাটফর্ম বাজেট মূল্যায়ন সম্পন্ন। সর্বোচ্চ ফলাফল প্রদানকারী প্ল্যাটফর্ম [${topPerformer.platform}]-এ বাজেট অগ্রাধিকার দেওয়া হয়েছে। প্রত্যাশিত ব্লেন্ডেড ROAS: ${blendedProjectedRoas}x।`;
    const explanationEnglish = `Cross-platform budget evaluation completed. Capital prioritized toward top performing platform [${topPerformer.platform}]. Projected Blended ROAS: ${blendedProjectedRoas}x.`;

    return {
      allocations,
      blendedProjectedRoas,
      requiresApproval,
      approvalReasons,
      explanationBangla,
      explanationEnglish,
    };
  }
}
