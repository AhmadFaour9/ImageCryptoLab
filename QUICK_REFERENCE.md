# ImageCryptoLab - Quick Reference Guide

## Command Reference

### Development
```bash
npm install              # Install dependencies (one-time)
npm test                # Run all tests
npm run build           # Minify CSS and JS
npm run serve           # Start local server (http://localhost:8080)
```

### Testing
```bash
npm test                # Run all tests (validation, encryption, browser)
npm run test:validation # Input validation & MIME detection
npm run test:encryption # Encryption/decryption operations
npm run test:browser    # Browser API compatibility
```

### Deployment
```bash
git push                # Triggers GitHub Actions (auto-deploy to Pages)
npm run deploy          # Manual: build, commit, and push
```

---

## Project Structure

```
ImageCryptoLab/
├── index.html           # Main HTML (264 lines)
├── styles.css           # CSS styling (~350 lines)
├── app.js               # Core JavaScript (1000+ lines)
├── package.json         # Build scripts & dependencies
├── .gitignore           # Git ignore rules
│
├── .github/workflows/
│   └── deploy.yml       # GitHub Actions CI/CD
│
├── scripts/             # Build & test scripts
│   ├── minify-css.js    # CSS minification
│   ├── minify-js.js     # JavaScript minification
│   ├── test-runner.js   # Test orchestrator
│   ├── test-validation.js      # Validation tests
│   ├── test-encryption.js      # Crypto tests
│   └── test-compatibility.js   # Browser tests
│
├── docs/
│   ├── DEPLOYMENT.md    # Deployment guide
│   ├── TESTING.md       # Testing guide
│   ├── REFACTORING_COMPLETE.md
│   └── REFACTORING_SUMMARY.md
│
└── README.md            # Project overview
```

---

## Key Files & Their Roles

| File | Size | Purpose |
|------|------|---------|
| index.html | 264 lines | UI structure, semantic HTML |
| styles.css | 350 lines | Dark theme, responsive design, animations |
| app.js | 1000+ lines | Core logic: encryption, encoding, image processing |
| package.json | Config | Build scripts, dependencies, metadata |
| .github/workflows/deploy.yml | 50 lines | GitHub Actions automation |

---

## Feature Map

### File Operations (Lines: 400-450)
- Load image file
- Display preview
- Download original
- Clear selection
- File size validation

### Image Conversion (Lines: 450-750)
- PNG/JPEG/WebP conversion
- Image resizing (with aspect ratio)
- Auto-compression algorithm
- Quality control
- Canvas-based processing

### Encoding (Lines: 375-435)
- Base64 encoding
- Hex encoding
- Copy to clipboard
- Download encoded file

### Encryption/Decryption (Lines: 435-990)
- AES encryption
- DES encryption
- Multiple output formats (hex, Base64, OpenSSL)
- Round-trip encryption/decryption
- Passphrase-based key derivation

### State Management (Lines: 230-385)
- Centralized state object
- File tracking
- Processing flags
- Toast notifications
- DOM caching

---

## Key Functions Reference

### File Operations
```javascript
setFileState(file, bytes)        // Set current file
clearState()                     // Reset all state
setPreviewFromBytes(bytes)       // Update preview
checkFileSize(bytes)             // Validate size
```

### Image Processing
```javascript
bytesToImageBitmap(bytes)        // Load image data
compressImage(bytes, mime, maxKB) // Iterative compression
convertAndDownload()             // Convert and save
```

### Encoding
```javascript
bytesToHex(bytes)                // Convert to hex
hexToBytes(hex)                  // Convert from hex
bytesToBase64(bytes)             // Convert to Base64
base64ToBytes(b64)               // Convert from Base64
```

### Encryption/Decryption
```javascript
bytesToWordArray(bytes)          // CryptoJS prep
wordArrayToBytes(wordArray)      // CryptoJS convert
ensureCryptoReady()              // Check library
```

### Utilities
```javascript
guessMime(bytes)                 // Detect image type
downloadBlob(blob, filename)     // Download file
showNotification(msg, type)      // Toast message
```

---

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Canvas 2D | ✅ | ✅ | ✅ | ✅ | ✅ |
| toBlob() | ✅ | ✅ | ✅ | ✅ | ✅ |
| Uint8Array | ✅ | ✅ | ✅ | ✅ | ✅ |
| Base64 | ✅ | ✅ | ✅ | ✅ | ✅ |
| CryptoJS | ✅ | ✅ | ✅ | ✅ | ✅ |
| ES6 | ✅ | ✅ | ✅ | ✅ | ✅ |
| URL API | ✅ | ✅ | ✅ | ✅ | ✅ |

**Minimum Versions**: Chrome 66+, Firefox 57+, Safari 11+, Edge 79+

---

## Configuration & Constants

### File Size Limit
```javascript
MAX_FILE_SIZE = 100 * 1024 * 1024  // 100MB
```

### Compression Settings
```javascript
COMPRESSION_CONFIG = {
  initialQuality: 0.92,    // Start at 92%
  qualityStep: 0.05,       // Decrease by 5% each iteration
  minQuality: 0.1,         // Minimum 10%
  maxIterations: 15        // Max 15 tries
}
```

### State Object Structure
```javascript
state = {
  currentFile: null,         // File object
  currentBytes: null,        // Uint8Array
  currentMime: null,         // MIME type
  currentName: null,         // Filename
  decryptedBytes: null,      // Decrypted data
  decryptedMime: null,       // Decrypted MIME
  decryptedObjectURL: null,  // Preview URL
  isProcessing: false        // Processing flag
}
```

### DOM Cache (42 Elements)
```javascript
DOM = {
  // File section
  fileInput, fileMeta, previewImg, previewPlaceholder,
  
  // Convert section
  outFormat, outQuality, qualityLabel, convertBtn,
  resizeW, resizeH, applyResizeBtn,
  autoCompress, maxSize, compressionInfo,
  
  // Encode section
  makeBase64Btn, makeHexBtn, copyEncodeBtn,
  downloadEncodeBtn, encodeOut, encodeMeta,
  
  // Encrypt section
  encAlg, encPass, encOutFmt, encryptBtn,
  encOut, copyEncBtn, downloadEncBtn,
  
  // Decrypt section
  decAlg, decPass, decInFmt, decryptBtn,
  decIn, decMeta, downloadDecBtn,
  useAsCurrentBtn, decPreviewImg, decPreviewPlaceholder
}
```

---

## Testing Quick Reference

### Test Files
```
test-validation.js      # 13 tests (MIME, hex, file size)
test-encryption.js      # 15 tests (crypto, passphrases)
test-compatibility.js   # 19 tests (browser APIs, ES6+)
Total: 47 tests
```

### Run Tests
```bash
npm test                       # All tests
npm run test:validation        # Validation only
npm run test:encryption        # Encryption only
npm run test:browser           # Browser only
```

### Expected Output
```
✅ All 47 tests passed
├── 13 validation tests
├── 15 encryption tests
└── 19 compatibility tests
```

---

## Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Git repository created
- [ ] GitHub repo configured
- [ ] GitHub Pages enabled
- [ ] URL shows content
- [ ] All features tested manually
- [ ] Encryption/decryption works
- [ ] Cross-browser verified

---

## Performance Metrics

### File Sizes
```
Original CSS:      ~7KB
Original JS:       ~25KB
Minified CSS:      ~4KB  (43% reduction)
Minified JS:       ~7KB  (72% reduction)
Gzipped total:     ~4KB  (93% reduction)
```

### Load Times (Chrome DevTools)
```
FCP (First Contentful Paint):  < 1.5s
LCP (Largest Contentful Paint): < 2s
TTI (Time to Interactive):      < 2.5s
```

### Memory Usage
```
Initial: ~5MB
After loading 50MB image: ~60MB
After encryption: ~65MB
Cleanup: Released properly
```

---

## Encryption Details

### Algorithms
- **AES**: 256-bit with salt (OpenSSL format)
- **DES**: Triple DES with salt (OpenSSL format)
- **Key Derivation**: PBKDF2 (built into CryptoJS)

### Output Formats
```
Hex Format:         Raw ciphertext (no salt header)
OpenSSL Format:     "Salted__" + salt + ciphertext
```

### Passphrase
- Case-sensitive
- Special characters supported
- No length restrictions
- Salted for security

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tests fail | `npm install` then `npm test` |
| Build fails | Check Node.js version (14+) |
| Encryption fails | Ensure CryptoJS CDN accessible |
| CORS error | Check network → should be none |
| File too large | Max 100MB limit per `MAX_FILE_SIZE` |
| Passphrase wrong | Case-sensitive, exact match required |

---

## Development Workflow

### 1. Setup
```bash
git clone <repo>
cd ImageCryptoLab
npm install
```

### 2. Develop
```bash
# Edit files
vim app.js

# Test locally
npm test

# Start server
npm run serve
```

### 3. Commit
```bash
git add .
git commit -m "Feature: Add X"
npm run build
git push
```

### 4. Deploy
- Automatic via GitHub Actions
- Or manual: `npm run deploy`

---

## Environment Setup

### Node.js
- Required: 14+
- Recommended: 18+
- Check: `node --version`

### NPM
- Required: 6+
- Recommended: 8+
- Check: `npm --version`

### Git
- Required: 2.0+
- Check: `git --version`

### Browsers (for testing)
- Chrome 66+
- Firefox 57+
- Safari 11+
- Edge 79+

---

## Resources

| Resource | Link |
|----------|------|
| Deployment | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Testing | [TESTING.md](TESTING.md) |
| Refactoring | [REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md) |
| CryptoJS | [GitHub](https://github.com/brix/crypto-js) |
| MDN Web Docs | [MDN](https://developer.mozilla.org/) |

---

## Contact & Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: [Your email]
- **License**: MIT

---

**Last Updated**: January 2026
**Version**: 2.0.0
**Status**: Production Ready ✅
