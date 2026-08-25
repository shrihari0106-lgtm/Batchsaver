/**
 * @file modules/quality-monitoring/src/engine/trend-analyzer.ts
 * @description Deterministic sliding-window trend analyzer.
 *
 * Evaluates process trajectory using recent reading history.
 * Classifies parameters into:
 *  - STABLE
 *  - RISING
 *  - FALLING
 *  - DRIFTING_HIGH
 *  - DRIFTING_LOW
 *
 * Uses linear slope calculation over configured window (default: 5 readings).
 * No ML dependencies — fully deterministic and testable.
 */

import { TrendDirection, QualityParameter } from '@batchsaver/shared-types';
import { ParameterThreshold } from '@batchsaver/shared-types';

export interface TrendAnalysisDetails {
  readonly parameter: QualityParameter;
  readonly trend: TrendDirection;
  readonly slope: number; // change per reading step
  readonly sampleCount: number;
  readonly meanValue: number;
  readonly targetValue: number;
  readonly isDriftingTowardsLimit: boolean;
}

/**
 * Calculates linear regression slope of an array of numeric values.
 */
export function calculateSlope(values: readonly number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return 0;

  return Number(((n * sumXY - sumX * sumY) / denominator).toFixed(4));
}

/**
 * Analyzes trend direction for a parameter based on recent value history.
 */
export function analyzeTrend(
  parameter: QualityParameter,
  recentValues: readonly number[],
  threshold: ParameterThreshold,
  windowSize: number = 5
): TrendAnalysisDetails {
  const history = recentValues.slice(-windowSize);
  const n = history.length;
  const target = threshold.target;

  if (n < 3) {
    return {
      parameter,
      trend: 'STABLE',
      slope: 0,
      sampleCount: n,
      meanValue: n > 0 ? history[n - 1] : target,
      targetValue: target,
      isDriftingTowardsLimit: false,
    };
  }

  const slope = calculateSlope(history);
  const currentValue = history[n - 1];
  const meanValue = Number((history.reduce((a, b) => a + b, 0) / n).toFixed(2));

  // Normalized slope relative to warning tolerance
  const normSlope = slope / threshold.warningTolerance;

  // Thresholds for trend classification
  const SIGNIFICANT_SLOPE = 0.05; // 5% of warning tolerance change per step
  const DRIFT_SLOPE = 0.10;       // 10% of warning tolerance change per step

  let trend: TrendDirection = 'STABLE';
  let isDriftingTowardsLimit = false;

  if (Math.abs(normSlope) < SIGNIFICANT_SLOPE) {
    trend = 'STABLE';
  } else if (normSlope >= DRIFT_SLOPE && currentValue >= target) {
    trend = 'DRIFTING_HIGH';
    isDriftingTowardsLimit = true;
  } else if (normSlope <= -DRIFT_SLOPE && currentValue <= target) {
    trend = 'DRIFTING_LOW';
    isDriftingTowardsLimit = true;
  } else if (normSlope > 0) {
    trend = 'RISING';
    if (currentValue > target) isDriftingTowardsLimit = true;
  } else {
    trend = 'FALLING';
    if (currentValue < target) isDriftingTowardsLimit = true;
  }

  return {
    parameter,
    trend,
    slope,
    sampleCount: n,
    meanValue,
    targetValue: target,
    isDriftingTowardsLimit,
  };
}
