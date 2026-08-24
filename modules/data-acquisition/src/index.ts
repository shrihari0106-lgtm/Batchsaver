/**
 * @file modules/data-acquisition/src/index.ts
 * @description Module 1: Data Acquisition & Simulation
 * 
 * Provides sensor abstraction, telemetry simulation (noise, drift, failure injection),
 * and adapter contracts for future PLC/DAQ, OPC-UA, Modbus, and MQTT drivers.
 */

import {
  SensorReading,
  QualityParameter,
  SensorMetadata,
  SensorProtocol,
} from '@batchsaver/shared-types';

/**
 * Sensor Provider Adapter Interface
 * Implemented by Simulated, OPC-UA, Modbus, and MQTT sensor adapters
 */
export interface ISensorProvider {
  readonly protocol: SensorProtocol;
  initialize(): Promise<void>;
  startSampling(callback: (reading: SensorReading) => void): Promise<void>;
  stopSampling(): Promise<void>;
  getMetadata(sensorId: string): Promise<SensorMetadata>;
  isConnected(): boolean;
}

/**
 * Sensor Simulator Configuration
 */
export interface SimulationConfig {
  readonly batchId: string;
  readonly samplingIntervalMs: number;
  readonly noiseEnabled: boolean;
  readonly driftEnabled: boolean;
  readonly failureSimulation?: {
    readonly sensorId: string;
    readonly failureType: 'STUCK_VALUE' | 'SPIKE' | 'DROPOUT' | 'DRIFT';
    readonly durationSeconds: number;
  };
}

/**
 * Placeholder Scaffolding / Provider Registry
 */
export class DataAcquisitionService {
  private readonly providers = new Map<string, ISensorProvider>();

  registerProvider(sensorId: string, provider: ISensorProvider): void {
    this.providers.set(sensorId, provider);
  }

  getProvider(sensorId: string): ISensorProvider | undefined {
    return this.providers.get(sensorId);
  }
}
