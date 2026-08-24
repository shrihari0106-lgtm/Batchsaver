/**
 * @file packages/shared-utils/src/validation.ts
 * @description Validation utilities for process inputs and commands
 */

import { QualityParameter, ActuatorType } from '@batchsaver/shared-types';

export function isValidQualityParameter(val: string): val is QualityParameter {
  return ['VISCOSITY', 'MOISTURE', 'COLOUR_INDEX', 'TEMPERATURE'].includes(val);
}

export function isValidActuatorType(val: string): val is ActuatorType {
  return ['DOSING_PUMP', 'PROPORTIONAL_VALVE', 'MIXER_STIRRER', 'HEATING_JACKET'].includes(val);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}
