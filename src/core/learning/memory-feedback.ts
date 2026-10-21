import {
  IMemoryFeedback,
  LearningRecommendation,
  ValidatedExecutionOutcome,
} from './types';

/**
 * Memory Feedback Sub-Engine
 * Analyzes empirical campaign performance against client memory profiles
 * and generates recommendations to calibrate business goals and thresholds.
 */
export class MemoryFeedback implements IMemoryFeedback {
  public async analyzeMemoryFeedback(
    outcome: ValidatedExecutionOutcome
  ): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];
    const { metrics, clientContext, clientMemory } = outcome;

    if (!metrics || metrics.length === 0 || !clientMemory || !clientMemory.businessGoals) {
      return recommendations;
    }

    const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);
    const totalRevenue = metrics.reduce((sum, m) => sum + (m.conversionValue ?? 0), 0);
    const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);

    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const blendedCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

    const currentRoasFloor = clientMemory.businessGoals.targetRoasFloor;
    const currentMaxCpa = clientMemory.businessGoals.maxAllowableCpa;

    // 1. Propose Raising ROAS Floor when actual performance outpaces baseline
    if (blendedRoas >= currentRoasFloor * 1.15 && totalSpend >= 500) {
      const suggestedFloor = Number((currentRoasFloor * 1.2).toFixed(2));
      recommendations.push({
        id: `rec_mem_roas_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: 'MEMORY_FEEDBACK',
        title: `Calibrate Client [${clientContext.clientId}] ROAS Floor to ${suggestedFloor}x`,
        targetEntityId: clientContext.clientId,
        targetEntityType: 'CLIENT_MEMORY',
        currentPattern: `Target ROAS Floor: ${currentRoasFloor.toFixed(2)}x`,
        proposedPattern: `Updated Target ROAS Floor: ${suggestedFloor}x (locking in empirical efficiency gains)`,
        confidenceScore: 0.89,
        evidence: {
          sampleSize: metrics.length,
          metricsObserved: {
            actualBlendedRoas: Number(blendedRoas.toFixed(2)),
            currentRoasFloor,
            proposedFloor: suggestedFloor,
            totalSpend,
          },
          validationOutcome: 'PROVEN_LIFT',
        },
        rationaleEnglish: `Observed performance (${blendedRoas.toFixed(2)}x ROAS) substantially outperforms historical floor (${currentRoasFloor}x). Raising floor prevents algorithmic overbidding on marginal inventory.`,
        rationaleBangla: `বাস্তব পারফরম্যান্স (${blendedRoas.toFixed(2)}x ROAS) বর্তমান বেসলাইনের (${currentRoasFloor}x) চেয়ে বেশি। ফ্লোর বৃদ্ধি অ্যালগরিদমকে অতিরিক্ত খরচ থেকে বিরত রাখবে।`,
        requiresManualApproval: true,
        status: 'PROPOSED',
        proposedAt: new Date(),
      });
    }

    // 2. Propose Tightening CPA Ceiling when efficient conversion costs are validated
    if (blendedCpa > 0 && blendedCpa <= currentMaxCpa * 0.75 && totalConversions >= 15) {
      const suggestedCpa = Math.round(currentMaxCpa * 0.85);
      recommendations.push({
        id: `rec_mem_cpa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: 'MEMORY_FEEDBACK',
        title: `Calibrate Client [${clientContext.clientId}] CPA Ceiling to $${suggestedCpa}`,
        targetEntityId: clientContext.clientId,
        targetEntityType: 'CLIENT_MEMORY',
        currentPattern: `Max Allowable CPA: $${currentMaxCpa}`,
        proposedPattern: `Tighter Max Allowable CPA: $${suggestedCpa} (improving bottom-line profit margin)`,
        confidenceScore: 0.85,
        evidence: {
          sampleSize: totalConversions,
          metricsObserved: {
            actualBlendedCpa: Number(blendedCpa.toFixed(2)),
            currentMaxCpa,
            proposedMaxCpa: suggestedCpa,
          },
          validationOutcome: 'EFFICIENCY_GAIN',
        },
        rationaleEnglish: `Validated conversions demonstrate stable acquisition costs at $${blendedCpa.toFixed(2)}. Lowering allowable CPA ceiling protects client margins against sudden traffic spikes.`,
        rationaleBangla: `যাচাইকৃত কনভার্সনে গড় CPA $${blendedCpa.toFixed(2)} পাওয়া গেছে। CPA সিলিং $${suggestedCpa}-এ নামালে ক্লায়েন্টের প্রফিট মার্জিন আরও সুরক্ষিত থাকবে।`,
        requiresManualApproval: true,
        status: 'PROPOSED',
        proposedAt: new Date(),
      });
    }

    return recommendations;
  }
}
