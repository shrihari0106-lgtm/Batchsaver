/**
 * @file apps/api/src/routes/actuators.route.ts
 * @description REST Route definitions for /api/v1/actuators
 */

import { DispatchActuatorCommandDto, ActuatorStatusDto, ApiResponse } from '@batchsaver/api-contracts';
import { ActuatorResponse } from '@batchsaver/shared-types';

export interface IActuatorsController {
  listActuators(): Promise<ApiResponse<readonly ActuatorStatusDto[]>>;
  dispatchCommand(dto: DispatchActuatorCommandDto): Promise<ApiResponse<ActuatorResponse>>;
}
