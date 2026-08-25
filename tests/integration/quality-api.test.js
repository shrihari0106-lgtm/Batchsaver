const test = require('node:test');
const assert = require('node:assert');

const { QualityEngine } = require('../../modules/quality-monitoring/src');
const { QualityController } = require('../../apps/api/src/controllers/quality.controller');

function makeReading(param, value, batchId = 'batch-int-01') {
  return {
    id: `r-${Date.now()}-${Math.random()}`,
    sensorId: `sns-${param}`,
    batchId,
    parameter: param,
    rawValue: value,
    filteredValue: value,
    unit: param === 'VISCOSITY' ? 'cP' : param === 'MOISTURE' ? '%' : param === 'COLOUR_INDEX' ? 'CI' : '°C',
    timestamp: new Date().toISOString(),
    quality: 'GOOD',
    simulated: true,
  };
}

test('Integration: Module 1 Sensor Data Flow → Quality Engine → Quality API Controller', async () => {
  const engine = new QualityEngine({ stateChangePersistenceCount: 1 });
  const controller = new QualityController(engine);
  const batchId = 'batch-int-01';

  // 1. Ingest nominal sensor readings for all 4 parameters
  await engine.processReading(makeReading('VISCOSITY', 3200, batchId));
  await engine.processReading(makeReading('MOISTURE', 38.0, batchId));
  await engine.processReading(makeReading('COLOUR_INDEX', 62.0, batchId));
  await engine.processReading(makeReading('TEMPERATURE', 92.0, batchId));

  // 2. Query getCurrentQuality
  const overviewRes = await controller.getCurrentQuality(batchId);
  assert.strictEqual(overviewRes.success, true);
  assert.strictEqual(overviewRes.data.batchId, batchId);
  assert.strictEqual(overviewRes.data.currentHealthScore.score, 100);
  assert.strictEqual(overviewRes.data.measurements.VISCOSITY.value, 3200);

  // 3. Query getHealthScore
  const healthRes = await controller.getHealthScore(batchId);
  assert.strictEqual(healthRes.success, true);
  assert.strictEqual(healthRes.data.score, 100);

  // 4. Ingest DEVIATION reading for Viscosity (3380 cP -> 180 cP dev > 150 cP tolerance)
  await engine.processReading(makeReading('VISCOSITY', 3380, batchId));

  // 5. Query getActiveDeviations
  const devRes = await controller.getActiveDeviations(batchId);
  assert.strictEqual(devRes.success, true);
  assert.ok(devRes.data.length >= 1);
  assert.strictEqual(devRes.data[0].parameter, 'VISCOSITY');
  assert.strictEqual(devRes.data[0].status, 'DEVIATION');

  // 6. Query getTrends
  const trendRes = await controller.getTrends(batchId);
  assert.strictEqual(trendRes.success, true);
  assert.strictEqual(trendRes.data.length, 4);
});
