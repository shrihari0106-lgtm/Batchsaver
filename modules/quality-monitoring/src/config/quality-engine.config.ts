/**
 * @file modules/quality-monitoring/src/config/quality-engine.config.ts
 * @description Centralized Quality Monitoring Engine configuration.
 *
 * All thresholds, stability windows, hysteresis bands and health weights
 * are defined here. Change values here without touching business logic.
 */

import { QualityEngineConfig } from '@batchsaver/shared-types';

/**
 * Default Quality Engine Configuration
 *
 * stateChangePersistenceCount: Requires 2 consecutive readings at same state
 *   before a state change is accepted — prevents single-reading flicker.
 *
 * recoveryStabilityCount: Requires 3 consecutive NOMINAL readings before
 *   transitioning to RECOVERED — confirms the process has truly stabilised.
 *
 * trendWindowSize: Uses last 5 readings to calculate slope.
 *
 * staleReadingMaxAgeMs: Readings older than 5 minutes are rejected.
 *
 * hysteresisBandFraction: 0.1 = 10% of criticalTolerance is the hysteresis
 *   band around each threshold boundary.
 *
 * healthWeights: Viscosity is most critical (35%) for wet masala;
 *   moisture second (30%), temperature (20%), colour (15%).
 */
export const DEFAULT_QUALITY_ENGINE_CONFIG: QualityEngineConfig = {
  stateChangePersistenceCount: 2,
  recoveryStabilityCount: 3,
  trendWindowSize: 5,
  staleReadingMaxAgeMs: 5 * 60 * 1000, // 5 minutes
  hysteresisBandFraction: 0.10,
  healthWeights: {
    VISCOSITY: 0.35,
    MOISTURE: 0.30,
    COLOUR_INDEX: 0.15,
    TEMPERATURE: 0.20,
  },
};

/**
 * Returns the active quality engine config.
 * Future: can be overridden per batch or recipe via DB config.
 */
export function getQualityEngineConfig(
  overrides?: Partial<QualityEngineConfig>
): QualityEngineConfig {
  if (!overrides) return DEFAULT_QUALITY_ENGINE_CONFIG;
  return { ...DEFAULT_QUALITY_ENGINE_CONFIG, ...overrides };
}

/**
 * Critical deviation multiplier thresholds.
 * Value > criticalTolerance * CRITICAL_FACTOR → CRITICAL state.
 */
export const CRITICAL_DEVIATION_FACTOR = 1.5;

/**
 * Warning band: value within (criticalTolerance * WARNING_FACTOR) of limit → WARNING.
 */
export const WARNING_BAND_FACTOR = 0.75;
