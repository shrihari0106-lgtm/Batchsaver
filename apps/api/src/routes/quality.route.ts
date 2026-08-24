/**
 * @file apps/api/src/routes/quality.route.ts
 * @description REST Route definitions for /api/v1/quality
 */

import { QualityOverviewDto, ApiResponse } from '@batchsaver/api-contracts';
import { HealthScore } from '@batchsaver/shared-types';

export interface IQualityController {
  getQualityOverview(batchId: string): Promise<ApiResponse<QualityOverviewDto>>;
  getBatchHealthScore(batchId: string): Promise<ApiResponse<HealthScore>>;
}
