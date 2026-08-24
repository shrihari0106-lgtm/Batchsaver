/**
 * @file modules/operator-control/src/index.ts
 * @description Module 4: Operator & Actuator Control
 * 
 * Implements Human-In-The-Loop (HITL) approval, rejection, modification,
 * safety interlocks, and actuator control interfaces (Dosing Pump, Valve, Mixer).
 */

import {
  CorrectionRecommendation,
  OperatorDecision,
  ActuatorCommand,
  ActuatorResponse,
  ActuatorType,
} from '@batchsaver/shared-types';

export interface IOperatorControlService {
  processDecision(decision: OperatorDecision): Promise<ActuatorCommand | null>;
  validateSafetyInterlocks(command: ActuatorCommand): Promise<boolean>;
}

export interface IActuatorProvider {
  readonly actuatorId: string;
  readonly actuatorType: ActuatorType;
  executeCommand(command: ActuatorCommand): Promise<ActuatorResponse>;
  getStatus(): Promise<{
    isConnected: boolean;
    isExecuting: boolean;
    currentValue: number;
  }>;
}

export class ActuatorRegistry {
  private readonly actuators = new Map<string, IActuatorProvider>();

  registerActuator(actuator: IActuatorProvider): void {
    this.actuators.set(actuator.actuatorId, actuator);
  }

  getActuator(actuatorId: string): IActuatorProvider | undefined {
    return this.actuators.get(actuatorId);
  }
}
