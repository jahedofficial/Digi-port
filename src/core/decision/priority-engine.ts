import { ClientMemoryProfile } from '../memory/types';
import { ActionableRecommendation, IPriorityEngine, PriorityLevel } from './types';

/**
 * Deterministic Priority Engine
 * Evaluates urgency and impact based on financial bleed, ROAS floor violations, and client governance.
 */
export class PriorityEngine implements IPriorityEngine {
  public calculatePriority(
    recommendation: Omit<ActionableRecommendation, 'priority' | 'confidence' | 'approval'>,
    memoryProfile?: ClientMemoryProfile
  ): PriorityLevel {
    const savings = recommendation.projectedImpact.expectedCostSavings ?? 0;
    const targetRoasFloor = memoryProfile?.businessGoals?.targetRoasFloor ?? 2.5;

    // 1. Critical Urgency Conditions
    if (savings >= 500) {
      return 'CRITICAL';
    }

    if (recommendation.type === 'UNDERPERFORMER_PAUSE') {
      const currentRoas = typeof recommendation.currentValue === 'number' ? recommendation.currentValue : 0;
      if (currentRoas > 0 && currentRoas < targetRoasFloor * 0.5) {
        return 'CRITICAL'; // Bleeding at less than 50% of target ROAS
      }
    }

    // 2. High Urgency Conditions
    if (savings >= 150) {
      return 'HIGH';
    }

    if (
      recommendation.type === 'BUDGET_REALLOCATION' ||
      recommendation.type === 'CROSS_PLATFORM_REBALANCE' ||
      recommendation.type === 'UNDERPERFORMER_PAUSE'
    ) {
      return 'HIGH';
    }

    const roasDelta = recommendation.projectedImpact.expectedRoasDelta ?? 0;
    if (roasDelta >= 0.5) {
      return 'HIGH';
    }

    // 3. Medium Urgency Conditions
    if (recommendation.type === 'CREATIVE_REFRESH') {
      return 'MEDIUM';
    }

    if (
      (recommendation.type === 'BID_STRATEGY_ADJUSTMENT' ||
        recommendation.type === 'AUDIENCE_EXPANSION') &&
      (savings >= 20 || roasDelta >= 0.1)
    ) {
      return 'MEDIUM';
    }

    if (savings >= 50 || roasDelta >= 0.2) {
      return 'MEDIUM';
    }

    // 4. Default: Low Urgency
    return 'LOW';
  }
}
