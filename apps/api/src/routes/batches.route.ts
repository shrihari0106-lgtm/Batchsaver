/**
 * @file apps/api/src/routes/batches.route.ts
 * @description REST Route definitions for /api/v1/batches
 */

import { CreateBatchDto, UpdateBatchStatusDto, ApiResponse, BatchSummaryDto } from '@batchsaver/api-contracts';

export interface IBatchesController {
  createBatch(dto: CreateBatchDto): Promise<ApiResponse<BatchSummaryDto>>;
  getBatchById(batchId: string): Promise<ApiResponse<BatchSummaryDto>>;
  updateBatchStatus(batchId: string, dto: UpdateBatchStatusDto): Promise<ApiResponse<BatchSummaryDto>>;
  listBatches(status?: string): Promise<ApiResponse<readonly BatchSummaryDto[]>>;
}
