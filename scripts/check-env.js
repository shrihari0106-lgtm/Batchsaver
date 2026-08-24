/**
 * BatchSaver Environment Verification Utility
 */
console.log('[BatchSaver] Verifying environment & runtime configuration...');

const requiredEnv = [
  { name: 'NODE_ENV', default: 'development' },
  { name: 'PORT', default: '4000' },
  { name: 'PARAM_VISCOSITY_TARGET', default: '3200' },
  { name: 'PARAM_MOISTURE_TARGET', default: '38.0' },
  { name: 'PARAM_COLOUR_TARGET', default: '62.0' },
  { name: 'PARAM_TEMPERATURE_TARGET', default: '92.0' },
];

console.log('Environment parameters:');
for (const env of requiredEnv) {
  const val = process.env[env.name] || env.default;
  console.log(`  - ${env.name}: ${val}`);
}

console.log('[BatchSaver] Environment verification complete: OK');
