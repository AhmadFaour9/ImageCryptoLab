# ImageCryptoLab

**Version 2.2.0** | Premium Edition 💎 | Production Ready ✅

**Author:** Ahmad Faour  
**© 2026 Ahmad Faour — All rights reserved.**

A high-performance, client-side web application for image processing, encoding, and encryption. Featuring a professional dark-themed UI with glassmorphism, zero-trust security architecture, and 100% browser-based processing.

## 🌟 New in v2.2.0
- 💎 **Premium UI/UX:** Complete redesign with a midnight glassmorphism aesthetic.
- 🎨 **Lucide Integration:** Semantic iconography across all toolsets.
- 🖱️ **Drag & Drop:** Advanced file upload system with drop-zone visuals.
- 🔒 **Local CryptoJS:** Fully offline-capable encryption (no CDN reliance).
- ⚡ **Optimized Engine:** Improved canvas buffering and minification.

## Features

### Image Processing
- 🖼️ **Convert** images to PNG, JPEG, or WebP (Canvas-based)
- 📏 **Resize** images with precision aspect ratio preservation
- 🗜️ **Auto-compression** engine for target size thresholds

### Data Representation
- 🔤 **Base64** encoding from raw file streams
- 🔢 **Hexadecimal** encoding for bit-perfect representation
- 💾 **Export** encoded data to .txt assets

### Cryptography (Full Parameter Control)
- 🔐 **AES-256 / DES / TripleDES** support
- 🔑 **PBKDF2** key derivation with configurable iterations
- 🛠️ **Custom Modes:** CBC, ECB, CFB, OFB, CTR
- 📏 **Custom Padding:** PKCS7, ANSI X9.23, ISO 10126, etc.
- ✅ **Round-trip validation** with manifest logging

### Security & Privacy
- 🛡️ **Zero-Trust:** 100% client-side. No data ever leaves your device.
- 📵 **Offline-Ready:** All dependencies are bundled locally.
- 🕵️ **Privacy-First:** No tracking, cookies, or telemetry.
- ✅ **CI/CD Verified:** 47 automated tests covering all critical paths.

## 🔐 Auth & Quota System
To protect against automated brute-force attempts on decryption:
- **Anonymous:** 5 attempts per window (local storage).
- **Authenticated:** 5 daily attempts (synced via Firebase/Firestore).
- **Unlimited:** Admin-granted access for power users.

## Quick Start

### Run Locally
```bash
# Clone the repository
git clone https://github.com/AhmadFaour9/ImageCryptoLab.git

# Install dev dependencies
npm install

# Build & Serve
npm run build
npm run serve
```

## Testing & Quality

```bash
npm test              # Run full suite (47 tests)
npm run test:validation
npm run test:encryption
```

### Coverage
- ✅ MIME type detection logic
- ✅ Cryptographic round-trips (AES/DES)
- ✅ Canvas API & Blob handling
- ✅ Browser compatibility (ES6+ features)

## Architecture

- **Stack:** Vanilla JS (ES6+), CSS3 (Custom Design System), HTML5.
- **Engine:** local `crypto-js.min.js` (bundled).
- **Icons:** Lucide-JS (Client-side rendering).

## Roadmap
- [ ] Web Workers for 100MB+ file processing
- [ ] WebAssembly-based encryption core
- [ ] Batch processing queue
- [ ] Password strength visualizer
- [ ] Internationalization (i18n)

## Support & Contributing
- **GitHub**: [AhmadFaour9](https://github.com/AhmadFaour9)
- **Repo**: [ImageCryptoLab](https://github.com/AhmadFaour9/ImageCryptoLab)

Licensed under the **MIT License**.
