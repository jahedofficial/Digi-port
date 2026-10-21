import {
  IStrategyLearning,
  LearningRecommendation,
  ValidatedExecutionOutcome,
} from './types';

/**
 * Strategy Learning Sub-Engine
 * Analyzes validated campaign execution outcomes to identify winning bidding strategies,
 * scaling opportunities, and audience targeting refinements.
 */
export class StrategyLearning implements IStrategyLearning {
  public async analyzeStrategy(
    outcome: ValidatedExecutionOutcome
  ): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];
    const { metrics, clientContext } = outcome;

    if (!metrics || metrics.length === 0) {
      return recommendations;
    }

    const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);
    const totalRevenue = metrics.reduce((sum, m) => sum + (m.conversionValue ?? 0), 0);
    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    // 1. High ROAS Scaling Opportunity (check either blended or top-performing campaign)
    const topPerforming = metrics.find((m) => m.roas >= 4.0 && m.spend >= 500);
    if ((blendedRoas >= 3.5 && totalSpend > 1000) || topPerforming) {
      recommendations.push({
        id: `rec_strat_scale_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: 'STRATEGY_IMPROVEMENT',
        title: 'Transition High-Performing Search Campaigns to Target ROAS Scaling Strategy',
        targetEntityId: 'strategy_bidding_pmax_search',
        targetEntityType: 'STRATEGY',
        platform: 'GOOGLE',
        currentPattern: 'Maximize Conversions with standard CPA cap',
        proposedPattern: 'Target ROAS (tROAS) bidding set to 380% with +15% daily budget headroom',
        confidenceScore: 0.88,
        evidence: {
          sampleSize: metrics.length,
          metricsObserved: {
            blendedRoas: Number(blendedRoas.toFixed(2)),
            totalSpend,
            totalRevenue,
          },
          validationOutcome: 'PROVEN_LIFT',
        },
        rationaleEnglish: `Validated execution achieved a profitable ${blendedRoas.toFixed(2)}x ROAS. Data proves conversion volume is stable enough to support algorithmic value-based bidding.`,
        rationaleBangla: `যাচাইকৃত ক্যাম্পেইনে লাভজনক ${blendedRoas.toFixed(2)}x ROAS অর্জিত হয়েছে। ডেটা নিশ্চিত করছে যে অ্যালগরিদমিক ভ্যালু-বেসড বিডিংয়ে রূপান্তর লাভজনক হবে।`,
        requiresManualApproval: true,
        status: 'PROPOSED',
        proposedAt: new Date(),
      });
    }

    // 2. Creative Decay / Refresh Strategy Trigger
    const tiktokMetrics = metrics.filter((m) => m.platform === 'TIKTOK');
    const lowHookTikTok = tiktokMetrics.find(
      (m) => m.videoHookRate !== undefined && m.videoHookRate < 0.2
    );

    if (lowHookTikTok) {
      recommendations.push({
        id: `rec_strat_creative_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: 'STRATEGY_IMPROVEMENT',
        title: 'Implement 7-Day Creative Sprint Rotation for TikTok Spark Ads',
        targetEntityId: lowHookTikTok.entityId,
        targetEntityType: 'STRATEGY',
        platform: 'TIKTOK',
        currentPattern: '14-day creative refresh frequency',
        proposedPattern: '7-day creative rotation with fast-cut hook testing in first 3 seconds',
        confidenceScore: 0.84,
        evidence: {
          sampleSize: tiktokMetrics.length,
          metricsObserved: {
            entityId: lowHookTikTok.entityId,
            videoHookRate: lowHookTikTok.videoHookRate,
            benchmarkHookRate: 0.25,
          },
          validationOutcome: 'BOTTLENECK_IDENTIFIED',
        },
        rationaleEnglish: `Observed hook rate (${((lowHookTikTok.videoHookRate ?? 0) * 100).toFixed(1)}%) is below the 25% engagement baseline, indicating ad creative fatigue.`,
        rationaleBangla: `ভিডিও হুক রেট (${((lowHookTikTok.videoHookRate ?? 0) * 100).toFixed(1)}%) ২৫% বেসলাইনের নিচে রয়েছে, যা ক্রিয়েটিভ ক্লান্তির সুস্পষ্ট লক্ষণ।`,
        requiresManualApproval: true,
        status: 'PROPOSED',
        proposedAt: new Date(),
      });
    }

    return recommendations;
  }
}
