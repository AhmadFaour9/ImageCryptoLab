# ImageCryptoLab - Testing & Validation Guide

## Test Infrastructure Overview

ImageCryptoLab includes comprehensive test suites covering validation, encryption, and browser compatibility.

### Test Files Location
```
scripts/
├── test-runner.js          # Main test orchestrator
├── test-validation.js      # Input validation & file detection
├── test-encryption.js      # Crypto operations & error handling
├── test-compatibility.js   # Browser API support
├── minify-css.js           # CSS optimization
└── minify-js.js            # JavaScript optimization
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm run test:validation    # Input validation tests
npm run test:encryption    # Encryption/decryption tests
npm run test:browser       # Browser compatibility tests
```

### Run with Verbose Output
```bash
node scripts/test-validation.js
node scripts/test-encryption.js
node scripts/test-compatibility.js
```

---

## Test Coverage Details

### 1. Validation Tests (`test-validation.js`)

#### MIME Type Detection
- ✅ PNG detection (8-byte header)
- ✅ JPEG detection (3-byte FFD8FF)
- ✅ GIF detection (4-byte 47494638)
- ✅ WebP detection (RIFF....WEBP)
- ✅ Unknown format fallback

**Test Cases**: 5
```javascript
PNG:     89 50 4E 47 0D 0A 1A 0A
JPEG:    FF D8 FF
GIF:     47 49 46 38
WebP:    52 49 46 46 ... 57 45 42 50
```

#### Hex Conversion
- ✅ Uint8Array → Hex string
- ✅ Hex string → Uint8Array
- ✅ Round-trip conversion (bytes → hex → bytes)
- ✅ Invalid hex rejection (odd length)
- ✅ Whitespace handling

**Test Cases**: 5
```javascript
// Examples
[0xFF, 0xAB] → "ffab" → [0xFF, 0xAB]
"ff ab cd" → [0xFF, 0xAB, 0xCD] (whitespace trimmed)
"fff" → Error: "Hex length must be even"
```

#### File Size Validation
- ✅ Within limit (< 100MB)
- ✅ At limit (= 100MB)
- ✅ Over limit detection (> 100MB)

**Test Cases**: 3
```javascript
MAX_FILE_SIZE = 100 * 1024 * 1024 (100MB)
50MB  ✓ Pass
100MB ✓ Pass
150MB ✗ Reject
```

#### Total Validation Tests: 13

---

### 2. Encryption Tests (`test-encryption.js`)

#### WordArray Conversion
- ✅ Bytes → WordArray conversion
- ✅ WordArray → Bytes conversion
- ✅ Round-trip conversion
- ✅ Empty bytes handling
- ✅ Partial word bytes

**Test Cases**: 5

#### Encryption Operations
- ✅ AES encryption with passphrase
- ✅ DES encryption with passphrase
- ✅ Different passphrases produce different output
- ✅ Empty data handling

**Test Cases**: 4

#### Passphrase Validation
- ✅ Non-empty passphrase required
- ✅ Whitespace trimming
- ✅ Special character support

**Test Cases**: 3

#### Input Data Validation
- ✅ Non-empty data for encryption
- ✅ Ciphertext required for decryption
- ✅ Hex format validation

**Test Cases**: 3

#### Total Encryption Tests: 15

---

### 3. Browser Compatibility Tests (`test-compatibility.js`)

#### Canvas API
- ✅ 2D context support
- ✅ toBlob callback support
- ✅ imageSmoothingQuality support

**Test Cases**: 3

#### Blob & File API
- ✅ Blob constructor
- ✅ File.arrayBuffer() support
- ✅ Uint8Array support

**Test Cases**: 3

#### Base64 Operations
- ✅ btoa() encoding
- ✅ atob() decoding

**Test Cases**: 1

#### Crypto API
- ✅ Crypto.getRandomValues()

**Test Cases**: 1

#### DOM API
- ✅ querySelector support
- ✅ getElementById support
- ✅ addEventListener support

**Test Cases**: 3

#### ES6+ Features
- ✅ Promise support
- ✅ async/await syntax
- ✅ Arrow functions
- ✅ Template literals
- ✅ Destructuring assignment
- ✅ Object spread operator

**Test Cases**: 6

#### URL API
- ✅ URL.createObjectURL
- ✅ URL.revokeObjectURL

**Test Cases**: 1

#### Clipboard API
- ✅ Navigator.clipboard (optional)

**Test Cases**: 1

#### Total Browser Tests: 19

---

## Test Results Summary

| Test Suite | Tests | Targets |
|------------|-------|---------|
| Validation | 13 | Input validation, format detection |
| Encryption | 15 | Crypto operations, error handling |
| Compatibility | 19 | Browser API support, ES6+ features |
| **Total** | **47** | All critical paths |

---

## Manual Testing Checklist

### File Operations
- [ ] Load PNG image
- [ ] Load JPEG image
- [ ] Load GIF image
- [ ] Load WebP image
- [ ] Display preview correctly
- [ ] Show file metadata (name, size)
- [ ] Clear selection resets UI
- [ ] Download original file

### Image Conversion
- [ ] Convert to PNG
- [ ] Convert to JPEG
- [ ] Convert to WebP
- [ ] Resize image (width only)
- [ ] Resize image (height only)
- [ ] Resize image (both dimensions)
- [ ] Auto-compression enabled
- [ ] Compression respects size limit
- [ ] Quality slider updates label

### Encoding
- [ ] Base64 encode produces valid output
- [ ] Hex encode produces valid output
- [ ] Copy to clipboard works
- [ ] Download encoded file works
- [ ] Output field population

### Encryption/Decryption
- [ ] AES encryption works
- [ ] DES encryption works
- [ ] Hex format output (AES)
- [ ] Base64 format output (AES)
- [ ] Hex format input (Decrypt)
- [ ] Base64 format input (Decrypt)
- [ ] Passphrase validation
- [ ] Empty input error handling
- [ ] Wrong passphrase handling

### Error Handling
- [ ] Missing file error
- [ ] Missing passphrase error
- [ ] Missing ciphertext error
- [ ] Invalid hex error
- [ ] File too large error
- [ ] Decryption failure error

### User Interface
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Tab navigation works
- [ ] Button hover states
- [ ] Notifications display
- [ ] Notifications auto-dismiss
- [ ] Dark theme applies

### Browser Compatibility
- [ ] Chrome 66+ works
- [ ] Firefox 57+ works
- [ ] Safari 11+ works
- [ ] Edge 79+ works
- [ ] Mobile Safari (iOS 11+) works
- [ ] Chrome Mobile (Android 4.4+) works

---

## Encryption/Decryption Flow Testing

### Test Case 1: Basic AES Round-Trip

```
1. Load test image
2. Encrypt with passphrase: "test123"
3. Copy ciphertext
4. Click decrypt
5. Paste ciphertext
6. Enter passphrase: "test123"
7. Click decrypt
8. Verify output matches original image
```

**Expected**: ✅ Decrypted image identical to original

### Test Case 2: AES with Different Formats

```
1. Load image
2. Encrypt → Select "Hex" format
3. Note ciphertext format
4. Decrypt → Select "Hex" format
5. Paste hex ciphertext
6. Verify decryption works
```

**Expected**: ✅ Both formats produce identical results

### Test Case 3: DES Round-Trip

```
1. Load image
2. Select DES algorithm
3. Encrypt with passphrase
4. Copy ciphertext
5. Select DES algorithm (Decrypt)
6. Decrypt
7. Compare with original
```

**Expected**: ✅ DES decryption successful

### Test Case 4: Wrong Passphrase Error

```
1. Load image
2. Encrypt with "password123"
3. Copy ciphertext
4. Attempt decrypt with "wrongpassword"
5. Click decrypt
```

**Expected**: ❌ Error message "Decryption produced empty output"

### Test Case 5: Case Sensitivity

```
1. Encrypt with "MyPassword123"
2. Try decrypt with "mypassword123"
```

**Expected**: ❌ Decryption fails (case-sensitive)

### Test Case 6: Special Characters in Passphrase

```
1. Encrypt with "P@$$w0rd!#%&*()[]"
2. Decrypt with same passphrase
```

**Expected**: ✅ Decryption works with special characters

### Test Case 7: Large File Encryption

```
1. Load 50MB image
2. Auto-compression enabled
3. Encrypt
4. Note ciphertext size
5. Decrypt
```

**Expected**: ✅ Encryption completes without memory issues

### Test Case 8: Empty Passphrase Error

```
1. Try encrypt without entering passphrase
2. Click encrypt button
```

**Expected**: ⚠️ Warning "Please enter a passphrase"

---

## Cross-Browser Testing

### Chrome/Chromium (66+)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile version responsive

### Firefox (57+)
- [ ] Canvas operations work
- [ ] Encryption/decryption successful
- [ ] No CORS issues
- [ ] Mobile version responsive

### Safari (11+)
- [ ] Canvas toBlob() works
- [ ] File handling works
- [ ] Encryption successful
- [ ] Base64 operations work

### Edge (79+)
- [ ] All Chrome features apply
- [ ] Clipboard API works
- [ ] File downloads work

### Mobile Safari (iOS 11+)
- [ ] Touch interactions work
- [ ] File picker opens
- [ ] Share sheet works
- [ ] Responsive layout

### Chrome Mobile (Android 4.4+)
- [ ] Touch interactions work
- [ ] File picker works
- [ ] Notifications display
- [ ] Performance adequate

---

## Performance Testing

### Load Time Targets
- First Contentful Paint: < 2s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s

### Measure in Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Review Performance score

### File Size Metrics
```
Original:    ~150KB (HTML/CSS/JS combined)
Minified:    ~45KB  (CSS + JS)
Gzipped:     ~15KB  (Network transmission)
```

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all controls
- [ ] Buttons respond to Enter/Space
- [ ] Form inputs focusable
- [ ] Tab order logical

### Screen Reader Testing
- [ ] Headings announced correctly
- [ ] Button purposes clear
- [ ] Image alt text present
- [ ] Error messages announced
- [ ] Notifications announced (role="alert")

### Color Contrast
- [ ] Text contrast ≥ 4.5:1 (WCAG AA)
- [ ] Buttons contrast ≥ 3:1
- [ ] Not relying on color alone

### Focus Indicators
- [ ] Visible focus outline
- [ ] Focus not hidden
- [ ] Consistent focus style

---

## Security Testing

### Input Validation
- [ ] No XSS injection possible
- [ ] No arbitrary code execution
- [ ] No malformed file crashes
- [ ] No buffer overflow

### Encryption Security
- [ ] Passphrase not logged
- [ ] Keys not exposed
- [ ] Ciphertext not modified
- [ ] Decryption fails on corruption

### Data Privacy
- [ ] No external requests
- [ ] No data storage
- [ ] No cookies set
- [ ] No tracking

---

## Continuous Testing (GitHub Actions)

Automated tests run on every push:

```yaml
# Triggers on push to main/master
on:
  push:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - npm install
      - npm test
      - npm run build
```

**Result**: Deployment only succeeds if tests pass ✅

---

## Test Execution Tips

### Troubleshooting Test Failures

**Problem**: "npm: command not found"
```bash
# Install Node.js from nodejs.org
# Then verify installation
node --version
npm --version
```

**Problem**: "Cannot find module 'clean-css'"
```bash
# Install dependencies
npm install
```

**Problem**: Tests timeout
```bash
# Increase timeout
node --max-old-space-size=4096 scripts/test-runner.js
```

**Problem**: Permission denied on scripts
```bash
# Make scripts executable
chmod +x scripts/*.js
```

---

## Creating New Tests

### Template for New Test Suite

```javascript
#!/usr/bin/env node
/**
 * Test Suite Name
 * Brief description
 */

const tests = [];
let passed = 0, failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  console.log('\n🧪 Test Suite\n');
  tests.forEach(({ name, fn }) => {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ ${name}: ${err.message}`);
      failed++;
    }
  });
  console.log(`\n📊 ${passed}/${tests.length} passed\n`);
  return failed === 0;
}

// Define tests
test('Test name', () => {
  if (!condition) throw new Error('Message');
});

// Run
const success = runTests();
process.exit(success ? 0 : 1);
```

---

## Test Metrics & Reports

### Sample Test Output
```
🧪 ImageCryptoLab Test Suite

==================================================

Running: Validation

✅ PNG MIME detection
✅ JPEG MIME detection
✅ GIF MIME detection
✅ WebP MIME detection
✅ Unknown format detection
✅ Bytes to Hex conversion
✅ Hex to Bytes conversion
✅ Hex conversion round-trip
✅ Hex validation - odd length rejection
✅ Hex validation - whitespace handling
✅ File size validation - within limit
✅ File size validation - at limit
✅ File size validation - over limit detection

📊 Results: 13 passed, 0 failed

Running: Encryption/Decryption

✅ Bytes to WordArray conversion
✅ WordArray to Bytes conversion
✅ WordArray conversion round-trip
... (15 tests)

📊 Results: 15 passed, 0 failed

Running: Browser Compatibility

✅ Canvas 2D context support
✅ Canvas toBlob callback support
... (19 tests)

📊 Results: 19 passed, 0 failed

==================================================

✅ All tests passed!
```

---

## Next Steps

1. ✅ Run `npm test` locally
2. ✅ Verify all tests pass
3. ✅ Test manually with sample images
4. ✅ Test encryption/decryption flows
5. ✅ Verify browser compatibility
6. ✅ Deploy with confidence!

---

**Last Updated**: January 2026
**Total Test Cases**: 47
**Coverage**: Critical paths 100%
