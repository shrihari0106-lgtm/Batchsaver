const test = require('node:test');
const assert = require('node:assert');

const {
  QualityEngine,
  toModule3DeviationPayload,
} = require('../../modules/quality-monitoring/src');
const { QualityController } = require('../../apps/api/src/controllers/quality.controller');

let seq = 0;
function makeSensorReading(param, value, opts = {}) {
  seq += 1;
  return {
    id: `sns-rdg-${Date.now()}-${seq}`,
    sensorId: opts.sensorId || `sensor-${param.toLowerCase()}`,
    batchId: opts.batchId || 'batch-integration-01',
    parameter: param,
    rawValue: value,
    filteredValue: value,
    unit: opts.unit || (param === 'VISCOSITY' ? 'cP' : param === 'MOISTURE' ? '%' : param === 'COLOUR_INDEX' ? 'CI' : '°C'),
    timestamp: opts.timestamp || new Date(Date.now() + seq * 200).toISOString(),
    quality: opts.quality || 'GOOD',
    simulated: true,
  };
}

test('Integration — Quality Engine Pipeline & REST API Controller', async () => {
  const engine = new QualityEngine({ stateChangePersistenceCount: 1, recoveryStabilityCount: 2 });
  const controller = new QualityController(engine);

  const emittedEvents = [];
  engine.subscribeToEvents((event) => {
    emittedEvents.push(event);
  });

  const batchId = 'batch-integration-01';

  // 1. Initial State: Feed Nominal Readings for all 4 parameters
  await engine.processReading(makeSensorReading('VISCOSITY', 3200, { batchId }));
  await engine.processReading(makeSensorReading('MOISTURE', 38.0, { batchId }));
  await engine.processReading(makeSensorReading('COLOUR_INDEX', 62.0, { batchId }));
  await engine.processReading(makeSensorReading('TEMPERATURE', 92.0, { batchId }));

  // Verify Quality Controller response for current quality
  const currentResp = await controller.getCurrentQuality(batchId);
  assert.strictEqual(currentResp.success, true);
  assert.strictEqual(currentResp.data.batchId, batchId);
  assert.strictEqual(currentResp.data.currentHealthScore.score, 100);
  assert.strictEqual(currentResp.data.currentHealthScore.status, 'NOMINAL');

  // 2. Trigger Viscosity Deviation (3380 cP -> +180 cP deviation, > 150 tolerance)
  const devResult = await engine.processReading(makeSensorReading('VISCOSITY', 3380, { batchId }));
  assert.strictEqual(devResult.valid, true);
  assert.strictEqual(devResult.measurement.status, 'DEVIATION');

  // Verify Deviation Event generated and Module 3 payload conversion
  const devEvent = emittedEvents.find((e) => e.eventType === 'QualityDeviationDetected');
  assert.ok(devEvent);
  assert.strictEqual(devEvent.parameter, 'VISCOSITY');
  assert.strictEqual(devEvent.currentValue, 3380);

  const m3Payload = toModule3DeviationPayload(devEvent);
  assert.strictEqual(m3Payload.batchId, batchId);
  assert.strictEqual(m3Payload.parameter, 'VISCOSITY');
  assert.strictEqual(m3Payload.currentValue, 3380);
  assert.strictEqual(m3Payload.targetValue, 3200);
  assert.strictEqual(m3Payload.severity, 'MEDIUM');
  assert.strictEqual(m3Payload.direction, 'HIGH');

  // Verify Active Deviations API
  const activeDevResp = await controller.getActiveDeviations(batchId);
  assert.strictEqual(activeDevResp.success, true);
  assert.strictEqual(activeDevResp.data.length, 1);
  assert.strictEqual(activeDevResp.data[0].parameter, 'VISCOSITY');

  // 3. Process Recovery Sequence
  // Reading 1 back at target 3200 -> state RECOVERING
  const recResult1 = await engine.processReading(makeSensorReading('VISCOSITY', 3200, { batchId }));
  assert.strictEqual(recResult1.measurement.status, 'RECOVERING');

  // Reading 2 back at target 3200 (reaches recoveryStabilityCount = 2) -> state RECOVERED
  const recResult2 = await engine.processReading(makeSensorReading('VISCOSITY', 3200, { batchId }));
  assert.strictEqual(recResult2.measurement.status, 'RECOVERED');

  const recDoneEvent = emittedEvents.find((e) => e.eventType === 'QualityRecovered');
  assert.ok(recDoneEvent);
  assert.strictEqual(recDoneEvent.parameter, 'VISCOSITY');

  // 4. Verify Health Score & Trends API Endpoints
  const healthResp = await controller.getHealthScore(batchId);
  assert.strictEqual(healthResp.success, true);
  assert.ok(healthResp.data.score >= 90);

  const trendsResp = await controller.getTrends(batchId);
  assert.strictEqual(trendsResp.success, true);
  assert.strictEqual(trendsResp.data.length, 4);
});
