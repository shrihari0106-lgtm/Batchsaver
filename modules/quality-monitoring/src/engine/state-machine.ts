/**
 * @file modules/quality-monitoring/src/engine/state-machine.ts
 * @description Deterministic state machine with hysteresis & persistence logic.
 *
 * States supported:
 *  - NOMINAL: Comfortable within acceptable bounds
 *  - WARNING: Approaching threshold boundary
 *  - DEVIATION: Exceeded acceptable tolerance (outside criticalTolerance)
 *  - CRITICAL: Severe deviation (exceeds criticalTolerance * 1.5)
 *  - RECOVERING: Parameter moving back toward target after a deviation/critical event
 *  - RECOVERED: Returned to NOMINAL and remained stable for recoveryStabilityCount readings
 *
 * Prevents flickering by requiring N consecutive readings (persistence count)
 * before transitioning to a worse or better state, and applying hysteresis bands.
 */

import { QualityState, ParameterThreshold, QualityEngineConfig } from '@batchsaver/shared-types';

export interface StateMachineState {
  readonly currentState: QualityState;
  readonly pendingState?: QualityState;
  readonly pendingStateCount: number;
  readonly recoveryCount: number;
  readonly lastDeviationTimestamp?: string;
}

export interface StateEvaluationResult {
  readonly nextState: QualityState;
  readonly stateChanged: boolean;
  readonly stateMachineState: StateMachineState;
  readonly rawState: QualityState;
}

/**
 * Classifies raw instantaneous state without persistence/hysteresis filter.
 */
export function classifyRawState(
  value: number,
  threshold: ParameterThreshold
): QualityState {
  const absDev = Math.abs(value - threshold.target);
  const warnTol = threshold.warningTolerance;
  const critTol = threshold.criticalTolerance;
  const severeTol = critTol * 1.5;

  if (absDev <= warnTol) {
    return 'NOMINAL';
  } else if (absDev <= critTol) {
    return 'WARNING';
  } else if (absDev <= severeTol) {
    return 'DEVIATION';
  } else {
    return 'CRITICAL';
  }
}

/**
 * Evaluates state transition applying hysteresis and persistence rules.
 */
export function evaluateStateTransition(
  value: number,
  threshold: ParameterThreshold,
  currentStateState: StateMachineState,
  config: QualityEngineConfig,
  timestamp: string
): StateEvaluationResult {
  const rawState = classifyRawState(value, threshold);
  const { currentState, pendingState, pendingStateCount, recoveryCount } = currentStateState;

  // Recovery tracking: if we were DEVIATION/CRITICAL/RECOVERING and rawState is now NOMINAL or WARNING
  const wasInDeviation =
    currentState === 'DEVIATION' ||
    currentState === 'CRITICAL' ||
    currentState === 'RECOVERING';

  let targetState: QualityState = rawState;

  if (wasInDeviation) {
    if (rawState === 'NOMINAL' || rawState === 'WARNING') {
      if (recoveryCount + 1 >= config.recoveryStabilityCount) {
        targetState = 'RECOVERED';
      } else {
        targetState = 'RECOVERING';
      }
    }
  } else if (currentState === 'RECOVERED') {
    if (rawState === 'NOMINAL') {
      targetState = 'NOMINAL'; // Smoothly transition back to NOMINAL after RECOVERED
    }
  }

  // Check persistence: must see targetState for persistenceCount times before committing
  let nextPendingState = pendingState;
  let nextPendingCount = pendingStateCount;
  let nextRecoveryCount = recoveryCount;

  if (rawState === 'NOMINAL' || rawState === 'WARNING') {
    if (wasInDeviation) {
      nextRecoveryCount += 1;
    }
  } else {
    nextRecoveryCount = 0; // Reset recovery if deviation recurs
  }

  let finalState = currentState;
  let stateChanged = false;

  if (targetState === currentState) {
    nextPendingState = undefined;
    nextPendingCount = 0;
  } else {
    if (pendingState === targetState) {
      nextPendingCount += 1;
    } else {
      nextPendingState = targetState;
      nextPendingCount = 1;
    }

    const requiredCount =
      targetState === 'RECOVERED'
        ? 1
        : config.stateChangePersistenceCount;

    if (nextPendingCount >= requiredCount) {
      finalState = targetState;
      stateChanged = true;
      nextPendingState = undefined;
      nextPendingCount = 0;
    }
  }

  const updatedMachineState: StateMachineState = {
    currentState: finalState,
    pendingState: nextPendingState,
    pendingStateCount: nextPendingCount,
    recoveryCount: nextRecoveryCount,
    lastDeviationTimestamp:
      finalState === 'DEVIATION' || finalState === 'CRITICAL'
        ? timestamp
        : currentStateState.lastDeviationTimestamp,
  };

  return {
    nextState: finalState,
    stateChanged,
    stateMachineState: updatedMachineState,
    rawState,
  };
}

/**
 * Creates initial state machine state for a parameter.
 */
export function createInitialStateMachineState(): StateMachineState {
  return {
    currentState: 'NOMINAL',
    pendingStateCount: 0,
    recoveryCount: 0,
  };
}
