/**
 * @file apps/api/src/routes/operators.route.ts
 * @description REST Route definitions for /api/v1/operators
 */

import { SubmitOperatorDecisionDto, ApiResponse } from '@batchsaver/api-contracts';
import { OperatorDecision } from '@batchsaver/shared-types';

export interface IOperatorsController {
  submitDecision(dto: SubmitOperatorDecisionDto): Promise<ApiResponse<OperatorDecision>>;
  listDecisionsForBatch(batchId: string): Promise<ApiResponse<readonly OperatorDecision[]>>;
}
