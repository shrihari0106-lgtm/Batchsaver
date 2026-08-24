/**
 * @file packages/config/src/process-parameters.ts
 * @description Centralized Core Process Parameters for Wet Masala Manufacturing
 */

import { QualityParameter, ParameterThreshold } from '@batchsaver/shared-types';

export interface ProcessParameterConfig {
  readonly viscosity: ParameterThreshold;
  readonly moisture: ParameterThreshold;
  readonly colourIndex: ParameterThreshold;
  readonly temperature: ParameterThreshold;
}

/**
 * Default Wet Masala Process Parameters
 * Viscosity: 3200 cP ± 150 cP
 * Moisture: 38% ± 1.5%
 * Colour Index: 62 ± 3
 * Temperature: 92°C ± 2°C
 */
export const DEFAULT_PROCESS_PARAMETERS: ProcessParameterConfig = {
  viscosity: {
    parameter: 'VISCOSITY',
    target: 3200,
    unit: 'cP',
    warningTolerance: 100,
    criticalTolerance: 150,
    minValue: 2500,
    maxValue: 4000,
  },
  moisture: {
    parameter: 'MOISTURE',
    target: 38.0,
    unit: '%',
    warningTolerance: 1.0,
    criticalTolerance: 1.5,
    minValue: 30.0,
    maxValue: 45.0,
  },
  colourIndex: {
    parameter: 'COLOUR_INDEX',
    target: 62.0,
    unit: 'CI',
    warningTolerance: 2.0,
    criticalTolerance: 3.0,
    minValue: 50.0,
    maxValue: 75.0,
  },
  temperature: {
    parameter: 'TEMPERATURE',
    target: 92.0,
    unit: '°C',
    warningTolerance: 1.5,
    criticalTolerance: 2.0,
    minValue: 70.0,
    maxValue: 110.0,
  },
};

/**
 * Returns active process parameters with optional environment overrides
 */
export function getProcessParameters(): ProcessParameterConfig {
  return {
    viscosity: {
      ...DEFAULT_PROCESS_PARAMETERS.viscosity,
      target: Number(process.env.PARAM_VISCOSITY_TARGET ?? DEFAULT_PROCESS_PARAMETERS.viscosity.target),
      criticalTolerance: Number(process.env.PARAM_VISCOSITY_TOLERANCE ?? DEFAULT_PROCESS_PARAMETERS.viscosity.criticalTolerance),
    },
    moisture: {
      ...DEFAULT_PROCESS_PARAMETERS.moisture,
      target: Number(process.env.PARAM_MOISTURE_TARGET ?? DEFAULT_PROCESS_PARAMETERS.moisture.target),
      criticalTolerance: Number(process.env.PARAM_MOISTURE_TOLERANCE ?? DEFAULT_PROCESS_PARAMETERS.moisture.criticalTolerance),
    },
    colourIndex: {
      ...DEFAULT_PROCESS_PARAMETERS.colourIndex,
      target: Number(process.env.PARAM_COLOUR_TARGET ?? DEFAULT_PROCESS_PARAMETERS.colourIndex.target),
      criticalTolerance: Number(process.env.PARAM_COLOUR_TOLERANCE ?? DEFAULT_PROCESS_PARAMETERS.colourIndex.criticalTolerance),
    },
    temperature: {
      ...DEFAULT_PROCESS_PARAMETERS.temperature,
      target: Number(process.env.PARAM_TEMPERATURE_TARGET ?? DEFAULT_PROCESS_PARAMETERS.temperature.target),
      criticalTolerance: Number(process.env.PARAM_TEMPERATURE_TOLERANCE ?? DEFAULT_PROCESS_PARAMETERS.temperature.criticalTolerance),
    },
  };
}

export function getParameterThreshold(param: QualityParameter): ParameterThreshold {
  const params = getProcessParameters();
  switch (param) {
    case 'VISCOSITY':
      return params.viscosity;
    case 'MOISTURE':
      return params.moisture;
    case 'COLOUR_INDEX':
      return params.colourIndex;
    case 'TEMPERATURE':
      return params.temperature;
    default:
      throw new Error(`Unknown quality parameter: ${param}`);
  }
}
