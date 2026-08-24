/**
 * @file packages/shared-utils/src/math.ts
 * @description Industrial Math & Statistical Calculation Utilities
 */

import { QualityParameter, QualityState } from '@batchsaver/shared-types';
import { getParameterThreshold } from '@batchsaver/config';

/**
 * Calculates absolute deviation from target
 */
export function calculateDeviation(value: number, target: number): number {
  return Number((value - target).toFixed(4));
}

/**
 * Calculates percentage deviation from target
 */
export function calculateDeviationPercentage(value: number, target: number): number {
  if (target === 0) return 0;
  return Number((((value - target) / target) * 100).toFixed(2));
}

/**
 * Classifies quality state based on observed value and parameter threshold
 */
export function classifyQualityState(param: QualityParameter, value: number): QualityState {
  const threshold = getParameterThreshold(param);
  const absDev = Math.abs(value - threshold.target);

  if (absDev <= threshold.warningTolerance) {
    return 'NOMINAL';
  } else if (absDev <= threshold.criticalTolerance) {
    return 'WARNING';
  } else if (absDev <= threshold.criticalTolerance * 1.5) {
    return 'DEVIATION';
  } else {
    return 'CRITICAL';
  }
}

/**
 * Calculates composite Batch Health Score (0-100) based on weighted parameter deviations
 */
export function calculateCompositeHealthScore(parameters: {
  viscosityDevPct: number;
  moistureDevPct: number;
  colourDevPct: number;
  tempDevPct: number;
}): number {
  // Industrial weights for wet masala manufacturing
  const weights = {
    viscosity: 0.35,
    moisture: 0.30,
    colour: 0.15,
    temperature: 0.20,
  };

  const scoreFor = (devPct: number): number => {
    const absDev = Math.abs(devPct);
    if (absDev <= 2.0) return 100;
    if (absDev <= 5.0) return Math.max(70, 100 - (absDev - 2) * 10);
    if (absDev <= 10.0) return Math.max(40, 70 - (absDev - 5) * 6);
    return Math.max(0, 40 - (absDev - 10) * 4);
  };

  const total =
    scoreFor(parameters.viscosityDevPct) * weights.viscosity +
    scoreFor(parameters.moistureDevPct) * weights.moisture +
    scoreFor(parameters.colourDevPct) * weights.colour +
    scoreFor(parameters.tempDevPct) * weights.temperature;

  return Math.round(Math.min(100, Math.max(0, total)));
}

/**
 * Generates Gaussian/Normal random noise using Box-Muller transform
 */
export function generateGaussianNoise(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.max(1e-7, Math.random());
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}
