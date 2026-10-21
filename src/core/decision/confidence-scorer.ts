import { ConfidenceScore, IConfidenceScorer } from './types';

/**
 * Deterministic Confidence Scoring Engine
 * Combines statistical sample size, metric variance, and data completeness.
 */
export class ConfidenceScorer implements IConfidenceScorer {
  public calculateConfidence(
    sampleSize: number, // e.g. conversions or event count
    variance: number, // metric coefficient of variation (0.0 to 1.0+)
    dataCompleteness: number // percentage of available days/metrics (0.0 to 1.0)
  ): ConfidenceScore {
    // 1. Sample Size Factor (0.0 - 1.0)
    let sampleSizeFactor = 0.2;
    if (sampleSize >= 50) {
      sampleSizeFactor = 1.0;
    } else if (sampleSize >= 30) {
      sampleSizeFactor = 0.85;
    } else if (sampleSize >= 15) {
      sampleSizeFactor = 0.65;
    } else if (sampleSize >= 5) {
      sampleSizeFactor = 0.45;
    }

    // 2. Variance Stability Factor (lower variance = higher confidence)
    let varianceFactor = 0.4;
    if (variance <= 0.15) {
      varianceFactor = 1.0;
    } else if (variance <= 0.3) {
      varianceFactor = 0.8;
    } else if (variance <= 0.5) {
      varianceFactor = 0.6;
    }

    // 3. Data Completeness Factor
    const completenessFactor = Math.min(Math.max(dataCompleteness, 0.0), 1.0);

    // 4. Weighted Total
    const score =
      Math.round(
        (sampleSizeFactor * 0.4 + varianceFactor * 0.35 + completenessFactor * 0.25) * 100
      ) / 100;

    let explanation = 'High statistical confidence based on robust conversion sample size and low variance.';
    if (score < 0.6) {
      explanation = 'Moderate confidence: limited conversion sample size or high day-to-day variance detected.';
    }
    if (score < 0.4) {
      explanation = 'Low confidence: early-stage data with insufficient statistical significance.';
    }

    return {
      score,
      sampleSizeFactor,
      varianceFactor,
      dataCompletenessFactor: completenessFactor,
      explanation,
    };
  }
}
