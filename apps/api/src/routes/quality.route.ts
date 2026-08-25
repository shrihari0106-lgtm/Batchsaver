/**
 * @file apps/api/src/routes/quality.route.ts
 * @description REST Route definitions for /api/v1/quality
 *
 * Endpoints:
 *   GET /api/v1/quality/current/:batchId
 *   GET /api/v1/quality/history/:batchId
 *   GET /api/v1/quality/health/:batchId
 *   GET /api/v1/quality/trends/:batchId
 *   GET /api/v1/quality/deviations/:batchId
 */

import { QualityOverviewDto, ApiResponse } from '@batchsaver/api-contracts';
import { HealthScore, ParameterQualityResult } from '@batchsaver/shared-types';
import { TrendAnalysisDetails } from '@batchsaver/module-quality-monitoring';

export interface IQualityController {
  getQualityOverview(batchId: string): Promise<ApiResponse<QualityOverviewDto>>;
  getBatchHealthScore(batchId: string): Promise<ApiResponse<HealthScore>>;
  getTrends?(batchId: string): Promise<ApiResponse<readonly TrendAnalysisDetails[]>>;
  getActiveDeviations?(batchId: string): Promise<ApiResponse<readonly ParameterQualityResult[]>>;
}
