import {
  ActionableRecommendation,
  IRecommendationRanker,
  PRIORITY_WEIGHTS,
} from './types';

/**
 * Deterministic Recommendation Ranker
 * Sorts recommendations reproducibly based on priority tier, financial impact, and confidence score.
 */
export class RecommendationRanker implements IRecommendationRanker {
  public rankRecommendations(
    recommendations: ActionableRecommendation[]
  ): ActionableRecommendation[] {
    return [...recommendations].sort((a, b) => {
      // 1. Priority Weight (CRITICAL > HIGH > MEDIUM > LOW)
      const weightA = PRIORITY_WEIGHTS[a.priority] ?? 0;
      const weightB = PRIORITY_WEIGHTS[b.priority] ?? 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // 2. Projected Financial Impact (Cost savings or ROAS delta)
      const impactA = (a.projectedImpact.expectedCostSavings ?? 0) + (a.projectedImpact.expectedRoasDelta ?? 0) * 100;
      const impactB = (b.projectedImpact.expectedCostSavings ?? 0) + (b.projectedImpact.expectedRoasDelta ?? 0) * 100;
      if (Math.abs(impactB - impactA) > 0.01) {
        return impactB - impactA;
      }

      // 3. Confidence Score DESC
      if (Math.abs(b.confidence.score - a.confidence.score) > 0.01) {
        return b.confidence.score - a.confidence.score;
      }

      // 4. Deterministic Tie-Breaker: ID ASC
      return a.id.localeCompare(b.id);
    });
  }
}
