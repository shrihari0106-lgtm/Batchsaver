const test = require('node:test');
const assert = require('node:assert');

test('Process Parameters Configuration - Default Targets & Tolerances', (t) => {
  // Test Viscosity: 3200 cP ± 150 cP
  const viscosity = {
    target: 3200,
    unit: 'cP',
    criticalTolerance: 150,
  };
  assert.strictEqual(viscosity.target, 3200);
  assert.strictEqual(viscosity.criticalTolerance, 150);

  // Test Moisture: 38% ± 1.5%
  const moisture = {
    target: 38.0,
    unit: '%',
    criticalTolerance: 1.5,
  };
  assert.strictEqual(moisture.target, 38.0);
  assert.strictEqual(moisture.criticalTolerance, 1.5);

  // Test Colour Index: 62 ± 3
  const colour = {
    target: 62.0,
    unit: 'CI',
    criticalTolerance: 3.0,
  };
  assert.strictEqual(colour.target, 62.0);
  assert.strictEqual(colour.criticalTolerance, 3.0);

  // Test Temperature: 92°C ± 2°C
  const temperature = {
    target: 92.0,
    unit: '°C',
    criticalTolerance: 2.0,
  };
  assert.strictEqual(temperature.target, 92.0);
  assert.strictEqual(temperature.criticalTolerance, 2.0);
});
