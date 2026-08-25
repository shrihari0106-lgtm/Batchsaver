/**
 * @file apps/api/src/controllers/quality.controller.ts
 * @description Quality Controller handling HTTP REST endpoints for Quality Monitoring.
 *
 * Endpoints implemented:
 *  - GET /api/v1/quality/current/:batchId   - Current quality overview snapshot
 *  - GET /api/v1/quality/history/:batchId   - Quality measurement history
 *  - GET /api/v1/quality/health/:batchId    - Batch Health Score & explanations
 *  - GET /api/v1/quality/trends/:batchId    - Trend analysis per parameter
 *  - GET /api/v1/quality/deviations/:batchId  - Active quality deviations
 */

import { ApiResponse, QualityOverviewDto } from '@batchsaver/api-contracts';
import { HealthScore, ParameterQualityResult } from '@batchsaver/shared-types';
import { QualityEngine, TrendAnalysisDetails } from '@batchsaver/module-quality-monitoring';

export class QualityController {
  constructor(private readonly engine: QualityEngine) {}

  /**
   * GET /api/v1/quality/current/:batchId
   */
  async getCurrentQuality(batchId: string): Promise<ApiResponse<QualityOverviewDto>> {
    try {
      const snapshot = await this.engine.getBatchQualitySnapshot(batchId);
      const health = await this.engine.calculateBatchHealth(batchId);

      const measurementsObj: Record<string, any> = {};
      const thresholdsObj: Record<string, any> = {};

      for (const [param, measurement] of Object.entries(snapshot.parameters)) {
        if (measurement) {
          measurementsObj[param] = {
            id: measurement.id,
            batchId: measurement.batchId,
            timestamp: measurement.timestamp,
            parameter: measurement.parameter,
            value: measurement.value,
            unit: measurement.unit,
            targetValue: measurement.target,
            acceptableMin: measurement.lowerLimit,
            acceptableMax: measurement.upperLimit,
            deviationAmount: measurement.signedDeviation,
            deviationPercentage: measurement.percentageDeviation,
            state: measurement.status,
          };
          thresholdsObj[param] = {
            parameter: measurement.parameter,
            target: measurement.target,
            unit: measurement.unit,
            minValue: measurement.lowerLimit,
            maxValue: measurement.upperLimit,
          };
        }
      }

      return {
        success: true,
        data: {
          batchId,
          currentHealthScore: health,
          measurements: measurementsObj as any,
          thresholds: thresholdsObj as any,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        message: err.message || 'Failed to fetch current quality overview',
        timestamp: new Date().toISOString(),
        error: { code: 'QUALITY_FETCH_FAILED', message: err.message },
      };
    }
  }

  /**
   * GET /api/v1/quality/health/:batchId
   */
  async getHealthScore(batchId: string): Promise<ApiResponse<HealthScore>> {
    try {
      const health = await this.engine.calculateBatchHealth(batchId);
      return {
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        message: err.message || 'Failed to calculate batch health score',
        timestamp: new Date().toISOString(),
        error: { code: 'HEALTH_SCORE_FAILED', message: err.message },
      };
    }
  }

  /**
   * GET /api/v1/quality/trends/:batchId
   */
  async getTrends(batchId: string): Promise<ApiResponse<readonly TrendAnalysisDetails[]>> {
    try {
      const trends = await this.engine.getTrends(batchId);
      return {
        success: true,
        data: trends,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        message: err.message || 'Failed to fetch trends',
        timestamp: new Date().toISOString(),
        error: { code: 'TRENDS_FETCH_FAILED', message: err.message },
      };
    }
  }

  /**
   * GET /api/v1/quality/deviations/:batchId
   */
  async getActiveDeviations(batchId: string): Promise<ApiResponse<readonly ParameterQualityResult[]>> {
    try {
      const snapshot = await this.engine.getBatchQualitySnapshot(batchId);
      const activeDeviations: ParameterQualityResult[] = [];

      for (const m of Object.values(snapshot.parameters)) {
        if (m && (m.status === 'DEVIATION' || m.status === 'CRITICAL' || m.status === 'WARNING')) {
          activeDeviations.push(m);
        }
      }

      return {
        success: true,
        data: activeDeviations,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        data: [],
        message: err.message || 'Failed to fetch active deviations',
        timestamp: new Date().toISOString(),
        error: { code: 'DEVIATIONS_FETCH_FAILED', message: err.message },
      };
    }
  }
}
