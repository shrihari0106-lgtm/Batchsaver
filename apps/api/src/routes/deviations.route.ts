/**
 * @file apps/api/src/routes/deviations.route.ts
 * @description REST Route definitions for /api/v1/deviations
 */

import { DeviationFilterQuery, ApiResponse } from '@batchsaver/api-contracts';
import { DeviationEvent } from '@batchsaver/shared-types';

export interface IDeviationsController {
  listDeviations(query: DeviationFilterQuery): Promise<ApiResponse<readonly DeviationEvent[]>>;
  getDeviationById(deviationId: string): Promise<ApiResponse<DeviationEvent>>;
}
