/**
 * @file packages/shared-types/src/index.ts
 * @description Shared Domain Contracts & Types for BatchSaver
 * @version 0.1.0
 */

// ==========================================
// 1. Process & Quality Parameters
// ==========================================

export type QualityParameter = 'VISCOSITY' | 'MOISTURE' | 'COLOUR_INDEX' | 'TEMPERATURE';

export interface ParameterThreshold {
  readonly parameter: QualityParameter;
  readonly target: number;
  readonly unit: string;
  readonly warningTolerance: number;
  readonly criticalTolerance: number;
  readonly minValue: number;
  readonly maxValue: number;
}

export type QualityState = 
  | 'NOMINAL'
  | 'WARNING'
  | 'DEVIATION'
  | 'CRITICAL'
  | 'RECOVERING'
  | 'RECOVERED';

export type QualityStatus = QualityState;

export interface QualityMeasurement {
  readonly id: string;
  readonly batchId: string;
  readonly timestamp: string;
  readonly parameter: QualityParameter;
  readonly value: number;
  readonly unit: string;
  readonly targetValue: number;
  readonly acceptableMin: number;
  readonly acceptableMax: number;
  readonly deviationAmount: number;
  readonly deviationPercentage: number;
  readonly state: QualityState;
  readonly rawReadingId?: string;
}

export interface HealthScore {
  readonly score: number; // 0 to 100
  readonly status: QualityState;
  readonly timestamp: string;
  readonly batchId: string;
  readonly parameterContributions: {
    readonly [K in QualityParameter]: {
      readonly score: number;
      readonly weight: number;
      readonly currentDeviationPct: number;
    };
  };
}

// ==========================================
// 2. Batch Management
// ==========================================

export type BatchStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'HOLD'
  | 'COMPLETED'
  | 'ABORTED';

export interface Batch {
  readonly id: string;
  readonly batchNumber: string;
  readonly recipeId: string;
  readonly recipeName: string;
  readonly lineId: string;
  readonly vesselId: string;
  readonly status: BatchStatus;
  readonly currentHealthScore: number;
  readonly currentQualityState: QualityState;
  readonly startTime: string;
  readonly endTime?: string;
  readonly targetVolumeKg: number;
  readonly actualVolumeKg?: number;
  readonly operatorId: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ==========================================
// 3. Sensor & Data Acquisition
// ==========================================

export type SensorProtocol = 'SIMULATED' | 'MQTT' | 'OPC_UA' | 'MODBUS_TCP' | 'PLC_DAQ';

export type SensorHealth = 'HEALTHY' | 'DEGRADED' | 'FAULT' | 'OFFLINE';

export interface SensorMetadata {
  readonly sensorId: string;
  readonly parameter: QualityParameter;
  readonly lineId: string;
  readonly vesselId: string;
  readonly protocol: SensorProtocol;
  readonly samplingRateHz: number;
  readonly unit: string;
  readonly calibrationDate?: string;
}

export interface SensorReading {
  readonly id: string;
  readonly sensorId: string;
  readonly batchId: string;
  readonly parameter: QualityParameter;
  readonly rawValue: number;
  readonly filteredValue: number;
  readonly unit: string;
  readonly timestamp: string;
  readonly quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  readonly simulated: boolean;
  readonly noiseApplied?: number;
  readonly driftApplied?: number;
}

// ==========================================
// 4. Deviations, Causes & AI Recommendations
// ==========================================

export type DeviationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DeviationDirection = 'ABOVE_TARGET' | 'BELOW_TARGET';

export type ReasonCode =
  | 'MOISTURE_EXCESS_WATER_INLET'
  | 'MOISTURE_DEFICIT_HIGH_HEAT'
  | 'VISCOSITY_HIGH_INSUFFICIENT_WATER'
  | 'VISCOSITY_LOW_OVER_DILUTION'
  | 'TEMPERATURE_OVERHEATING_JACKET'
  | 'TEMPERATURE_UNDERHEATING_JACKET'
  | 'COLOUR_UNDER_ROASTING'
  | 'COLOUR_OVER_ROASTING'
  | 'MIXER_SHEAR_RATE_ANOMALY'
  | 'UNKNOWN_PROCESS_DRIFT';

export interface DeviationEvent {
  readonly id: string;
  readonly batchId: string;
  readonly timestamp: string;
  readonly parameter: QualityParameter;
  readonly observedValue: number;
  readonly targetValue: number;
  readonly deviationPercentage: number;
  readonly direction: DeviationDirection;
  readonly severity: DeviationSeverity;
  readonly state: QualityState;
  readonly probableReasonCode: ReasonCode;
  readonly active: boolean;
  readonly resolvedAt?: string;
}

export interface CorrectionRecommendation {
  readonly id: string;
  readonly batchId: string;
  readonly deviationEventId: string;
  readonly timestamp: string;
  readonly reasonCode: ReasonCode;
  readonly explanation: string;
  readonly actionType: ActuatorType;
  readonly targetActuatorId: string;
  readonly recommendedValue: number; // e.g. amount in ml, rpm, or valve %
  readonly unit: string;
  readonly durationSeconds?: number;
  readonly confidenceScore: number; // 0.0 to 1.0
  readonly isMinimumIntervention: boolean;
  readonly safetyLimits: {
    readonly minAllowed: number;
    readonly maxAllowed: number;
    readonly maxRateOfChange: number;
  };
  readonly expectedOutcome: {
    readonly targetParameter: QualityParameter;
    readonly expectedDelta: number;
    readonly expectedStabilizationTimeSeconds: number;
  };
}

// ==========================================
// 5. Operator & Actuator Control
// ==========================================

export type OperatorDecisionType = 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'ESCALATED';

export interface OperatorDecision {
  readonly id: string;
  readonly recommendationId: string;
  readonly batchId: string;
  readonly operatorId: string;
  readonly operatorName: string;
  readonly decision: OperatorDecisionType;
  readonly modifiedValue?: number;
  readonly modifiedDurationSeconds?: number;
  readonly comments?: string;
  readonly timestamp: string;
}

export type ActuatorType = 'DOSING_PUMP' | 'PROPORTIONAL_VALVE' | 'MIXER_STIRRER' | 'HEATING_JACKET';

export type ActuatorCommandStatus = 'PENDING' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';

export interface ActuatorCommand {
  readonly id: string;
  readonly batchId: string;
  readonly recommendationId?: string;
  readonly operatorDecisionId?: string;
  readonly actuatorId: string;
  readonly actuatorType: ActuatorType;
  readonly action: 'SET_FLOW' | 'SET_POSITION' | 'SET_SPEED' | 'SET_TEMP' | 'PULSE_DOSE';
  readonly targetValue: number;
  readonly unit: string;
  readonly durationSeconds?: number;
  readonly timestamp: string;
  readonly status: ActuatorCommandStatus;
}

export interface ActuatorResponse {
  readonly id: string;
  readonly commandId: string;
  readonly actuatorId: string;
  readonly status: ActuatorCommandStatus;
  readonly actualValueExecuted: number;
  readonly executionDurationSeconds: number;
  readonly timestamp: string;
  readonly errorMessage?: string;
}

// ==========================================
// 6. Recovery & Traceability
// ==========================================

export interface RecoveryEvent {
  readonly id: string;
  readonly batchId: string;
  readonly deviationEventId: string;
  readonly actuatorCommandId?: string;
  readonly startTime: string;
  readonly recoveryCompletedTime?: string;
  readonly initialDeviationPct: number;
  readonly finalDeviationPct: number;
  readonly parameter: QualityParameter;
  readonly status: 'IN_PROGRESS' | 'SUCCESSFUL' | 'PARTIAL' | 'FAILED';
  readonly recoveryDurationSeconds?: number;
}

export type AuditActionType =
  | 'BATCH_START'
  | 'BATCH_STOP'
  | 'RECIPE_CHANGE'
  | 'DEVIATION_DETECTED'
  | 'RECOMMENDATION_GENERATED'
  | 'OPERATOR_APPROVAL'
  | 'OPERATOR_OVERRIDE'
  | 'ACTUATOR_DISPATCH'
  | 'PARAMETER_THRESHOLD_UPDATE'
  | 'USER_LOGIN'
  | 'SECURITY_ALERT';

export interface AuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly userId?: string;
  readonly userRole?: UserRole;
  readonly action: AuditActionType;
  readonly entityType: string;
  readonly entityId: string;
  readonly batchId?: string;
  readonly previousState?: Record<string, unknown>;
  readonly newState?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly details: string;
}

// ==========================================
// 7. Users & Security (RBAC)
// ==========================================

export type UserRole = 
  | 'OPERATOR'
  | 'SUPERVISOR'
  | 'QUALITY_MANAGER'
  | 'ADMINISTRATOR';

export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly active: boolean;
  readonly lastLoginAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthSession {
  readonly token: string;
  readonly user: Omit<User, 'passwordHash'>;
  readonly expiresAt: string;
}

// ==========================================
// 8. Module 2 — Quality Monitoring Types
// ==========================================

/** Direction of deviation relative to target (simple form for Module 2 use) */
export type DeviationDirectionSimple = 'HIGH' | 'LOW' | 'WITHIN_TARGET';

/** Trend of a parameter over recent readings */
export type TrendDirection =
  | 'STABLE'
  | 'RISING'
  | 'FALLING'
  | 'DRIFTING_HIGH'
  | 'DRIFTING_LOW';

/** Full result of a single parameter quality evaluation */
export interface ParameterQualityResult {
  readonly id: string;
  readonly batchId: string;
  readonly timestamp: string;
  readonly parameter: QualityParameter;
  readonly value: number;
  readonly unit: string;
  readonly target: number;
  readonly lowerLimit: number;
  readonly upperLimit: number;
  readonly absoluteDeviation: number;
  readonly signedDeviation: number;
  readonly percentageDeviation: number;
  readonly direction: DeviationDirectionSimple;
  readonly status: QualityState;
  readonly parameterHealth: number; // 0–100
  readonly trend: TrendDirection;
  readonly dataQuality: 'GOOD' | 'UNCERTAIN' | 'BAD' | 'INVALID';
}

/** Snapshot of all parameters for a batch — Dashboard / Module 5 contract */
export interface BatchQualitySnapshot {
  readonly batchId: string;
  readonly timestamp: string;
  readonly overallHealth: number; // 0–100
  readonly overallStatus: QualityState;
  readonly parameters: {
    readonly [K in QualityParameter]?: ParameterQualityResult;
  };
  readonly activeDeviations: readonly QualityParameter[];
  readonly recovering: readonly QualityParameter[];
}

/** Configurable Quality Engine settings */
export interface QualityEngineConfig {
  /** Number of consecutive readings required before state upgrade (prevents flicker) */
  readonly stateChangePersistenceCount: number;
  /** Number of consecutive NOMINAL readings required before RECOVERED */
  readonly recoveryStabilityCount: number;
  /** Number of recent readings used for trend calculation */
  readonly trendWindowSize: number;
  /** Max age of a reading in ms before considered stale */
  readonly staleReadingMaxAgeMs: number;
  /** Hysteresis band as fraction of criticalTolerance (0–1) */
  readonly hysteresisBandFraction: number;
  /** Per-parameter weights for batch health score (must sum to 1.0) */
  readonly healthWeights: {
    readonly VISCOSITY: number;
    readonly MOISTURE: number;
    readonly COLOUR_INDEX: number;
    readonly TEMPERATURE: number;
  };
}

/** Result of validating an incoming sensor reading */
export interface SensorValidationResult {
  readonly valid: boolean;
  readonly reason?: string;
  readonly dataQuality: 'GOOD' | 'UNCERTAIN' | 'BAD' | 'INVALID';
}

// ==========================================
// 9. Module 2 — Domain Events
// ==========================================

export type QualityEventType =
  | 'QualityWarningDetected'
  | 'QualityDeviationDetected'
  | 'QualityCriticalDetected'
  | 'QualityRecoveryStarted'
  | 'QualityRecovered'
  | 'BatchHealthChanged';

export interface QualityDomainEventBase {
  readonly eventType: QualityEventType;
  readonly eventId: string;
  readonly batchId: string;
  readonly timestamp: string;
}

export interface QualityWarningDetectedEvent extends QualityDomainEventBase {
  readonly eventType: 'QualityWarningDetected';
  readonly parameter: QualityParameter;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly percentageDeviation: number;
  readonly direction: DeviationDirectionSimple;
  readonly parameterHealth: number;
}

export interface QualityDeviationDetectedEvent extends QualityDomainEventBase {
  readonly eventType: 'QualityDeviationDetected';
  readonly parameter: QualityParameter;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly lowerLimit: number;
  readonly upperLimit: number;
  readonly absoluteDeviation: number;
  readonly percentageDeviation: number;
  readonly direction: DeviationDirectionSimple;
  readonly severity: DeviationSeverity;
  readonly parameterHealth: number;
}

export interface QualityCriticalDetectedEvent extends QualityDomainEventBase {
  readonly eventType: 'QualityCriticalDetected';
  readonly parameter: QualityParameter;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly lowerLimit: number;
  readonly upperLimit: number;
  readonly absoluteDeviation: number;
  readonly percentageDeviation: number;
  readonly direction: DeviationDirectionSimple;
  readonly severity: DeviationSeverity;
  readonly parameterHealth: number;
}

export interface QualityRecoveryStartedEvent extends QualityDomainEventBase {
  readonly eventType: 'QualityRecoveryStarted';
  readonly parameter: QualityParameter;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly percentageDeviation: number;
  readonly direction: DeviationDirectionSimple;
  readonly previousStatus: QualityState;
}

export interface QualityRecoveredEvent extends QualityDomainEventBase {
  readonly eventType: 'QualityRecovered';
  readonly parameter: QualityParameter;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly parameterHealth: number;
}

export interface BatchHealthChangedEvent extends QualityDomainEventBase {
  readonly eventType: 'BatchHealthChanged';
  readonly previousScore: number;
  readonly currentScore: number;
  readonly overallStatus: QualityState;
}

export type QualityDomainEvent =
  | QualityWarningDetectedEvent
  | QualityDeviationDetectedEvent
  | QualityCriticalDetectedEvent
  | QualityRecoveryStartedEvent
  | QualityRecoveredEvent
  | BatchHealthChangedEvent;
