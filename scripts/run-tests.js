/**
 * BatchSaver Test Suite Runner (Node.js Test Runner)
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('   BatchSaver Test Suite - Batch 01: Foundation     ');
console.log('====================================================\n');

const testDir = path.resolve(__dirname, '../tests/unit');
const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.js'));

let allPassed = true;

for (const file of testFiles) {
  const filePath = path.join(testDir, file);
  console.log(`Running: tests/unit/${file}...`);
  const result = spawnSync(process.execPath, ['--test', filePath], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\nAll foundation unit tests PASSED successfully!');
  process.exit(0);
} else {
  console.error('\nSome foundation tests FAILED.');
  process.exit(1);
}
