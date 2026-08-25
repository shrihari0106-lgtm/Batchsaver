/**
 * @file modules/quality-monitoring/src/engine/deviation-calculator.ts
 * @description Pure calculation functions for parameter deviations.
 *
 * Calculates:
 *  - absolute deviation (|value - target|)
 *  - signed deviation (value - target)
 *  - percentage deviation ((value - target) / target * 100)
 *  - distance from target
 *  - deviation direction (HIGH | LOW | WITHIN_TARGET)
 *  - lower and upper acceptable limits
 */

import { DeviationDirectionSimple, QualityParameter } from '@batchsaver/shared-types';
import { ParameterThreshold } from '@batchsaver/shared-types';

export interface DeviationMetrics {
  readonly target: number;
  readonly lowerLimit: number;
  readonly upperLimit: number;
  readonly absoluteDeviation: number;
  readonly signedDeviation: number;
  readonly percentageDeviation: number;
  readonly distanceFromTarget: number;
  readonly direction: DeviationDirectionSimple;
}

/**
 * Calculates all deviation metrics for a parameter value given its threshold configuration.
 */
export function calculateDeviationMetrics(
  value: number,
  threshold: ParameterThreshold
): DeviationMetrics {
  const target = threshold.target;
  const lowerLimit = Number((target - threshold.criticalTolerance).toFixed(4));
  const upperLimit = Number((target + threshold.criticalTolerance).toFixed(4));

  const signedDeviation = Number((value - target).toFixed(4));
  const absoluteDeviation = Number(Math.abs(signedDeviation).toFixed(4));
  const distanceFromTarget = absoluteDeviation;

  const percentageDeviation = target === 0
    ? 0
    : Number((((value - target) / target) * 100).toFixed(2));

  let direction: DeviationDirectionSimple;
  if (value > upperLimit || (value > target && absoluteDeviation > threshold.warningTolerance)) {
    direction = 'HIGH';
  } else if (value < lowerLimit || (value < target && absoluteDeviation > threshold.warningTolerance)) {
    direction = 'LOW';
  } else {
    direction = 'WITHIN_TARGET';
  }

  return {
    target,
    lowerLimit,
    upperLimit,
    absoluteDeviation,
    signedDeviation,
    percentageDeviation,
    distanceFromTarget,
    direction,
  };
}
