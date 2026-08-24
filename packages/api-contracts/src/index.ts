/**
 * @file packages/api-contracts/src/index.ts
 * @description API Request & Response Contracts for BatchSaver REST & WebSocket Endpoints
 */

import {
  Batch,
  BatchStatus,
  SensorReading,
  QualityMeasurement,
  QualityParameter,
  DeviationEvent,
  CorrectionRecommendation,
  OperatorDecision,
  OperatorDecisionType,
  ActuatorCommand,
  ActuatorResponse,
  AuditEvent,
  User,
  UserRole,
  HealthScore,
  ParameterThreshold,
} from '@batchsaver/shared-types';

// ==========================================
// Generic API Envelope
// ==========================================

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
  readonly timestamp: string;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNext: boolean;
}

// ==========================================
// 1. Batches API (/api/v1/batches)
// ==========================================

export interface CreateBatchDto {
  readonly batchNumber: string;
  readonly recipeId: string;
  readonly recipeName: string;
  readonly lineId: string;
  readonly vesselId: string;
  readonly targetVolumeKg: number;
  readonly operatorId: string;
  readonly notes?: string;
}

export interface UpdateBatchStatusDto {
  readonly status: BatchStatus;
  readonly notes?: string;
}

export interface BatchSummaryDto {
  readonly batch: Batch;
  readonly latestHealthScore: HealthScore;
  readonly activeDeviationsCount: number;
  readonly pendingRecommendationsCount: number;
}

// ==========================================
// 2. Sensors API (/api/v1/sensors)
// ==========================================

export interface IngestSensorReadingDto {
  readonly sensorId: string;
  readonly batchId: string;
  readonly parameter: QualityParameter;
  readonly rawValue: number;
  readonly filteredValue?: number;
  readonly unit: string;
  readonly timestamp?: string;
}

export interface SensorStatusDto {
  readonly sensorId: string;
  readonly parameter: QualityParameter;
  readonly lastReading?: SensorReading;
  readonly health: 'HEALTHY' | 'DEGRADED' | 'FAULT' | 'OFFLINE';
  readonly isSimulated: boolean;
}

// ==========================================
// 3. Quality API (/api/v1/quality)
// ==========================================

export interface QualityOverviewDto {
  readonly batchId: string;
  readonly currentHealthScore: HealthScore;
  readonly measurements: {
    readonly [K in QualityParameter]: QualityMeasurement;
  };
  readonly thresholds: {
    readonly [K in QualityParameter]: ParameterThreshold;
  };
}

// ==========================================
// 4. Deviations API (/api/v1/deviations)
// ==========================================

export interface DeviationFilterQuery {
  readonly batchId?: string;
  readonly parameter?: QualityParameter;
  readonly activeOnly?: boolean;
}

// ==========================================
// 5. Recommendations API (/api/v1/recommendations)
// ==========================================

export interface RecommendationSummaryDto {
  readonly recommendation: CorrectionRecommendation;
  readonly deviation: DeviationEvent;
  readonly canAutoExecute: boolean;
}

// ==========================================
// 6. Operators API (/api/v1/operators)
// ==========================================

export interface SubmitOperatorDecisionDto {
  readonly recommendationId: string;
  readonly batchId: string;
  readonly operatorId: string;
  readonly decision: OperatorDecisionType;
  readonly modifiedValue?: number;
  readonly modifiedDurationSeconds?: number;
  readonly comments?: string;
}

// ==========================================
// 7. Actuators API (/api/v1/actuators)
// ==========================================

export interface DispatchActuatorCommandDto {
  readonly actuatorId: string;
  readonly batchId: string;
  readonly recommendationId?: string;
  readonly operatorDecisionId?: string;
  readonly action: 'SET_FLOW' | 'SET_POSITION' | 'SET_SPEED' | 'SET_TEMP' | 'PULSE_DOSE';
  readonly targetValue: number;
  readonly unit: string;
  readonly durationSeconds?: number;
}

export interface ActuatorStatusDto {
  readonly actuatorId: string;
  readonly name: string;
  readonly type: string;
  readonly isConnected: boolean;
  readonly isSimulated: boolean;
  readonly currentPositionOrValue: number;
  readonly lastCommand?: ActuatorCommand;
  readonly lastResponse?: ActuatorResponse;
}

// ==========================================
// 8. Audit & Traceability API (/api/v1/audit)
// ==========================================

export interface AuditLogQuery {
  readonly batchId?: string;
  readonly userId?: string;
  readonly action?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface BatchTraceabilityReportDto {
  readonly batch: Batch;
  readonly readingsCount: number;
  readonly deviations: readonly DeviationEvent[];
  readonly recommendations: readonly CorrectionRecommendation[];
  readonly decisions: readonly OperatorDecision[];
  readonly actuatorExecutions: readonly ActuatorResponse[];
  readonly auditHistory: readonly AuditEvent[];
}

// ==========================================
// 9. Auth API (/api/v1/auth)
// ==========================================

export interface LoginRequestDto {
  readonly username: string;
  readonly password?: string;
}

export interface LoginResponseDto {
  readonly token: string;
  readonly user: User;
  readonly expiresAt: string;
}

// ==========================================
// 10. Real-Time WebSocket / SSE Events
// ==========================================

export type WsEventType =
  | 'SENSOR_DATA_POINT'
  | 'QUALITY_STATE_CHANGED'
  | 'HEALTH_SCORE_UPDATED'
  | 'DEVIATION_TRIGGERED'
  | 'RECOMMENDATION_ISSUED'
  | 'OPERATOR_DECISION_RECORDED'
  | 'ACTUATOR_STATE_UPDATED'
  | 'RECOVERY_PROGRESS';

export interface WsMessageEnvelope<T = unknown> {
  readonly event: WsEventType;
  readonly batchId: string;
  readonly timestamp: string;
  readonly payload: T;
}
