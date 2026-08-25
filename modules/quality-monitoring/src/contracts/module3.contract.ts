/**
 * @file modules/quality-monitoring/src/contracts/module3.contract.ts
 * @description Module 3 Integration Contract.
 *
 * Defines the public contract exposed to Module 3 (Minimum Intervention Engine).
 * Module 3 listens to these events to determine corrective actions without
 * depending on Module 2 internal classes or implementation logic.
 */

import {
  QualityDomainEvent,
  QualityDeviationDetectedEvent,
  QualityCriticalDetectedEvent,
  QualityParameter,
  DeviationSeverity,
  DeviationDirectionSimple,
  QualityState,
} from '@batchsaver/shared-types';

/**
 * Interface implemented by Module 3 (or an event handler bridge)
 * to receive quality events emitted by Module 2.
 */
export interface IQualityEventConsumer {
  onQualityEvent(event: QualityDomainEvent): Promise<void>;
}

/**
 * Dedicated deviation payload passed to Module 3 when corrective action may be needed.
 */
export interface Module3DeviationPayload {
  readonly batchId: string;
  readonly parameter: QualityParameter;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly lowerLimit: number;
  readonly upperLimit: number;
  readonly absoluteDeviation: number;
  readonly percentageDeviation: number;
  readonly direction: DeviationDirectionSimple;
  readonly severity: DeviationSeverity;
  readonly currentState: QualityState;
  readonly timestamp: string;
  readonly eventId: string;
}

/**
 * Helper converter that extracts a clean Module3DeviationPayload from domain events.
 */
export function toModule3DeviationPayload(
  event: QualityDeviationDetectedEvent | QualityCriticalDetectedEvent
): Module3DeviationPayload {
  return {
    batchId: event.batchId,
    parameter: event.parameter,
    currentValue: event.currentValue,
    targetValue: event.targetValue,
    lowerLimit: event.lowerLimit,
    upperLimit: event.upperLimit,
    absoluteDeviation: event.absoluteDeviation,
    percentageDeviation: event.percentageDeviation,
    direction: event.direction,
    severity: event.severity,
    currentState: event.eventType === 'QualityCriticalDetected' ? 'CRITICAL' : 'DEVIATION',
    timestamp: event.timestamp,
    eventId: event.eventId,
  };
}
