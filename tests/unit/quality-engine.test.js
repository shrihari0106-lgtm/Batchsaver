const test = require('node:test');
const assert = require('node:assert');

// Test targets imported directly from build output or modules
const {
  QualityEngine,
  calculateDeviationMetrics,
  classifyRawState,
  evaluateStateTransition,
  createInitialStateMachineState,
  analyzeTrend,
  calculateParameterHealthScore,
  calculateBatchHealthScore,
  validateSensorReading,
  convertToCanonicalUnit,
  getQualityEngineConfig,
} = require('../../modules/quality-monitoring/src');

const { getParameterThreshold } = require('../../packages/config/src');

let readingSeq = 0;
function makeReading(param, value, opts = {}) {
  readingSeq += 1;
  const ts = opts.timestamp || new Date(Date.now() + readingSeq * 100).toISOString();
  return {
    id: `r-${Date.now()}-${readingSeq}-${Math.random()}`,
    sensorId: opts.sensorId || `sns-${param}`,
    batchId: opts.batchId || 'batch-test-01',
    parameter: param,
    rawValue: value,
    filteredValue: value,
    unit: opts.unit || (param === 'VISCOSITY' ? 'cP' : param === 'MOISTURE' ? '%' : param === 'COLOUR_INDEX' ? 'CI' : '°C'),
    timestamp: ts,
    quality: opts.quality || 'GOOD',
    simulated: true,
  };
}

// ============================================================================
// 1. BOUNDARY & PARAMETER TESTS (Viscosity, Moisture, Colour, Temperature)
// ============================================================================

test('Viscosity Boundary & State Tests', () => {
  const threshold = getParameterThreshold('VISCOSITY');
  assert.strictEqual(threshold.target, 3200);

  // NOMINAL: 3200
  assert.strictEqual(classifyRawState(3200, threshold), 'NOMINAL');

  // Boundary checks: 3050 and 3350
  assert.strictEqual(classifyRawState(3050, threshold), 'WARNING'); // 3200 - 150 = 3050 (at criticalTolerance boundary)
  assert.strictEqual(classifyRawState(3350, threshold), 'WARNING');

  // Below 3050 & Above 3350 → DEVIATION / CRITICAL
  assert.strictEqual(classifyRawState(3000, threshold), 'DEVIATION'); // 200 cP dev > 150
  assert.strictEqual(classifyRawState(3400, threshold), 'DEVIATION'); // 200 cP dev > 150

  // Severe deviation (> 1.5x criticalTolerance = 225 cP)
  assert.strictEqual(classifyRawState(2900, threshold), 'CRITICAL'); // 300 cP dev
  assert.strictEqual(classifyRawState(3500, threshold), 'CRITICAL'); // 300 cP dev
});

test('Moisture Boundary & State Tests', () => {
  const threshold = getParameterThreshold('MOISTURE');
  assert.strictEqual(threshold.target, 38.0);

  assert.strictEqual(classifyRawState(38.0, threshold), 'NOMINAL');
  assert.strictEqual(classifyRawState(36.5, threshold), 'WARNING'); // 38 - 1.5
  assert.strictEqual(classifyRawState(39.5, threshold), 'WARNING'); // 38 + 1.5

  assert.strictEqual(classifyRawState(35.0, threshold), 'CRITICAL'); // 3.0 dev > 2.25
  assert.strictEqual(classifyRawState(41.0, threshold), 'CRITICAL');
});

test('Colour Index Boundary & State Tests', () => {
  const threshold = getParameterThreshold('COLOUR_INDEX');
  assert.strictEqual(threshold.target, 62.0);

  assert.strictEqual(classifyRawState(62.0, threshold), 'NOMINAL');
  assert.strictEqual(classifyRawState(59.0, threshold), 'WARNING'); // 62 - 3
  assert.strictEqual(classifyRawState(65.0, threshold), 'WARNING'); // 62 + 3

  assert.strictEqual(classifyRawState(58.0, threshold), 'DEVIATION'); // 4 dev (between 3 and 4.5)
  assert.strictEqual(classifyRawState(56.0, threshold), 'CRITICAL');  // 6 dev > 4.5
});

test('Temperature Boundary & State Tests', () => {
  const threshold = getParameterThreshold('TEMPERATURE');
  assert.strictEqual(threshold.target, 92.0);

  assert.strictEqual(classifyRawState(92.0, threshold), 'NOMINAL');
  assert.strictEqual(classifyRawState(90.0, threshold), 'WARNING'); // 92 - 2
  assert.strictEqual(classifyRawState(94.0, threshold), 'WARNING'); // 92 + 2

  assert.strictEqual(classifyRawState(88.0, threshold), 'CRITICAL'); // 4 dev > 3
  assert.strictEqual(classifyRawState(96.0, threshold), 'CRITICAL');
});

// ============================================================================
// 2. DEVIATION METRICS CALCULATION
// ============================================================================

test('Deviation Calculator Metrics', () => {
  const threshold = getParameterThreshold('VISCOSITY');
  const metrics = calculateDeviationMetrics(3400, threshold);

  assert.strictEqual(metrics.target, 3200);
  assert.strictEqual(metrics.signedDeviation, 200);
  assert.strictEqual(metrics.absoluteDeviation, 200);
  assert.strictEqual(metrics.percentageDeviation, 6.25); // (3400-3200)/3200 * 100
  assert.strictEqual(metrics.direction, 'HIGH');

  const metricsLow = calculateDeviationMetrics(2900, threshold);
  assert.strictEqual(metricsLow.signedDeviation, -300);
  assert.strictEqual(metricsLow.direction, 'LOW');
});

// ============================================================================
// 3. STATE MACHINE, HYSTERESIS & RECOVERY
// ============================================================================

test('State Machine Hysteresis & Persistence', () => {
  const threshold = getParameterThreshold('VISCOSITY');
  const config = getQualityEngineConfig({ stateChangePersistenceCount: 2, recoveryStabilityCount: 3 });
  let state = createInitialStateMachineState();
  const ts = new Date().toISOString();

  // First reading at 3400 (DEVIATION) — pending count = 1, currentState remains NOMINAL
  let eval1 = evaluateStateTransition(3400, threshold, state, config, ts);
  assert.strictEqual(eval1.nextState, 'NOMINAL');
  assert.strictEqual(eval1.stateMachineState.pendingState, 'DEVIATION');
  assert.strictEqual(eval1.stateMachineState.pendingStateCount, 1);

  // Second reading at 3400 (DEVIATION) — pending count reaches 2 → currentState becomes DEVIATION
  let eval2 = evaluateStateTransition(3400, threshold, eval1.stateMachineState, config, ts);
  assert.strictEqual(eval2.nextState, 'DEVIATION');
  assert.strictEqual(eval2.stateChanged, true);

  // Recovery: return to 3200 (NOMINAL)
  // Reading 1 back at 3200 → state becomes RECOVERING
  let evalRec1 = evaluateStateTransition(3200, threshold, eval2.stateMachineState, config, ts);

  // Continue to 3 readings at 3200 → reaches RECOVERED
  let st = evalRec1.stateMachineState;
  for (let i = 0; i < 3; i++) {
    const res = evaluateStateTransition(3200, threshold, st, config, ts);
    st = res.stateMachineState;
  }
  assert.strictEqual(st.currentState, 'RECOVERED');
});

// ============================================================================
// 4. TREND ANALYSIS
// ============================================================================

test('Trend Analysis - RISING & DRIFTING_HIGH', () => {
  const threshold = getParameterThreshold('VISCOSITY');
  const values = [3200, 3230, 3260, 3290, 3320];

  const trend = analyzeTrend('VISCOSITY', values, threshold, 5);
  assert.ok(trend.slope > 0);
  assert.strictEqual(trend.trend, 'DRIFTING_HIGH');
  assert.strictEqual(trend.isDriftingTowardsLimit, true);
});

test('Trend Analysis - STABLE', () => {
  const threshold = getParameterThreshold('VISCOSITY');
  const values = [3200, 3202, 3199, 3201, 3200];

  const trend = analyzeTrend('VISCOSITY', values, threshold, 5);
  assert.strictEqual(trend.trend, 'STABLE');
});

// ============================================================================
// 5. HEALTH SCORE CALCULATION
// ============================================================================

test('Parameter Health Score & Batch Health Score', () => {
  const threshold = getParameterThreshold('VISCOSITY');

  // Exact target -> 100
  assert.strictEqual(calculateParameterHealthScore(3200, threshold), 100);

  // Moderate deviation -> 60-85
  const modScore = calculateParameterHealthScore(3300, threshold);
  assert.ok(modScore >= 60 && modScore <= 85);

  // Composite Batch Health Score
  const config = getQualityEngineConfig();
  const batchScore = calculateBatchHealthScore(
    'batch-test-01',
    {
      VISCOSITY: { value: 3200, threshold, pctDev: 0, status: 'NOMINAL' },
      MOISTURE: { value: 38.0, threshold: getParameterThreshold('MOISTURE'), pctDev: 0, status: 'NOMINAL' },
      COLOUR_INDEX: { value: 62.0, threshold: getParameterThreshold('COLOUR_INDEX'), pctDev: 0, status: 'NOMINAL' },
      TEMPERATURE: { value: 92.0, threshold: getParameterThreshold('TEMPERATURE'), pctDev: 0, status: 'NOMINAL' },
    },
    config,
    new Date().toISOString()
  );

  assert.strictEqual(batchScore.score, 100);
  assert.strictEqual(batchScore.status, 'NOMINAL');
  assert.strictEqual(batchScore.explanations.length, 4);
});

// ============================================================================
// 6. INVALID SENSOR DATA HANDLING
// ============================================================================

test('Sensor Reading Validation Layer', () => {
  const config = getQualityEngineConfig();

  // Null check
  const nullReading = makeReading('VISCOSITY', null);
  const v1 = validateSensorReading(nullReading, config);
  assert.strictEqual(v1.valid, false);

  // NaN check
  const nanReading = makeReading('VISCOSITY', NaN);
  const v2 = validateSensorReading(nanReading, config);
  assert.strictEqual(v2.valid, false);

  // Out of absolute physical limits
  const physReading = makeReading('VISCOSITY', 50000); // 50,000 cP impossible
  const v3 = validateSensorReading(physReading, config);
  assert.strictEqual(v3.valid, false);

  // Stale reading (> 5 mins old)
  const staleReading = makeReading('VISCOSITY', 3200, {
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  });
  const v4 = validateSensorReading(staleReading, config);
  assert.strictEqual(v4.valid, false);

  // Valid reading
  const validReading = makeReading('VISCOSITY', 3200);
  const v5 = validateSensorReading(validReading, config);
  assert.strictEqual(v5.valid, true);
});

// ============================================================================
// 7. UNIT CONVERSION LAYER
// ============================================================================

test('Unit Converter Layer', () => {
  // °F to °C
  const convF = convertToCanonicalUnit('TEMPERATURE', 197.6, '°F');
  assert.strictEqual(convF.value, 92);
  assert.strictEqual(convF.canonicalUnit, '°C');

  // Kelvin to °C
  const convK = convertToCanonicalUnit('TEMPERATURE', 365.15, 'K');
  assert.strictEqual(convK.value, 92);
  assert.strictEqual(convK.canonicalUnit, '°C');

  // cP unchanged
  const convCp = convertToCanonicalUnit('VISCOSITY', 3200, 'cP');
  assert.strictEqual(convCp.value, 3200);
  assert.strictEqual(convCp.canonicalUnit, 'cP');
});

// ============================================================================
// 8. FULL QUALITY ENGINE INTEGRATION TEST (End-to-End Reading Processing)
// ============================================================================

test('Quality Engine Processing Pipeline & Domain Events', async () => {
  const engine = new QualityEngine({ stateChangePersistenceCount: 1 }); // persistence 1 for immediate events
  const events = [];

  engine.subscribeToEvents((evt) => {
    events.push(evt);
  });

  // Processing nominal reading
  const r1 = makeReading('VISCOSITY', 3200);
  const res1 = await engine.processReading(r1);

  assert.strictEqual(res1.valid, true);
  assert.strictEqual(res1.measurement.status, 'NOMINAL');
  assert.strictEqual(res1.measurement.value, 3200);

  // Processing DEVIATION reading
  const r2 = makeReading('VISCOSITY', 3380); // 180 cP dev > 150 (within 225 limit)
  const res2 = await engine.processReading(r2);

  assert.strictEqual(res2.measurement.status, 'DEVIATION');
  assert.ok(events.some((e) => e.eventType === 'QualityDeviationDetected'));

  const devEvent = events.find((e) => e.eventType === 'QualityDeviationDetected');
  assert.strictEqual(devEvent.parameter, 'VISCOSITY');
  assert.strictEqual(devEvent.currentValue, 3380);
  assert.strictEqual(devEvent.targetValue, 3200);
});
