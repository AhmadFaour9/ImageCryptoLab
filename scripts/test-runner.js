#!/usr/bin/env node
/**
 * Test Runner
 * Orchestrates all test suites
 */

const { spawn } = require('child_process');
const path = require('path');

const tests = [
  { name: 'Validation', file: 'test-validation.js' },
  { name: 'Encryption/Decryption', file: 'test-encryption.js' },
  { name: 'Browser Compatibility', file: 'test-compatibility.js' }
];

console.log('🧪 ImageCryptoLab Test Suite\n');
console.log('='.repeat(50) + '\n');

let currentTest = 0;
let failed = 0;

function runNextTest() {
  if (currentTest >= tests.length) {
    console.log('='.repeat(50));
    if (failed === 0) {
      console.log('\n✅ All tests passed!\n');
      process.exit(0);
    } else {
      console.log(`\n❌ ${failed} test suite(s) failed\n`);
      process.exit(1);
    }
    return;
  }

  const test = tests[currentTest];
  const testFile = path.join(__dirname, test.file);

  console.log(`Running: ${test.name}\n`);

  const proc = spawn('node', [testFile], { stdio: 'inherit' });

  proc.on('close', (code) => {
    if (code !== 0) {
      failed++;
    }
    console.log();
    currentTest++;
    runNextTest();
  });

  proc.on('error', (err) => {
    console.error(`Error running test: ${err.message}`);
    failed++;
    currentTest++;
    runNextTest();
  });
}

runNextTest();
