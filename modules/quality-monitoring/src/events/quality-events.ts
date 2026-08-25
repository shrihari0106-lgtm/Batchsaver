/**
 * @file modules/quality-monitoring/src/events/quality-events.ts
 * @description Domain event factory for Module 2 quality state changes.
 *
 * Emits decoupled domain events for Module 3 (Minimum Intervention Engine)
 * and Module 5 (Dashboard) consumption without tight coupling.
 */

import {
  QualityDomainEvent,
  QualityWarningDetectedEvent,
  QualityDeviationDetectedEvent,
  QualityCriticalDetectedEvent,
  QualityRecoveryStartedEvent,
  QualityRecoveredEvent,
  BatchHealthChangedEvent,
  ParameterQualityResult,
  DeviationSeverity,
  QualityState,
} from '@batchsaver/shared-types';

let eventCounter = 0;

function generateEventId(prefix: string): string {
  eventCounter += 1;
  return `evt-${prefix}-${Date.now()}-${eventCounter}`;
}

export function mapStatusToSeverity(status: QualityState): DeviationSeverity {
  switch (status) {
    case 'WARNING': return 'LOW';
    case 'DEVIATION': return 'MEDIUM';
    case 'CRITICAL': return 'CRITICAL';
    case 'RECOVERING': return 'MEDIUM';
    default: return 'LOW';
  }
}

export function createWarningEvent(
  result: ParameterQualityResult
): QualityWarningDetectedEvent {
  return {
    eventType: 'QualityWarningDetected',
    eventId: generateEventId('warn'),
    batchId: result.batchId,
    timestamp: result.timestamp,
    parameter: result.parameter,
    currentValue: result.value,
    targetValue: result.target,
    percentageDeviation: result.percentageDeviation,
    direction: result.direction,
    parameterHealth: result.parameterHealth,
  };
}

export function createDeviationEvent(
  result: ParameterQualityResult
): QualityDeviationDetectedEvent {
  return {
    eventType: 'QualityDeviationDetected',
    eventId: generateEventId('dev'),
    batchId: result.batchId,
    timestamp: result.timestamp,
    parameter: result.parameter,
    currentValue: result.value,
    targetValue: result.target,
    lowerLimit: result.lowerLimit,
    upperLimit: result.upperLimit,
    absoluteDeviation: result.absoluteDeviation,
    percentageDeviation: result.percentageDeviation,
    direction: result.direction,
    severity: mapStatusToSeverity(result.status),
    parameterHealth: result.parameterHealth,
  };
}

export function createCriticalEvent(
  result: ParameterQualityResult
): QualityCriticalDetectedEvent {
  return {
    eventType: 'QualityCriticalDetected',
    eventId: generateEventId('crit'),
    batchId: result.batchId,
    timestamp: result.timestamp,
    parameter: result.parameter,
    currentValue: result.value,
    targetValue: result.target,
    lowerLimit: result.lowerLimit,
    upperLimit: result.upperLimit,
    absoluteDeviation: result.absoluteDeviation,
    percentageDeviation: result.percentageDeviation,
    direction: result.direction,
    severity: 'CRITICAL',
    parameterHealth: result.parameterHealth,
  };
}

export function createRecoveryStartedEvent(
  result: ParameterQualityResult,
  previousStatus: QualityState
): QualityRecoveryStartedEvent {
  return {
    eventType: 'QualityRecoveryStarted',
    eventId: generateEventId('rec-start'),
    batchId: result.batchId,
    timestamp: result.timestamp,
    parameter: result.parameter,
    currentValue: result.value,
    targetValue: result.target,
    percentageDeviation: result.percentageDeviation,
    direction: result.direction,
    previousStatus,
  };
}

export function createRecoveredEvent(
  result: ParameterQualityResult
): QualityRecoveredEvent {
  return {
    eventType: 'QualityRecovered',
    eventId: generateEventId('rec-done'),
    batchId: result.batchId,
    timestamp: result.timestamp,
    parameter: result.parameter,
    currentValue: result.value,
    targetValue: result.target,
    parameterHealth: result.parameterHealth,
  };
}

export function createBatchHealthChangedEvent(
  batchId: string,
  previousScore: number,
  currentScore: number,
  overallStatus: QualityState,
  timestamp: string
): BatchHealthChangedEvent {
  return {
    eventType: 'BatchHealthChanged',
    eventId: generateEventId('health'),
    batchId,
    timestamp,
    previousScore,
    currentScore,
    overallStatus,
  };
}
