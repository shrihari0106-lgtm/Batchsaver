/**
 * @file modules/quality-monitoring/src/engine/health-calculator.ts
 * @description Parameter health and composite Batch Health Score calculator.
 *
 * Deterministic and explainable scoring (0–100):
 *  - 100: Exactly at or very near target (within 25% of warning tolerance)
 *  - 75-99: Within warning tolerance
 *  - 50-74: Within critical tolerance (minor/moderate deviation)
 *  - 25-49: Exceeds critical tolerance (major deviation)
 *  - 0-24: Severe critical deviation (> 1.5x critical tolerance)
 *
 * Provides human-readable breakdown explaining main contributors to the score.
 */

import {
  HealthScore,
  QualityParameter,
  QualityState,
  ParameterThreshold,
  QualityEngineConfig,
} from '@batchsaver/shared-types';

export interface ParameterHealthDetail {
  readonly parameter: QualityParameter;
  readonly score: number;
  readonly weight: number;
  readonly percentageDeviation: number;
  readonly absoluteDeviation: number;
  readonly status: QualityState;
  readonly contributorDescription: string;
}

export interface DetailedHealthScore extends HealthScore {
  readonly explanations: readonly string[];
  readonly parameterDetails: {
    readonly [K in QualityParameter]: ParameterHealthDetail;
  };
}

/**
 * Calculates individual parameter health score (0–100).
 */
export function calculateParameterHealthScore(
  value: number,
  threshold: ParameterThreshold
): number {
  const absDev = Math.abs(value - threshold.target);
  const warnTol = threshold.warningTolerance;
  const critTol = threshold.criticalTolerance;

  if (absDev <= warnTol * 0.25) return 100;
  if (absDev <= warnTol) {
    // Linear scale from 100 down to 85
    const ratio = (absDev - warnTol * 0.25) / (warnTol * 0.75);
    return Math.round(100 - ratio * 15);
  }
  if (absDev <= critTol) {
    // Linear scale from 85 down to 60
    const ratio = (absDev - warnTol) / (critTol - warnTol);
    return Math.round(85 - ratio * 25);
  }
  if (absDev <= critTol * 1.5) {
    // Linear scale from 60 down to 30
    const ratio = (absDev - critTol) / (critTol * 0.5);
    return Math.round(60 - ratio * 30);
  }
  // Extreme deviation
  const excessRatio = (absDev - critTol * 1.5) / critTol;
  return Math.max(0, Math.round(30 - excessRatio * 30));
}

/**
 * Generates human-readable contributor description for a parameter's health.
 */
export function describeParameterContribution(
  param: QualityParameter,
  score: number,
  pctDev: number
): string {
  const paramName = param === 'COLOUR_INDEX' ? 'Colour Index' : param.charAt(0) + param.slice(1).toLowerCase();
  if (score >= 95) return `${paramName}: within target (${pctDev >= 0 ? '+' : ''}${pctDev}%)`;
  if (score >= 80) return `${paramName}: minor deviation (${pctDev >= 0 ? '+' : ''}${pctDev}%)`;
  if (score >= 60) return `${paramName}: moderate deviation (${pctDev >= 0 ? '+' : ''}${pctDev}%)`;
  if (score >= 30) return `${paramName}: major deviation (${pctDev >= 0 ? '+' : ''}${pctDev}%)`;
  return `${paramName}: CRITICAL deviation (${pctDev >= 0 ? '+' : ''}${pctDev}%)`;
}

/**
 * Maps composite health score to overall QualityState.
 */
export function healthScoreToOverallStatus(score: number): QualityState {
  if (score >= 90) return 'NOMINAL';
  if (score >= 75) return 'WARNING';
  if (score >= 50) return 'DEVIATION';
  return 'CRITICAL';
}

/**
 * Calculates composite Batch Health Score across all 4 parameters.
 */
export function calculateBatchHealthScore(
  batchId: string,
  parameterValues: {
    [K in QualityParameter]?: {
      value: number;
      threshold: ParameterThreshold;
      pctDev: number;
      status: QualityState;
    };
  },
  config: QualityEngineConfig,
  timestamp: string
): DetailedHealthScore {
  const params: QualityParameter[] = ['VISCOSITY', 'MOISTURE', 'COLOUR_INDEX', 'TEMPERATURE'];
  const weights = config.healthWeights;

  let totalScore = 0;
  let totalWeight = 0;
  const parameterDetails: Partial<Record<QualityParameter, ParameterHealthDetail>> = {};
  const parameterContributions: Partial<Record<QualityParameter, { score: number; weight: number; currentDeviationPct: number }>> = {};
  const explanations: string[] = [];

  for (const param of params) {
    const data = parameterValues[param];
    const weight = weights[param] ?? 0.25;

    let score = 100;
    let pctDev = 0;

    if (data) {
      score = calculateParameterHealthScore(data.value, data.threshold);
      pctDev = data.pctDev;
    }

    const desc = describeParameterContribution(param, score, pctDev);
    explanations.push(desc);

    parameterDetails[param] = {
      parameter: param,
      score,
      weight,
      percentageDeviation: pctDev,
      absoluteDeviation: data ? Math.abs(data.value - data.threshold.target) : 0,
      status: data ? data.status : 'NOMINAL',
      contributorDescription: desc,
    };

    parameterContributions[param] = {
      score,
      weight,
      currentDeviationPct: pctDev,
    };

    totalScore += score * weight;
    totalWeight += weight;
  }

  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 100;
  const overallStatus = healthScoreToOverallStatus(finalScore);

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    status: overallStatus,
    timestamp,
    batchId,
    parameterContributions: parameterContributions as HealthScore['parameterContributions'],
    explanations,
    parameterDetails: parameterDetails as DetailedHealthScore['parameterDetails'],
  };
}
