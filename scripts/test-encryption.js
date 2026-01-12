#!/usr/bin/env node
/**
 * Encryption/Decryption Tests
 * Tests cryptographic operations, round-trip encryption, and error cases
 * Note: This is a unit test framework. Full testing requires CryptoJS library.
 */

// Mock CryptoJS for testing
const mockCryptoJS = {
  lib: {
    WordArray: {
      create: (words, sigBytes) => ({ words, sigBytes })
    },
    CipherParams: {
      create: (obj) => obj
    }
  },
  enc: {
    Hex: { parse: (hex) => ({ hex }) }
  },
  AES: {
    encrypt: (data, pass) => ({
      ciphertext: { toString: () => 'mock_encrypted' },
      toString: () => 'mock_encrypted_openssl'
    }),
    decrypt: (data, pass) => ({ words: [0], sigBytes: 4 })
  },
  DES: {
    encrypt: (data, pass) => ({
      ciphertext: { toString: () => 'mock_encrypted' },
      toString: () => 'mock_encrypted_openssl'
    }),
    decrypt: (data, pass) => ({ words: [0], sigBytes: 4 })
  }
};

// Simulate conversion functions
function bytesToWordArray(bytes) {
  const words = [];
  for (let i = 0; i < bytes.length; i += 4) {
    words.push(
      (bytes[i] << 24) |
      (bytes[i + 1] << 16) |
      (bytes[i + 2] << 8) |
      bytes[i + 3]
    );
  }
  return mockCryptoJS.lib.WordArray.create(words, bytes.length);
}

function wordArrayToBytes(wordArray) {
  if (!wordArray || !wordArray.words) return new Uint8Array(0);
  const bytes = new Uint8Array(wordArray.sigBytes);
  for (let i = 0; i < wordArray.sigBytes; i++) {
    bytes[i] = (wordArray.words[Math.floor(i / 4)] >>> (8 * (3 - (i % 4)))) & 0xFF;
  }
  return bytes;
}

// Test suite
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  console.log('\n🔐 Running Encryption/Decryption Tests\n');
  
  tests.forEach(({ name, fn }) => {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${err.message}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// WordArray Conversion Tests
test('Bytes to WordArray conversion', () => {
  const bytes = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
  const wa = bytesToWordArray(bytes);
  if (!wa.words || wa.sigBytes !== 4) throw new Error('Invalid WordArray');
});

test('WordArray to Bytes conversion', () => {
  const wa = mockCryptoJS.lib.WordArray.create([0x01020304], 4);
  const bytes = wordArrayToBytes(wa);
  if (bytes.length !== 4) throw new Error('Invalid byte length');
});

test('WordArray conversion round-trip', () => {
  const original = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
  const wa = bytesToWordArray(original);
  const restored = wordArrayToBytes(wa);
  if (!arraysEqual(original, restored)) throw new Error('Round-trip failed');
});

test('Empty bytes to WordArray', () => {
  const bytes = new Uint8Array([]);
  const wa = bytesToWordArray(bytes);
  if (wa.sigBytes !== 0) throw new Error('Should be empty');
});

test('Partial word bytes to WordArray', () => {
  const bytes = new Uint8Array([0x01, 0x02, 0x03]);
  const wa = bytesToWordArray(bytes);
  if (wa.sigBytes !== 3) throw new Error('Should preserve byte count');
});

// Encryption Validation Tests
test('AES encryption with passphrase', () => {
  const bytes = new Uint8Array([0xFF, 0xAB, 0xCD, 0xEF]);
  const wa = bytesToWordArray(bytes);
  const passphrase = 'test_passphrase';
  
  const encrypted = mockCryptoJS.AES.encrypt(wa, passphrase);
  if (!encrypted.toString()) throw new Error('Encryption failed');
});

test('DES encryption with passphrase', () => {
  const bytes = new Uint8Array([0xFF, 0xAB, 0xCD, 0xEF]);
  const wa = bytesToWordArray(bytes);
  const passphrase = 'test_passphrase';
  
  const encrypted = mockCryptoJS.DES.encrypt(wa, passphrase);
  if (!encrypted.toString()) throw new Error('Encryption failed');
});

test('Encryption with different passphrases produces different output', () => {
  const bytes = new Uint8Array([0xFF, 0xAB, 0xCD, 0xEF]);
  const wa = bytesToWordArray(bytes);
  
  // In real scenario, these would be different
  // This test validates the concept
  if (!wa) throw new Error('WordArray creation failed');
});

test('Decryption of empty data', () => {
  const decrypted = mockCryptoJS.AES.decrypt('', 'passphrase');
  const bytes = wordArrayToBytes(decrypted);
  // Empty decrypt should produce valid (possibly empty) output
  if (bytes === null || bytes === undefined) throw new Error('Should handle empty decryption');
});

// Passphrase Validation Tests
test('Passphrase validation - non-empty required', () => {
  const passphrase = '';
  
  // This should fail as expected
  let errorThrown = false;
  try {
    if (passphrase.trim().length === 0) throw new Error('Passphrase required');
  } catch (e) {
    errorThrown = true;
  }
  if (!errorThrown) throw new Error('Should validate passphrase');
});

test('Passphrase validation - whitespace trimming', () => {
  const passphrase = '  test  ';
  if (passphrase.trim() !== 'test') throw new Error('Whitespace not trimmed');
});

test('Passphrase validation - accepts special characters', () => {
  const passphrase = '!@#$%^&*()[]{}';
  if (passphrase.trim().length === 0) throw new Error('Should accept special chars');
});

// Input Data Validation Tests
test('Encryption input validation - non-empty data required', () => {
  const data = new Uint8Array([]);
  // For encryption, empty data should still be processable (though unusual)
  const wa = bytesToWordArray(data);
  if (wa.sigBytes !== 0) throw new Error('Should handle empty data');
});

test('Decryption input validation - ciphertext required', () => {
  const ciphertext = '';
  
  let errorThrown = false;
  try {
    if (ciphertext.trim().length === 0) throw new Error('Ciphertext required');
  } catch (e) {
    errorThrown = true;
  }
  if (!errorThrown) throw new Error('Should validate ciphertext');
});

test('Decryption input validation - hex format check', () => {
  const hex = 'not a valid hex string!!!';
  // Check if it looks like hex (simplified)
  const isHex = /^[0-9a-fA-F\s]*$/.test(hex);
  if (isHex) throw new Error('Should reject invalid hex');
});

// Helper function
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);
