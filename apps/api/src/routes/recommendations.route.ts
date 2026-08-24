/**
 * @file apps/api/src/routes/recommendations.route.ts
 * @description REST Route definitions for /api/v1/recommendations
 */

import { RecommendationSummaryDto, ApiResponse } from '@batchsaver/api-contracts';
import { CorrectionRecommendation } from '@batchsaver/shared-types';

export interface IRecommendationsController {
  getPendingRecommendations(batchId: string): Promise<ApiResponse<readonly RecommendationSummaryDto[]>>;
  getRecommendationById(recommendationId: string): Promise<ApiResponse<CorrectionRecommendation>>;
}
