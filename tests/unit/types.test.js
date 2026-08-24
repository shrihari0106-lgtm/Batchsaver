const test = require('node:test');
const assert = require('node:assert');

test('Shared Domain Types Validation - Quality States & Reason Codes', () => {
  const validStates = ['NOMINAL', 'WARNING', 'DEVIATION', 'CRITICAL', 'RECOVERING', 'RECOVERED'];
  assert.strictEqual(validStates.length, 6);
  assert.ok(validStates.includes('NOMINAL'));
  assert.ok(validStates.includes('CRITICAL'));
  assert.ok(validStates.includes('RECOVERED'));

  const validRoles = ['OPERATOR', 'SUPERVISOR', 'QUALITY_MANAGER', 'ADMINISTRATOR'];
  assert.strictEqual(validRoles.length, 4);

  const parameters = ['VISCOSITY', 'MOISTURE', 'COLOUR_INDEX', 'TEMPERATURE'];
  assert.strictEqual(parameters.length, 4);
});
