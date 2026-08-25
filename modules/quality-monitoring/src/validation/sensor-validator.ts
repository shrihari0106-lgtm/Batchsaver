/**
 * @file modules/quality-monitoring/src/validation/sensor-validator.ts
 * @description Validates incoming SensorReadings before quality processing.
 *
 * Invalid readings must never silently corrupt the Batch Health Score.
 * All rejections produce a clear, machine-readable reason.
 */

import { SensorReading, SensorValidationResult, QualityParameter } from '@batchsaver/shared-types';
import { getParameterThreshold } from '@batchsaver/config';
import { QualityEngineConfig } from '@batchsaver/shared-types';

/** Absolute physical limits — sanity guard regardless of config */
const ABSOLUTE_LIMITS: Record<QualityParameter, { min: number; max: number }> = {
  VISCOSITY:    { min: 0,    max: 10000 }, // cP
  MOISTURE:     { min: 0,    max: 100   }, // %
  COLOUR_INDEX: { min: 0,    max: 100   }, // CI
  TEMPERATURE:  { min: -50,  max: 250   }, // °C
};

/** Supported units per parameter — any other unit is rejected */
const SUPPORTED_UNITS: Record<QualityParameter, readonly string[]> = {
  VISCOSITY:    ['cP', 'mPa.s', 'mPas'],
  MOISTURE:     ['%'],
  COLOUR_INDEX: ['CI', 'ci', ''],
  TEMPERATURE:  ['°C', 'C', 'degC', '°F', 'F', 'degF', 'K'],
};

/**
 * Validates a SensorReading before it enters the quality engine.
 *
 * Checks performed (in order):
 *  1. Null / undefined value guard
 *  2. NaN / Infinity guard
 *  3. Absolute physical impossibility
 *  4. Configured instrument range
 *  5. Stale reading (older than staleReadingMaxAgeMs)
 *  6. Sensor-reported quality flag
 *  7. Unit plausibility
 */
export function validateSensorReading(
  reading: SensorReading,
  config: QualityEngineConfig
): SensorValidationResult {

  // 1. Null / undefined
  if (reading.filteredValue === null || reading.filteredValue === undefined) {
    return { valid: false, reason: 'filteredValue is null or undefined', dataQuality: 'INVALID' };
  }

  // 2. NaN / Infinity
  if (!isFinite(reading.filteredValue) || isNaN(reading.filteredValue)) {
    return { valid: false, reason: `filteredValue is not a finite number: ${reading.filteredValue}`, dataQuality: 'INVALID' };
  }

  // 3. Absolute physical limits
  const absoluteLimits = ABSOLUTE_LIMITS[reading.parameter];
  if (!absoluteLimits) {
    return { valid: false, reason: `Unknown quality parameter: ${reading.parameter}`, dataQuality: 'INVALID' };
  }
  if (reading.filteredValue < absoluteLimits.min || reading.filteredValue > absoluteLimits.max) {
    return {
      valid: false,
      reason: `Value ${reading.filteredValue} is outside absolute physical limits [${absoluteLimits.min}, ${absoluteLimits.max}] for ${reading.parameter}`,
      dataQuality: 'INVALID',
    };
  }

  // 4. Configured instrument range
  const threshold = getParameterThreshold(reading.parameter);
  if (reading.filteredValue < threshold.minValue || reading.filteredValue > threshold.maxValue) {
    return {
      valid: false,
      reason: `Value ${reading.filteredValue} is outside configured instrument range [${threshold.minValue}, ${threshold.maxValue}] for ${reading.parameter}`,
      dataQuality: 'BAD',
    };
  }

  // 5. Stale reading
  const readingTime = new Date(reading.timestamp).getTime();
  const now = Date.now();
  if (isNaN(readingTime)) {
    return { valid: false, reason: `Invalid timestamp: ${reading.timestamp}`, dataQuality: 'INVALID' };
  }
  const ageMs = now - readingTime;
  if (ageMs > config.staleReadingMaxAgeMs) {
    return {
      valid: false,
      reason: `Reading is stale: age ${Math.round(ageMs / 1000)}s exceeds max ${config.staleReadingMaxAgeMs / 1000}s`,
      dataQuality: 'BAD',
    };
  }

  // 6. Sensor-reported quality flag
  if (reading.quality === 'BAD') {
    return {
      valid: false,
      reason: `Sensor reports BAD data quality for sensor ${reading.sensorId}`,
      dataQuality: 'BAD',
    };
  }

  // 7. Unit plausibility
  const supportedUnits = SUPPORTED_UNITS[reading.parameter];
  if (supportedUnits && supportedUnits.length > 0 && !supportedUnits.includes(reading.unit)) {
    return {
      valid: false,
      reason: `Unit '${reading.unit}' is not supported for ${reading.parameter}. Expected one of: ${supportedUnits.join(', ')}`,
      dataQuality: 'UNCERTAIN',
    };
  }

  // UNCERTAIN: sensor reports uncertain but value is in range
  if (reading.quality === 'UNCERTAIN') {
    return { valid: true, dataQuality: 'UNCERTAIN' };
  }

  return { valid: true, dataQuality: 'GOOD' };
}

/**
 * Detects if a reading is a duplicate based on sensorId + timestamp.
 * Compares against a set of recently-seen reading keys.
 */
export function isDuplicateReading(
  reading: SensorReading,
  recentKeys: Set<string>
): boolean {
  const key = `${reading.sensorId}::${reading.timestamp}`;
  return recentKeys.has(key);
}

/**
 * Produces the deduplication key for a sensor reading.
 */
export function getReadingDeduplicationKey(reading: SensorReading): string {
  return `${reading.sensorId}::${reading.timestamp}`;
}
