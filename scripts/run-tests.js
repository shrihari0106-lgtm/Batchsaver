/**
 * BatchSaver Test Suite Runner (Node.js Test Runner with tsx)
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('   BatchSaver Test Suite - Module 2: Quality Monitoring Engine ');
console.log('================================================================\n');

const unitTestDir = path.resolve(__dirname, '../tests/unit');
const integrationTestDir = path.resolve(__dirname, '../tests/integration');

const unitFiles = fs.readdirSync(unitTestDir).filter(file => file.endsWith('.test.js') || file.endsWith('.test.ts')).map(f => path.join(unitTestDir, f));
const integrationFiles = fs.readdirSync(integrationTestDir).filter(file => file.endsWith('.test.js') || file.endsWith('.test.ts')).map(f => path.join(integrationTestDir, f));

const allTestFiles = [...unitFiles, ...integrationFiles];
let allPassed = true;

for (const filePath of allTestFiles) {
  const relPath = path.relative(path.resolve(__dirname, '..'), filePath);
  console.log(`Running: ${relPath}...`);
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'npx.cmd' : 'npx';
  const result = spawnSync(cmd, ['tsx', '--test', filePath], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  if (result.status !== 0) {
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\nAll unit & integration tests PASSED successfully!');
  process.exit(0);
} else {
  console.error('\nSome tests FAILED.');
  process.exit(1);
}
