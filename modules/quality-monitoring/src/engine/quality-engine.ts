/**
 * @file modules/quality-monitoring/src/engine/quality-engine.ts
 * @description Main Quality Monitoring Engine implementation.
 *
 * Implements IQualityEngine.
 * Pipeline per reading:
 *   SensorReading → Validation → Unit Conversion → Deviation Calc →
 *   State Machine → Trend Analyzer → Health Calculator → Event Generation → Storage
 */

import {
  SensorReading,
  QualityMeasurement,
  QualityState,
  HealthScore,
  QualityParameter,
  ParameterQualityResult,
  BatchQualitySnapshot,
  QualityEngineConfig,
  QualityDomainEvent,
  SensorValidationResult,
} from '@batchsaver/shared-types';

import { getParameterThreshold } from '@batchsaver/config';
import { createLogger, ILogger } from '@batchsaver/shared-utils';

import { getQualityEngineConfig } from '../config/quality-engine.config';
import { validateSensorReading, isDuplicateReading, getReadingDeduplicationKey } from '../validation/sensor-validator';
import { convertToCanonicalUnit } from '../conversion/unit-converter';
import { calculateDeviationMetrics } from './deviation-calculator';
import {
  evaluateStateTransition,
  createInitialStateMachineState,
  StateMachineState,
} from './state-machine';
import { analyzeTrend, TrendAnalysisDetails } from './trend-analyzer';
import {
  calculateBatchHealthScore,
  DetailedHealthScore,
  calculateParameterHealthScore,
} from './health-calculator';
import {
  createWarningEvent,
  createDeviationEvent,
  createCriticalEvent,
  createRecoveryStartedEvent,
  createRecoveredEvent,
  createBatchHealthChangedEvent,
} from '../events/quality-events';
import {
  IQualityMeasurementRepository,
  InMemoryQualityMeasurementRepository,
} from '../repository/quality-measurement.repository';
import { IQualityEventConsumer } from '../contracts/module3.contract';

export interface QualityEngineProcessingResult {
  readonly valid: boolean;
  readonly validationResult: SensorValidationResult;
  readonly measurement?: ParameterQualityResult;
  readonly legacyMeasurement?: QualityMeasurement;
  readonly latestBatchHealth?: DetailedHealthScore;
  readonly generatedEvents: readonly QualityDomainEvent[];
}

export class QualityEngine {
  private readonly logger: ILogger;
  private readonly config: QualityEngineConfig;
  private readonly repository: IQualityMeasurementRepository;

  // Per-batch, per-parameter state machine state: batchId -> param -> StateMachineState
  private readonly stateMachines = new Map<string, Map<QualityParameter, StateMachineState>>();

  // Per-batch, per-parameter recent value history: batchId -> param -> Array<number>
  private readonly valueHistories = new Map<string, Map<QualityParameter, number[]>>();

  // Per-batch latest health score: batchId -> number
  private readonly latestHealthScores = new Map<string, number>();

  // Deduplication cache: set of reading keys seen recently
  private readonly deduplicationKeys = new Set<string>();

  // Registered domain event consumers (listeners)
  private readonly eventConsumers = new Set<(event: QualityDomainEvent) => void>();

  constructor(
    config?: Partial<QualityEngineConfig>,
    repository?: IQualityMeasurementRepository,
    logger?: ILogger
  ) {
    this.config = getQualityEngineConfig(config);
    this.repository = repository ?? new InMemoryQualityMeasurementRepository();
    this.logger = logger ?? createLogger('QualityEngine');
  }

  /**
   * Register an event listener or Module 3 consumer.
   */
  subscribeToEvents(consumer: ((event: QualityDomainEvent) => void) | IQualityEventConsumer): void {
    if (typeof consumer === 'function') {
      this.eventConsumers.add(consumer);
    } else {
      this.eventConsumers.add((evt) => consumer.onQualityEvent(evt));
    }
  }

  /**
   * Process an incoming sensor reading through the entire monitoring pipeline.
   */
  async processReading(reading: SensorReading): Promise<QualityEngineProcessingResult> {
    const generatedEvents: QualityDomainEvent[] = [];

    // 1. Deduplication check
    if (isDuplicateReading(reading, this.deduplicationKeys)) {
      this.logger.warn(`Duplicate reading ignored for sensor ${reading.sensorId} at ${reading.timestamp}`);
      return {
        valid: false,
        validationResult: { valid: false, reason: 'Duplicate reading', dataQuality: 'INVALID' },
        generatedEvents: [],
      };
    }
    this.deduplicationKeys.add(getReadingDeduplicationKey(reading));
    // Bound dedup cache size
    if (this.deduplicationKeys.size > 5000) {
      const first = this.deduplicationKeys.values().next().value;
      if (first) this.deduplicationKeys.delete(first);
    }

    // 2. Validation
    const validationResult = validateSensorReading(reading, this.config);
    if (!validationResult.valid) {
      this.logger.warn(`Invalid sensor reading for batch ${reading.batchId}: ${validationResult.reason}`, {
        sensorId: reading.sensorId,
        parameter: reading.parameter,
      });
      return { valid: false, validationResult, generatedEvents: [] };
    }

    // 3. Unit Conversion
    const converted = convertToCanonicalUnit(reading.parameter, reading.filteredValue, reading.unit);
    const value = converted.value;

    // 4. Threshold Lookup & Deviation Calculation
    const threshold = getParameterThreshold(reading.parameter);
    const deviationMetrics = calculateDeviationMetrics(value, threshold);

    // 5. Update Value History for Trend Analysis
    let batchHist = this.valueHistories.get(reading.batchId);
    if (!batchHist) {
      batchHist = new Map<QualityParameter, number[]>();
      this.valueHistories.set(reading.batchId, batchHist);
    }
    let paramHist = batchHist.get(reading.parameter);
    if (!paramHist) {
      paramHist = [];
      batchHist.set(reading.parameter, paramHist);
    }
    paramHist.push(value);
    if (paramHist.length > this.config.trendWindowSize * 2) {
      paramHist.shift();
    }

    // 6. Trend Analysis
    const trendResult = analyzeTrend(
      reading.parameter,
      paramHist,
      threshold,
      this.config.trendWindowSize
    );

    // 7. State Machine Evaluation (with Hysteresis & Persistence)
    let batchMachines = this.stateMachines.get(reading.batchId);
    if (!batchMachines) {
      batchMachines = new Map<QualityParameter, StateMachineState>();
      this.stateMachines.set(reading.batchId, batchMachines);
    }
    let paramMachine = batchMachines.get(reading.parameter);
    if (!paramMachine) {
      paramMachine = createInitialStateMachineState();
    }

    const previousState = paramMachine.currentState;
    const stateEval = evaluateStateTransition(
      value,
      threshold,
      paramMachine,
      this.config,
      reading.timestamp
    );

    batchMachines.set(reading.parameter, stateEval.stateMachineState);
    const currentState = stateEval.nextState;

    // 8. Parameter Health Score
    const parameterHealth = calculateParameterHealthScore(value, threshold);

    // 9. Assemble ParameterQualityResult
    const measurementId = `qm-${reading.batchId}-${reading.parameter}-${Date.now()}`;
    const measurement: ParameterQualityResult = {
      id: measurementId,
      batchId: reading.batchId,
      timestamp: reading.timestamp,
      parameter: reading.parameter,
      value,
      unit: converted.canonicalUnit,
      target: threshold.target,
      lowerLimit: deviationMetrics.lowerLimit,
      upperLimit: deviationMetrics.upperLimit,
      absoluteDeviation: deviationMetrics.absoluteDeviation,
      signedDeviation: deviationMetrics.signedDeviation,
      percentageDeviation: deviationMetrics.percentageDeviation,
      direction: deviationMetrics.direction,
      status: currentState,
      parameterHealth,
      trend: trendResult.trend,
      dataQuality: validationResult.dataQuality,
    };

    // 10. Persist Measurement
    await this.repository.save(measurement);

    // 11. Domain Events Generation on State Transition
    if (stateEval.stateChanged) {
      this.logger.info(
        `State transition for batch ${reading.batchId} [${reading.parameter}]: ${previousState} → ${currentState}`,
        { value, target: threshold.target }
      );

      if (currentState === 'WARNING') {
        generatedEvents.push(createWarningEvent(measurement));
      } else if (currentState === 'DEVIATION') {
        generatedEvents.push(createDeviationEvent(measurement));
      } else if (currentState === 'CRITICAL') {
        generatedEvents.push(createCriticalEvent(measurement));
      } else if (currentState === 'RECOVERING') {
        generatedEvents.push(createRecoveryStartedEvent(measurement, previousState));
      } else if (currentState === 'RECOVERED') {
        generatedEvents.push(createRecoveredEvent(measurement));
      }
    }

    // 12. Calculate Composite Batch Health Score
    const latestSnapshot = await this.getLatestMeasurements(reading.batchId);
    const paramInputs: Parameters<typeof calculateBatchHealthScore>[1] = {};

    for (const [param, m] of latestSnapshot.entries()) {
      paramInputs[param] = {
        value: m.value,
        threshold: getParameterThreshold(param),
        pctDev: m.percentageDeviation,
        status: m.status,
      };
    }

    const healthScore = calculateBatchHealthScore(
      reading.batchId,
      paramInputs,
      this.config,
      reading.timestamp
    );

    // Check if overall batch health score changed significantly
    const previousHealth = this.latestHealthScores.get(reading.batchId) ?? 100;
    if (Math.abs(healthScore.score - previousHealth) >= 2) {
      generatedEvents.push(
        createBatchHealthChangedEvent(
          reading.batchId,
          previousHealth,
          healthScore.score,
          healthScore.status,
          reading.timestamp
        )
      );
    }
    this.latestHealthScores.set(reading.batchId, healthScore.score);

    // 13. Emit all generated domain events
    for (const evt of generatedEvents) {
      for (const consumer of this.eventConsumers) {
        try {
          consumer(evt);
        } catch (err) {
          this.logger.error(`Error in event listener for event ${evt.eventType}`, err);
        }
      }
    }

    // Legacy QualityMeasurement format for backwards compatibility with scaffold interface
    const legacyMeasurement: QualityMeasurement = {
      id: measurement.id,
      batchId: measurement.batchId,
      timestamp: measurement.timestamp,
      parameter: measurement.parameter,
      value: measurement.value,
      unit: measurement.unit,
      targetValue: measurement.target,
      acceptableMin: measurement.lowerLimit,
      acceptableMax: measurement.upperLimit,
      deviationAmount: measurement.signedDeviation,
      deviationPercentage: measurement.percentageDeviation,
      state: measurement.status,
      rawReadingId: reading.id,
    };

    return {
      valid: true,
      validationResult,
      measurement,
      legacyMeasurement,
      latestBatchHealth: healthScore,
      generatedEvents,
    };
  }

  /**
   * Returns current health score for a batch.
   */
  async calculateBatchHealth(batchId: string): Promise<HealthScore> {
    const latestMap = await this.getLatestMeasurements(batchId);
    const timestamp = new Date().toISOString();

    const paramInputs: Parameters<typeof calculateBatchHealthScore>[1] = {};
    for (const [param, m] of latestMap.entries()) {
      paramInputs[param] = {
        value: m.value,
        threshold: getParameterThreshold(param),
        pctDev: m.percentageDeviation,
        status: m.status,
      };
    }

    return calculateBatchHealthScore(batchId, paramInputs, this.config, timestamp);
  }

  /**
   * Returns latest quality measurement per parameter for a batch.
   */
  async getLatestMeasurements(batchId: string): Promise<Map<QualityParameter, ParameterQualityResult>> {
    return this.repository.getLatestForBatch(batchId);
  }

  /**
   * Returns complete BatchQualitySnapshot for Dashboard / Module 5.
   */
  async getBatchQualitySnapshot(batchId: string): Promise<BatchQualitySnapshot> {
    const latestMap = await this.getLatestMeasurements(batchId);
    const health = await this.calculateBatchHealth(batchId);

    const parametersObj: Record<string, ParameterQualityResult> = {};
    const activeDeviations: QualityParameter[] = [];
    const recovering: QualityParameter[] = [];

    for (const [param, m] of latestMap.entries()) {
      parametersObj[param] = m;
      if (m.status === 'DEVIATION' || m.status === 'CRITICAL' || m.status === 'WARNING') {
        activeDeviations.push(param);
      }
      if (m.status === 'RECOVERING') {
        recovering.push(param);
      }
    }

    return {
      batchId,
      timestamp: new Date().toISOString(),
      overallHealth: health.score,
      overallStatus: health.status,
      parameters: parametersObj,
      activeDeviations,
      recovering,
    };
  }

  /**
   * Returns current trend analysis for all parameters in a batch.
   */
  async getTrends(batchId: string): Promise<readonly TrendAnalysisDetails[]> {
    const batchHist = this.valueHistories.get(batchId);
    const params: QualityParameter[] = ['VISCOSITY', 'MOISTURE', 'COLOUR_INDEX', 'TEMPERATURE'];
    const results: TrendAnalysisDetails[] = [];

    for (const param of params) {
      const history = batchHist?.get(param) ?? [];
      const threshold = getParameterThreshold(param);
      results.push(analyzeTrend(param, history, threshold, this.config.trendWindowSize));
    }

    return results;
  }

  /**
   * Resets all in-memory tracking state for a batch.
   */
  async resetBatchState(batchId: string): Promise<void> {
    this.stateMachines.delete(batchId);
    this.valueHistories.delete(batchId);
    this.latestHealthScores.delete(batchId);
    await this.repository.clearBatch(batchId);
    this.logger.info(`Reset quality state for batch ${batchId}`);
  }
}
