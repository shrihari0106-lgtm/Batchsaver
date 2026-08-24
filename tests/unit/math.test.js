const test = require('node:test');
const assert = require('node:assert');

function calculateDeviation(value, target) {
  return Number((value - target).toFixed(4));
}

function calculateDeviationPercentage(value, target) {
  if (target === 0) return 0;
  return Number((((value - target) / target) * 100).toFixed(2));
}

function calculateCompositeHealthScore(params) {
  const weights = {
    viscosity: 0.35,
    moisture: 0.30,
    colour: 0.15,
    temperature: 0.20,
  };

  const scoreFor = (devPct) => {
    const absDev = Math.abs(devPct);
    if (absDev <= 2.0) return 100;
    if (absDev <= 5.0) return Math.max(70, 100 - (absDev - 2) * 10);
    if (absDev <= 10.0) return Math.max(40, 70 - (absDev - 5) * 6);
    return Math.max(0, 40 - (absDev - 10) * 4);
  };

  const total =
    scoreFor(params.viscosityDevPct) * weights.viscosity +
    scoreFor(params.moistureDevPct) * weights.moisture +
    scoreFor(params.colourDevPct) * weights.colour +
    scoreFor(params.tempDevPct) * weights.temperature;

  return Math.round(Math.min(100, Math.max(0, total)));
}

test('Math Utils - Deviation & Percentage Calculations', () => {
  assert.strictEqual(calculateDeviation(3350, 3200), 150);
  assert.strictEqual(calculateDeviation(3050, 3200), -150);

  const pctDev = calculateDeviationPercentage(3360, 3200);
  assert.strictEqual(pctDev, 5.0);
});

test('Math Utils - Composite Health Score Calculation', () => {
  // Perfect batch
  const perfectScore = calculateCompositeHealthScore({
    viscosityDevPct: 0.5,
    moistureDevPct: -0.2,
    colourDevPct: 0.1,
    tempDevPct: 0.0,
  });
  assert.strictEqual(perfectScore, 100);

  // Moderate deviation batch
  const moderateScore = calculateCompositeHealthScore({
    viscosityDevPct: 6.0,
    moistureDevPct: 4.0,
    colourDevPct: 1.0,
    tempDevPct: 3.0,
  });
  assert.ok(moderateScore >= 70 && moderateScore <= 90);
});
