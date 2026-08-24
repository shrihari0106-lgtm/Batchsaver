/**
 * @file apps/api/src/routes/sensors.route.ts
 * @description REST Route definitions for /api/v1/sensors
 */

import { IngestSensorReadingDto, SensorStatusDto, ApiResponse } from '@batchsaver/api-contracts';
import { SensorReading } from '@batchsaver/shared-types';

export interface ISensorsController {
  ingestReading(dto: IngestSensorReadingDto): Promise<ApiResponse<SensorReading>>;
  getSensorStatuses(lineId?: string): Promise<ApiResponse<readonly SensorStatusDto[]>>;
  getSensorStream(batchId: string, sensorId: string): Promise<ApiResponse<readonly SensorReading[]>>;
}
