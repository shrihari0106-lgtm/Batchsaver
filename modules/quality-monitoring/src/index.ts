/**
 * @file modules/quality-monitoring/src/index.ts
 * @description Module 2: Quality Monitoring Engine - Primary Public Exports
 *
 * Evaluates real-time sensor streams against acceptable target bands,
 * computes deviation percentages, tracks quality states with hysteresis,
 * performs trend analysis, and calculates Batch Health Score.
 */

import {
  SensorReading,
  QualityMeasurement,
  QualityState,
  HealthScore,
  QualityParameter,
} from '@batchsaver/shared-types';

/**
 * Core Quality Engine Interface (Scaffold Compatibility Interface)
 */
export interface IQualityEngine {
  processReading(reading: SensorReading): Promise<unknown>;
  calculateBatchHealth(batchId: string): Promise<HealthScore>;
  getLatestMeasurements(batchId: string): Promise<Map<QualityParameter, unknown>>;
  resetBatchState(batchId: string): Promise<void>;
}

/**
 * Trend Analysis Result Interface
 */
export interface TrendAnalysisResult {
  readonly parameter: QualityParameter;
  readonly slope: number;
  readonly isDriftingTowardsLimit: boolean;
  readonly estimatedTimeToDeviationMinutes?: number;
}

// Engine & Config
export * from './config/quality-engine.config';
export * from './engine/quality-engine';
export * from './engine/deviation-calculator';
export * from './engine/state-machine';
export * from './engine/trend-analyzer';
export * from './engine/health-calculator';

// Validation & Conversion
export * from './validation/sensor-validator';
export * from './conversion/unit-converter';

// Domain Events & Module 3 Contract
export * from './events/quality-events';
export * from './contracts/module3.contract';

// Repository
export * from './repository/quality-measurement.repository';
