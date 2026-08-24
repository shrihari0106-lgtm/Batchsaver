/**
 * @file modules/minimum-intervention/src/index.ts
 * @description Module 3: AI / Minimum-Intervention Engine
 * 
 * Analyzes deviations, identifies probable causes via explainable reason codes,
 * and formulates the minimum effective corrective action within safety limits.
 * 
 * Version 1 uses an explainable deterministic rule engine.
 * The architecture is pluggable to allow future ML/AI models.
 */

import {
  DeviationEvent,
  CorrectionRecommendation,
  ReasonCode,
  QualityMeasurement,
} from '@batchsaver/shared-types';

export interface IDeviationAnalyzer {
  analyzeDeviation(measurement: QualityMeasurement): Promise<DeviationEvent | null>;
}

export interface ICorrectionEngine {
  readonly engineType: 'DETERMINISTIC_RULES' | 'ML_AI_MODEL';
  generateRecommendation(deviation: DeviationEvent): Promise<CorrectionRecommendation | null>;
}

export interface ReasonCodeRule {
  readonly reasonCode: ReasonCode;
  readonly description: string;
  readonly primaryParameter: string;
  readonly conditionDescription: string;
  readonly defaultCorrectionRatio: number;
}
