import {
  IMemoryRanking,
  MemoryEntry,
  MemoryRankingCriteria,
  RankedMemoryEntry,
} from './types';

/**
 * Deterministic Memory Ranking Engine
 * Calculates reproducible ranking scores based on importance, confidence, recency, and query relevance.
 */
export class MemoryRanking implements IMemoryRanking {
  private static readonly DEFAULT_IMPORTANCE_WEIGHT = 0.4;
  private static readonly DEFAULT_CONFIDENCE_WEIGHT = 0.3;
  private static readonly DEFAULT_RECENCY_WEIGHT = 0.2;
  private static readonly DEFAULT_QUERY_RELEVANCE_WEIGHT = 0.1;

  /**
   * Ranks an array of memory entries deterministically.
   */
  public rankEntries(
    entries: MemoryEntry[],
    query?: string,
    criteria?: MemoryRankingCriteria
  ): RankedMemoryEntry[] {
    const importanceWeight = criteria?.importanceWeight ?? MemoryRanking.DEFAULT_IMPORTANCE_WEIGHT;
    const confidenceWeight = criteria?.confidenceWeight ?? MemoryRanking.DEFAULT_CONFIDENCE_WEIGHT;
    const recencyWeight = criteria?.recencyWeight ?? MemoryRanking.DEFAULT_RECENCY_WEIGHT;
    const queryRelevanceWeight =
      criteria?.queryRelevanceWeight ?? MemoryRanking.DEFAULT_QUERY_RELEVANCE_WEIGHT;

    const normalizedQuery = query ? query.toLowerCase().trim() : '';

    const ranked: RankedMemoryEntry[] = entries.map((entry) => {
      // 1. Importance score: importance is 1-10 -> normalized to 0.1 - 1.0
      const normImportance = Math.min(Math.max(entry.importance / 10, 0.1), 1.0);
      const importanceScore = normImportance * importanceWeight;

      // 2. Confidence score: 0.0 - 1.0
      const normConfidence = Math.min(Math.max(entry.confidence, 0.0), 1.0);
      const confidenceScore = normConfidence * confidenceWeight;

      // 3. Recency score: decay over days
      const ageInDays = Math.max(
        0,
        (Date.now() - new Date(entry.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyFactor = 1 / (1 + ageInDays / 30); // 30-day half-life
      const recencyScore = recencyFactor * recencyWeight;

      // 4. Query relevance score
      let relevanceFactor = 1.0;
      if (normalizedQuery.length > 0) {
        relevanceFactor = this.calculateRelevance(entry, normalizedQuery);
      }
      const relevanceScore = relevanceFactor * queryRelevanceWeight;

      const totalScore = Math.round((importanceScore + confidenceScore + recencyScore + relevanceScore) * 1000000) / 1000000;

      return {
        entry,
        score: totalScore,
        scoreBreakdown: {
          importance: Math.round(importanceScore * 100000) / 100000,
          confidence: Math.round(confidenceScore * 100000) / 100000,
          recency: Math.round(recencyScore * 100000) / 100000,
          relevance: Math.round(relevanceScore * 100000) / 100000,
        },
      };
    });

    // Deterministic Sort:
    // 1. total score DESC
    // 2. version DESC
    // 3. entry ID ASC
    return ranked.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.000001) {
        return b.score - a.score;
      }
      if (b.entry.version !== a.entry.version) {
        return b.entry.version - a.entry.version;
      }
      return a.entry.id.localeCompare(b.entry.id);
    });
  }

  private calculateRelevance(entry: MemoryEntry, query: string): number {
    const keyLower = entry.key.toLowerCase();
    const categoryLower = entry.category.toLowerCase();
    const valueString = typeof entry.value === 'string'
      ? entry.value.toLowerCase()
      : JSON.stringify(entry.value).toLowerCase();

    // Exact key match
    if (keyLower === query) {
      return 1.0;
    }

    // Key contains query
    if (keyLower.includes(query)) {
      return 0.85;
    }

    // Category contains query
    if (categoryLower.includes(query)) {
      return 0.7;
    }

    // Value contains query
    if (valueString.includes(query)) {
      return 0.5;
    }

    // Fuzzy token match
    const tokens = query.split(/\s+/).filter(t => t.length > 2);
    if (tokens.length > 0) {
      const matchCount = tokens.filter(
        t => keyLower.includes(t) || categoryLower.includes(t) || valueString.includes(t)
      ).length;
      return matchCount / tokens.length * 0.4;
    }

    return 0.0;
  }
}
