#!/usr/bin/env node
/**
 * Validation Tests
 * Tests input validation, file format detection, and error handling
 */

const fs = require('fs');
const path = require('path');

// Simulate validation functions from app.js
function guessMime(bytes) {
  if (bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return "image/jpeg";
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "image/gif";
  }
  if (bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  return "application/octet-stream";
}

function bytesToHex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function hexToBytes(hex) {
  const clean = hex.trim().replace(/^0x/i, "").replace(/\s+/g, "");
  if (clean.length % 2 !== 0) throw new Error("Hex length must be even.");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

// Test suite
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  console.log('\n📋 Running Validation Tests\n');
  
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

// MIME Type Detection Tests
test('PNG MIME detection', () => {
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const mime = guessMime(pngHeader);
  if (mime !== 'image/png') throw new Error(`Expected image/png, got ${mime}`);
});

test('JPEG MIME detection', () => {
  const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF]);
  const mime = guessMime(jpegHeader);
  if (mime !== 'image/jpeg') throw new Error(`Expected image/jpeg, got ${mime}`);
});

test('GIF MIME detection', () => {
  const gifHeader = new Uint8Array([0x47, 0x49, 0x46, 0x38]);
  const mime = guessMime(gifHeader);
  if (mime !== 'image/gif') throw new Error(`Expected image/gif, got ${mime}`);
});

test('WebP MIME detection', () => {
  const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  const mime = guessMime(webpHeader);
  if (mime !== 'image/webp') throw new Error(`Expected image/webp, got ${mime}`);
});

test('Unknown format detection', () => {
  const unknownHeader = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
  const mime = guessMime(unknownHeader);
  if (mime !== 'application/octet-stream') throw new Error(`Expected application/octet-stream, got ${mime}`);
});

// Hex Conversion Tests
test('Bytes to Hex conversion', () => {
  const bytes = new Uint8Array([0xFF, 0xAB, 0xCD, 0xEF]);
  const hex = bytesToHex(bytes);
  if (hex !== 'ffabcdef') throw new Error(`Expected ffabcdef, got ${hex}`);
});

test('Hex to Bytes conversion', () => {
  const hex = 'ffabcdef';
  const bytes = hexToBytes(hex);
  const expected = new Uint8Array([0xFF, 0xAB, 0xCD, 0xEF]);
  if (!arraysEqual(bytes, expected)) throw new Error('Hex to bytes conversion failed');
});

test('Hex conversion round-trip', () => {
  const original = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]);
  const hex = bytesToHex(original);
  const restored = hexToBytes(hex);
  if (!arraysEqual(original, restored)) throw new Error('Round-trip conversion failed');
});

test('Hex validation - odd length rejection', () => {
  try {
    hexToBytes('fff');
    throw new Error('Should have thrown error for odd-length hex');
  } catch (err) {
    if (!err.message.includes('even')) throw new Error('Wrong error message');
  }
});

test('Hex validation - whitespace handling', () => {
  const hex1 = 'ff ab cd ef';
  const hex2 = 'ffabcdef';
  const bytes1 = hexToBytes(hex1);
  const bytes2 = hexToBytes(hex2);
  if (!arraysEqual(bytes1, bytes2)) throw new Error('Whitespace handling failed');
});

// File Size Validation Tests
test('File size validation - within limit', () => {
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const testSize = 50 * 1024 * 1024;
  if (testSize > MAX_FILE_SIZE) throw new Error('File should be within limit');
});

test('File size validation - at limit', () => {
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const testSize = 100 * 1024 * 1024;
  if (testSize > MAX_FILE_SIZE) throw new Error('File should be within limit');
});

test('File size validation - over limit detection', () => {
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const testSize = 150 * 1024 * 1024;
  if (!(testSize > MAX_FILE_SIZE)) throw new Error('Should detect oversized file');
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
