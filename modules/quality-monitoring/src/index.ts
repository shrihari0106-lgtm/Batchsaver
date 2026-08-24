/**
 * @file modules/quality-monitoring/src/index.ts
 * @description Module 2: Quality Monitoring Engine
 * 
 * Evaluates real-time sensor streams against acceptable target bands,
 * computes deviation percentages, tracks quality states, and calculates Batch Health Score.
 */

import {
  SensorReading,
  QualityMeasurement,
  QualityState,
  HealthScore,
  QualityParameter,
} from '@batchsaver/shared-types';

export interface IQualityEngine {
  processReading(reading: SensorReading): Promise<QualityMeasurement>;
  calculateBatchHealth(batchId: string): Promise<HealthScore>;
  getLatestMeasurements(batchId: string): Promise<Map<QualityParameter, QualityMeasurement>>;
  resetBatchState(batchId: string): Promise<void>;
}

export interface TrendAnalysisResult {
  readonly parameter: QualityParameter;
  readonly slope: number;
  readonly isDriftingTowardsLimit: boolean;
  readonly estimatedTimeToDeviationMinutes?: number;
}
