/**
 * @file modules/quality-monitoring/src/conversion/unit-converter.ts
 * @description Conversion layer for alternative sensor measurement units.
 *
 * Keeps unit conversion isolated from quality rule evaluation.
 * All quality comparisons occur using configured canonical units:
 *   - Viscosity: cP
 *   - Moisture: %
 *   - Colour Index: CI
 *   - Temperature: °C
 */

import { QualityParameter } from '@batchsaver/shared-types';

export interface ConvertedReading {
  readonly value: number;
  readonly canonicalUnit: string;
}

/**
 * Converts a sensor reading value to canonical unit.
 */
export function convertToCanonicalUnit(
  parameter: QualityParameter,
  value: number,
  unit: string
): ConvertedReading {
  const normUnit = (unit || '').trim();

  switch (parameter) {
    case 'TEMPERATURE':
      if (normUnit === '°F' || normUnit === 'F' || normUnit === 'degF') {
        return { value: Number((((value - 32) * 5) / 9).toFixed(2)), canonicalUnit: '°C' };
      }
      if (normUnit === 'K') {
        return { value: Number((value - 273.15).toFixed(2)), canonicalUnit: '°C' };
      }
      return { value, canonicalUnit: '°C' };

    case 'VISCOSITY':
      // 1 cP = 1 mPa·s
      return { value, canonicalUnit: 'cP' };

    case 'MOISTURE':
      return { value, canonicalUnit: '%' };

    case 'COLOUR_INDEX':
      return { value, canonicalUnit: 'CI' };

    default:
      return { value, canonicalUnit: unit };
  }
}
