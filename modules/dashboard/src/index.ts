/**
 * @file modules/dashboard/src/index.ts
 * @description Module 5: Dashboard & Visualization Contracts
 * 
 * Provides view-model structures, live metric pipelines, telemetry chart contracts,
 * vessel visualizer states, and timeline schemas for the industrial frontend.
 */

import {
  HealthScore,
  QualityMeasurement,
  DeviationEvent,
  CorrectionRecommendation,
  ActuatorResponse,
  QualityParameter,
} from '@batchsaver/shared-types';

export interface DashboardViewModel {
  readonly batchId: string;
  readonly batchNumber: string;
  readonly recipeName: string;
  readonly healthScore: HealthScore;
  readonly activeMeasurements: {
    readonly [K in QualityParameter]: QualityMeasurement;
  };
  readonly activeDeviations: readonly DeviationEvent[];
  readonly pendingRecommendations: readonly CorrectionRecommendation[];
  readonly vesselState: {
    readonly fillLevelPercentage: number;
    readonly stirrerRpm: number;
    readonly jacketTemperature: number;
    readonly dosingValveOpen: boolean;
  };
}

export interface ChartDataSeries {
  readonly parameter: QualityParameter;
  readonly targetBand: {
    readonly target: number;
    readonly upperLimit: number;
    readonly lowerLimit: number;
  };
  readonly dataPoints: readonly {
    readonly timestamp: string;
    readonly value: number;
    readonly state: string;
  }[];
  readonly markers: readonly {
    readonly timestamp: string;
    readonly type: 'DEVIATION' | 'CORRECTION_APPLIED' | 'RECOVERY';
    readonly label: string;
  }[];
}
