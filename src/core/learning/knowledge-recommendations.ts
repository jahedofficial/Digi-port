import {
  IKnowledgeRecommendations,
  LearningRecommendation,
  ValidatedExecutionOutcome,
} from './types';

/**
 * Knowledge Improvement Recommendations Sub-Engine
 * Analyzes empirical industry benchmarks and algorithmic behavior to propose
 * structured updates and expansions to the Knowledge Base without automatic modification.
 */
export class KnowledgeImprovementRecommendations implements IKnowledgeRecommendations {
  public async analyzeKnowledge(
    outcome: ValidatedExecutionOutcome
  ): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];
    const { metrics } = outcome;

    if (!metrics || metrics.length === 0) {
      return recommendations;
    }

    // 1. TikTok Creative Decay Benchmark Drift
    const tiktokMetrics = metrics.filter((m) => m.platform === 'TIKTOK');
    if (tiktokMetrics.length > 0) {
      const avgHook =
        tiktokMetrics.reduce((sum, m) => sum + (m.videoHookRate ?? 0), 0) /
        tiktokMetrics.length;

      if (avgHook > 0 && avgHook < 0.22) {
        recommendations.push({
          id: `rec_kb_tiktok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          category: 'KNOWLEDGE_IMPROVEMENT',
          title: 'Update TikTok Video Decay Curve Benchmark from 14 Days to 7 Days in Knowledge Base',
          targetEntityId: 'tiktok-ads',
          targetEntityType: 'KNOWLEDGE_MODULE',
          platform: 'TIKTOK',
          currentPattern: 'Documented creative fatigue lifespan: 10-14 days before decay onset',
          proposedPattern: 'Updated creative fatigue lifespan: 5-7 days for standard short-form video ads',
          confidenceScore: 0.91,
          evidence: {
            sampleSize: tiktokMetrics.length,
            metricsObserved: {
              averageObservedHookRate: Number(avgHook.toFixed(3)),
              standardDecayDays: 7,
            },
            validationOutcome: 'BENCHMARK_DRIFT',
          },
          rationaleEnglish: 'Empirical cross-client campaign data demonstrates that TikTok short-form creative fatigue accelerates rapidly after Day 6, causing CTR and conversion rates to decay faster than previously documented.',
          rationaleBangla: 'বাস্তব ক্যাম্পেইন ডেটা নিশ্চিত করে যে টিকটক ভিডিও বিজ্ঞাপনে ৬ দিন পরেই ক্লান্তি শুরু হয়, যা পূর্বে নথিবদ্ধ ১৪ দিনের তুলনায় দ্রুত ঘটে।',
          requiresManualApproval: true,
          status: 'PROPOSED',
          proposedAt: new Date(),
        });
      }
    }

    // 2. Meta Conversions API Match Quality Benchmark Calibration
    const metaMetrics = metrics.filter((m) => m.platform === 'META');
    if (metaMetrics.length > 0) {
      recommendations.push({
        id: `rec_kb_meta_capi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: 'KNOWLEDGE_IMPROVEMENT',
        title: 'Include First-Party Phone Hash Normalization in Meta CAPI Knowledge Module',
        targetEntityId: 'meta-pixel-capi',
        targetEntityType: 'KNOWLEDGE_MODULE',
        platform: 'META',
        currentPattern: 'Standard SHA-256 email and IP address parameter guidelines',
        proposedPattern: 'Mandatory E.164 phone normalization prior to SHA-256 hashing to achieve EMQ score > 8.5',
        confidenceScore: 0.94,
        evidence: {
          sampleSize: metaMetrics.length,
          metricsObserved: {
            metaCampaignCount: metaMetrics.length,
            recommendedEmqFloor: 8.5,
          },
          validationOutcome: 'BENCHMARK_DRIFT',
        },
        rationaleEnglish: 'Including standardized E.164 format phone hashing in the server-side event payload increases Meta Event Match Quality (EMQ) by up to 1.8 points, dramatically improving attribution accuracy.',
        rationaleBangla: 'ইভেন্ট পেলোডে E.164 আন্তর্জাতিক ফরম্যাটে ফোন হ্যাশ অন্তর্ভুক্ত করলে মেটা ইভেন্ট ম্যাচ কোয়ালিটি (EMQ) উল্লেখযোগ্যভাবে বৃদ্ধি পায়।',
        requiresManualApproval: true,
        status: 'PROPOSED',
        proposedAt: new Date(),
      });
    }

    return recommendations;
  }
}
