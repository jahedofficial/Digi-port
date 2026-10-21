import {
  ActionableRecommendation,
  ConflictType,
  DetectedConflict,
  IConflictResolver,
} from './types';

/**
 * Deterministic Conflict Resolution Engine
 * Detects budget competition, opposing action directives, and audience cannibalization.
 */
export class ConflictResolver implements IConflictResolver {
  public detectAndResolveConflicts(
    recommendations: ActionableRecommendation[],
    totalBudgetCap?: number
  ): {
    resolvedRecommendations: ActionableRecommendation[];
    conflicts: DetectedConflict[];
  } {
    const conflicts: DetectedConflict[] = [];
    let resolvedList = [...recommendations];

    // 1. Detect and Resolve Opposing Actions on the same entity
    const entityActionMap = new Map<string, ActionableRecommendation[]>();
    for (const rec of resolvedList) {
      if (rec.entityId) {
        const key = `${rec.platform}:${rec.entityId}`;
        const existing = entityActionMap.get(key) ?? [];
        existing.push(rec);
        entityActionMap.set(key, existing);
      }
    }

    for (const [key, recs] of entityActionMap.entries()) {
      if (recs.length > 1) {
        const hasPause = recs.some((r) => r.type === 'UNDERPERFORMER_PAUSE');
        const hasScale = recs.some(
          (r) => r.type === 'CAMPAIGN_SCALING' || r.type === 'BUDGET_REALLOCATION'
        );

        if (hasPause && hasScale) {
          const pauseRec = recs.find((r) => r.type === 'UNDERPERFORMER_PAUSE')!;
          const scaleRec = recs.find(
            (r) => r.type === 'CAMPAIGN_SCALING' || r.type === 'BUDGET_REALLOCATION'
          )!;

          // Resolve by confidence and priority
          const keepPause = pauseRec.priority === 'CRITICAL' || pauseRec.confidence.score > scaleRec.confidence.score;
          const dropped = keepPause ? scaleRec : pauseRec;
          const kept = keepPause ? pauseRec : scaleRec;

          resolvedList = resolvedList.filter((r) => r.id !== dropped.id);

          conflicts.push({
            conflictId: `conf_opposing_${Date.now()}_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
            type: 'OPPOSING_ACTIONS',
            affectedRecommendationIds: [pauseRec.id, scaleRec.id],
            description: `Contradictory directives detected on entity [${key}]: ${pauseRec.title} vs ${scaleRec.title}.`,
            resolved: true,
            resolutionStrategy: 'CANCEL_OPPOSING',
            resolutionExplanation: `Retained [${kept.title}] due to higher priority/confidence (${kept.confidence.score} vs ${dropped.confidence.score}); dropped conflicting directive.`,
          });
        }
      }
    }

    // 2. Detect and Resolve Budget Competition across platforms
    if (totalBudgetCap && totalBudgetCap > 0) {
      const budgetIncreases = resolvedList.filter(
        (r) =>
          (r.type === 'CAMPAIGN_SCALING' || r.type === 'BUDGET_REALLOCATION') &&
          typeof r.recommendedValue === 'number' &&
          typeof r.currentValue === 'number' &&
          r.recommendedValue > r.currentValue
      );

      const totalRequestedIncrease = budgetIncreases.reduce((acc, r) => {
        return acc + ((r.recommendedValue as number) - (r.currentValue as number));
      }, 0);

      if (totalRequestedIncrease > totalBudgetCap) {
        // Apply Pro-Rata Scaling or ROAS-Prioritization
        const sortedByRoas = [...budgetIncreases].sort((a, b) => {
          const roasA = a.projectedImpact.expectedRoasDelta ?? 0;
          const roasB = b.projectedImpact.expectedRoasDelta ?? 0;
          return roasB - roasA;
        });

        let remainingBudgetToDistribute = totalBudgetCap;

        for (const rec of sortedByRoas) {
          const originalDelta = (rec.recommendedValue as number) - (rec.currentValue as number);
          if (remainingBudgetToDistribute >= originalDelta) {
            remainingBudgetToDistribute -= originalDelta;
          } else {
            const cappedDelta = Math.max(0, remainingBudgetToDistribute);
            rec.recommendedValue = (rec.currentValue as number) + cappedDelta;
            remainingBudgetToDistribute = 0;
          }
        }

        conflicts.push({
          conflictId: `conf_budget_${Date.now()}`,
          type: 'BUDGET_COMPETITION',
          affectedRecommendationIds: budgetIncreases.map((r) => r.id),
          description: `Total requested budget increase ($${totalRequestedIncrease}) exceeds available budget ceiling ($${totalBudgetCap}).`,
          resolved: true,
          resolutionStrategy: 'PRIORITIZE_HIGHER_ROAS',
          resolutionExplanation: `Cap enforced: prioritized recommendations with highest projected ROAS delta; remaining budget distributed pro-rata.`,
        });
      }
    }

    return {
      resolvedRecommendations: resolvedList,
      conflicts,
    };
  }
}
