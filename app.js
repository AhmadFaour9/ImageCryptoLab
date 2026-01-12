/**
 * ImageCryptoLab - Enhanced Image Processing & Encryption Tool
 * 
 * Features:
 * - Image conversion (PNG/JPEG/WebP)
 * - Auto-compression with quality adjustment
 * - Base64/Hex encoding
 * - AES/DES encryption & decryption
 * - Image resizing
 * - Client-side processing (no backend required)
 * 
 * @version 2.0
 * @license MIT
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/** Maximum file size limit in bytes (100MB) */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Compression settings */
const COMPRESSION_CONFIG = {
  initialQuality: 0.92,
  qualityStep: 0.05,
  minQuality: 0.1,
  maxIterations: 15
};

// ============================================================================
// DOM ELEMENT CACHE
// ============================================================================

/** Cache all DOM elements for better performance and readability */
const DOM = {
  // File input section
  fileInput: document.getElementById("fileInput"),
  fileMeta: document.getElementById("fileMeta"),
  previewImg: document.getElementById("previewImg"),
  previewPlaceholder: document.getElementById("previewPlaceholder"),
  clearBtn: document.getElementById("clearBtn"),
  downloadOriginalBtn: document.getElementById("downloadOriginalBtn"),

  // Convert section
  outFormat: document.getElementById("outFormat"),
  outQuality: document.getElementById("outQuality"),
  qualityLabel: document.getElementById("qualityLabel"),
  convertBtn: document.getElementById("convertBtn"),
  resizeW: document.getElementById("resizeW"),
  resizeH: document.getElementById("resizeH"),
  applyResizeBtn: document.getElementById("applyResizeBtn"),
  autoCompress: document.getElementById("autoCompress"),
  maxSize: document.getElementById("maxSize"),
  compressionInfo: document.getElementById("compressionInfo"),

  // Encode section
  makeBase64Btn: document.getElementById("makeBase64Btn"),
  makeHexBtn: document.getElementById("makeHexBtn"),
  copyEncodeBtn: document.getElementById("copyEncodeBtn"),
  downloadEncodeBtn: document.getElementById("downloadEncodeBtn"),
  encodeOut: document.getElementById("encodeOut"),
  encodeMeta: document.getElementById("encodeMeta"),

  // Encrypt section
  encAlg: document.getElementById("encAlg"),
  encPass: document.getElementById("encPass"),
  encOutFmt: document.getElementById("encOutFmt"),
  encryptBtn: document.getElementById("encryptBtn"),
  encOut: document.getElementById("encOut"),
  copyEncBtn: document.getElementById("copyEncBtn"),
  downloadEncBtn: document.getElementById("downloadEncBtn"),

  // Decrypt section
  decAlg: document.getElementById("decAlg"),
  decPass: document.getElementById("decPass"),
  decInFmt: document.getElementById("decInFmt"),
  decryptBtn: document.getElementById("decryptBtn"),
  decIn: document.getElementById("decIn"),
  decMeta: document.getElementById("decMeta"),
  downloadDecBtn: document.getElementById("downloadDecBtn"),
  useAsCurrentBtn: document.getElementById("useAsCurrentBtn"),
  decPreviewImg: document.getElementById("decPreviewImg"),
  decPreviewPlaceholder: document.getElementById("decPreviewPlaceholder")
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Query selector shorthand
 * @param {string} sel - CSS selector
 * @returns {HTMLElement|null}
 */
const $ = (sel) => document.querySelector(sel);

/**
 * Convert Uint8Array bytes to hexadecimal string
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToHex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * Convert hexadecimal string to Uint8Array bytes
 * @param {string} hex
 * @returns {Uint8Array}
 * @throws {Error} if hex length is not even
 */
function hexToBytes(hex) {
  const clean = hex.trim().replace(/^0x/i, "").replace(/\s+/g, "");
  if (clean.length % 2 !== 0) throw new Error("Hex length must be even.");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

/**
 * Convert Uint8Array to Base64 using chunked processing
 * Avoids call stack overflow on large files (>10MB)
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToBase64(bytes) {
  const chunkSize = 0x8000; // 32KB chunks
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array
 * Handles data URLs and whitespace
 * @param {string} b64
 * @returns {Uint8Array}
 */
function base64ToBytes(b64) {
  const clean = b64.trim()
    .replace(/^data:.*?;base64,/, "")
    .replace(/\s+/g, "");
  const binary = atob(clean);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

/**
 * Detect image MIME type from file signature (magic bytes)
 * Supports: PNG, JPEG, GIF, WebP, BMP, SVG
 * @param {Uint8Array} bytes
 * @returns {string} MIME type
 */
function guessMime(bytes) {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
    return "image/png";
  }
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return "image/jpeg";
  }
  // GIF: 47 49 46 38
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "image/gif";
  }
  // WEBP: "RIFF"...."WEBP"
  if (bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  // BMP: 42 4D
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4D) {
    return "image/bmp";
  }
  // SVG (text-based)
  const head = new TextDecoder().decode(bytes.slice(0, 200)).trim().toLowerCase();
  if (head.startsWith("<svg") || head.includes("<svg")) {
    return "image/svg+xml";
  }
  return "application/octet-stream";
}

/**
 * Download blob as file
 * Creates temporary download link and cleans up after
 * @param {Blob} blob
 * @param {string} filename
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Cleanup URL after download
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Check if file size is within limits
 * @param {Uint8Array} bytes
 * @throws {Error} if exceeds MAX_FILE_SIZE
 */
function checkFileSize(bytes) {
  if (bytes.length > MAX_FILE_SIZE) {
    throw new Error(`File size (${(bytes.length / 1024 / 1024).toFixed(2)}MB) exceeds limit (100MB).`);
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Centralized application state object
 * Tracks current file, encryption state, and processing flags
 */
const state = {
  currentFile: null,
  currentBytes: null,
  currentMime: null,
  currentName: null,
  decryptedBytes: null,
  decryptedMime: null,
  decryptedObjectURL: null,
  isProcessing: false
};

/**
 * Show notification toast with auto-dismiss
 * @param {string} message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - milliseconds (default: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'assertive');
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto-dismiss
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Set file state and update UI preview
 * @param {File|Object} file - File object or {name, type}
 * @param {Uint8Array} bytes
 */
function setFileState(file, bytes) {
  try {
    checkFileSize(bytes);
    
    state.currentFile = file;
    state.currentBytes = bytes;
    state.currentMime = file.type || 'application/octet-stream';
    state.currentName = file.name || 'image';
    
    setPreviewFromBytes(bytes);
    
    DOM.fileMeta.textContent = `${state.currentName} (${(bytes.length / 1024).toFixed(2)}KB)`;
    DOM.downloadOriginalBtn.disabled = false;
    DOM.convertBtn.disabled = false;
    DOM.makeBase64Btn.disabled = false;
    DOM.makeHexBtn.disabled = false;
    DOM.encryptBtn.disabled = false;
    DOM.applyResizeBtn.disabled = false;
    
    showNotification(`Loaded: ${state.currentName}`, 'success', 2000);
  } catch (err) {
    showNotification(`Error: ${err.message}`, 'error');
  }
}

/**
 * Set image preview in the UI
 * @param {Uint8Array} bytes
 */
function setPreviewFromBytes(bytes) {
  const mime = guessMime(bytes);
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  
  if (mime.startsWith('image/')) {
    DOM.previewImg.src = url;
    DOM.previewPlaceholder.style.display = 'none';
  } else {
    DOM.previewImg.removeAttribute('src');
    DOM.previewPlaceholder.style.display = 'grid';
    DOM.previewPlaceholder.textContent = 'Not a recognized image format';
  }
}

/**
 * Clear all state and reset UI
 */
function clearState() {
  state.currentFile = null;
  state.currentBytes = null;
  state.currentMime = null;
  state.currentName = null;
  state.decryptedBytes = null;
  state.decryptedMime = null;
  
  if (state.decryptedObjectURL) {
    URL.revokeObjectURL(state.decryptedObjectURL);
    state.decryptedObjectURL = null;
  }
  
  DOM.previewImg.removeAttribute('src');
  DOM.previewPlaceholder.style.display = 'grid';
  DOM.previewPlaceholder.textContent = 'No image selected';
  DOM.fileMeta.textContent = '';
  
  // Disable all action buttons
  DOM.downloadOriginalBtn.disabled = true;
  DOM.convertBtn.disabled = true;
  DOM.makeBase64Btn.disabled = true;
  DOM.makeHexBtn.disabled = true;
  DOM.encryptBtn.disabled = true;
  DOM.applyResizeBtn.disabled = true;
  
  // Clear outputs
  DOM.encodeOut.value = '';
  DOM.encOut.value = '';
  DOM.decIn.value = '';
}

/**
 * Ensure CryptoJS is available
 * @throws {Error} if CryptoJS not loaded
 */
function ensureCryptoReady() {
  if (typeof CryptoJS === 'undefined') {
    throw new Error('CryptoJS library not loaded. Please refresh the page.');
  }
}

/**
 * Convert Uint8Array to CryptoJS WordArray
 * @param {Uint8Array} bytes
 * @returns {CryptoJS.lib.WordArray}
 */
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
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

/**
 * Convert CryptoJS WordArray to Uint8Array
 * @param {CryptoJS.lib.WordArray} wordArray
 * @returns {Uint8Array}
 */
function wordArrayToBytes(wordArray) {
  if (!wordArray || !wordArray.words) return new Uint8Array(0);
  const bytes = new Uint8Array(wordArray.sigBytes);
  for (let i = 0; i < wordArray.sigBytes; i++) {
    bytes[i] = (wordArray.words[Math.floor(i / 4)] >>> (8 * (3 - (i % 4)))) & 0xFF;
  }
  return bytes;
}

// ============================================================================
// EVENT LISTENERS - FILE OPERATIONS
// ============================================================================

/**
 * Handle file input change
 */
DOM.fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    state.isProcessing = true;
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    setFileState(file, bytes);
  } catch (err) {
    showNotification(`Error loading file: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
  }
});

/**
 * Handle clear button
 */
DOM.clearBtn.addEventListener("click", () => {
  DOM.fileInput.value = "";
  clearState();
  showNotification("Cleared", 'success', 1500);
});

/**
 * Handle download original button
 */
DOM.downloadOriginalBtn.addEventListener("click", () => {
  if (!state.currentBytes) return;
  try {
    downloadBlob(
      new Blob([state.currentBytes], { type: state.currentMime || "application/octet-stream" }),
      state.currentName || "image"
    );
    showNotification("Downloading original...", 'success', 2000);
  } catch (err) {
    showNotification(`Download failed: ${err.message}`, 'error');
  }
});

// ============================================================================
// EVENT LISTENERS - ENCODE
// ============================================================================

/**
 * Enable/disable encode output buttons based on content
 */
function enableEncodeOutputs() {
  DOM.copyEncodeBtn.disabled = !DOM.encodeOut.value.trim();
  DOM.downloadEncodeBtn.disabled = !DOM.encodeOut.value.trim();
}

/**
 * Handle Base64 encoding button
 */
DOM.makeBase64Btn.addEventListener("click", async () => {
  if (!state.currentBytes) {
    showNotification("Please select an image first", 'warning');
    return;
  }

  try {
    state.isProcessing = true;
    const base64 = bytesToBase64(state.currentBytes);
    DOM.encodeOut.value = base64;
    enableEncodeOutputs();
    showNotification("Encoded to Base64", 'success', 2000);
  } catch (err) {
    showNotification(`Encoding failed: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
  }
});

/**
 * Handle Hex encoding button
 */
DOM.makeHexBtn.addEventListener("click", async () => {
  if (!state.currentBytes) {
    showNotification("Please select an image first", 'warning');
    return;
  }

  try {
    state.isProcessing = true;
    const hex = bytesToHex(state.currentBytes);
    DOM.encodeOut.value = hex;
    enableEncodeOutputs();
    showNotification("Encoded to Hex", 'success', 2000);
  } catch (err) {
    showNotification(`Encoding failed: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
  }
});

/**
 * Handle copy encode output button
 */
DOM.copyEncodeBtn.addEventListener("click", () => {
  const text = DOM.encodeOut.value.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showNotification("Copied to clipboard", 'success', 1500);
  }).catch(() => {
    showNotification("Copy failed", 'error');
  });
});

/**
 * Handle download encode output button
 */
DOM.downloadEncodeBtn.addEventListener("click", () => {
  const text = DOM.encodeOut.value.trim();
  if (!text) return;

  try {
    const blob = new Blob([text], { type: "text/plain" });
    downloadBlob(blob, `encoded-${Date.now()}.txt`);
    showNotification("Downloaded encoded file", 'success', 2000);
  } catch (err) {
    showNotification(`Download failed: ${err.message}`, 'error');
  }
});

// ============================================================================
// EVENT LISTENERS - CONVERT
// ============================================================================

/**
 * Update quality label when slider changes
 */
DOM.outQuality.addEventListener("input", () => {
  DOM.qualityLabel.textContent = Number(DOM.outQuality.value).toFixed(2);
});

/**
 * Convert file bytes to image bitmap for processing
 * Uses createImageBitmap for performance, falls back to Image element
 * @param {Uint8Array} bytes
 * @returns {Promise<ImageBitmap|HTMLCanvasElement>}
 */
async function bytesToImageBitmap(bytes) {
  const blob = new Blob([bytes], { type: state.currentMime || "application/octet-stream" });
  
  // Prefer createImageBitmap for better performance
  if ("createImageBitmap" in window) {
    return await createImageBitmap(blob);
  }
  
  // Fallback: use Image element
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = "anonymous";
  
  await new Promise((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Failed to load image for conversion."));
    img.src = url;
  });
  
  URL.revokeObjectURL(url);

  // Convert to canvas
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

/**
 * Compress image iteratively until target size is reached
 * @param {Uint8Array} bytes
 * @param {string} targetMime
 * @param {number} maxKB - target max file size
 * @returns {Promise<Object>} { blob, quality, iterations }
 */
async function compressImage(bytes, targetMime, maxKB = 500) {
  let quality = COMPRESSION_CONFIG.initialQuality;
  let blob = null;
  let iterations = 0;

  const canvas = await bytesToImageBitmap(bytes).then(bmp => {
    const cvs = document.createElement("canvas");
    cvs.width = bmp.width;
    cvs.height = bmp.height;
    const ctx = cvs.getContext("2d");
    ctx.drawImage(bmp, 0, 0);
    return cvs;
  });

  // Iteratively reduce quality until size target is met
  while (quality > COMPRESSION_CONFIG.minQuality && iterations < COMPRESSION_CONFIG.maxIterations) {
    blob = await new Promise(res => canvas.toBlob(res, targetMime, quality));
    const sizeKB = blob.size / 1024;

    if (sizeKB <= maxKB) break;
    quality -= COMPRESSION_CONFIG.qualityStep;
    iterations++;
  }

  if (!blob) throw new Error("Compression failed");
  return { blob, quality: quality.toFixed(2), iterations };
}

/**
 * Convert and download image with optional resizing and compression
 */
async function convertAndDownload() {
  if (!state.currentBytes) return;

  const targetMime = DOM.outFormat.value;
  const q = Number(DOM.outQuality.value);

  const bmpOrCanvas = await bytesToImageBitmap(state.currentBytes);

  // Get source dimensions
  const srcW = bmpOrCanvas.width;
  const srcH = bmpOrCanvas.height;

  // Calculate output dimensions
  const wIn = DOM.resizeW.value ? Number(DOM.resizeW.value) : null;
  const hIn = DOM.resizeH.value ? Number(DOM.resizeH.value) : null;
  let outW = srcW, outH = srcH;
  
  if (wIn && hIn) {
    outW = wIn;
    outH = hIn;
  } else if (wIn && !hIn) {
    outW = wIn;
    outH = Math.round((srcH / srcW) * outW);
  } else if (!wIn && hIn) {
    outH = hIn;
    outW = Math.round((srcW / srcH) * outH);
  }

  // Draw to output canvas
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmpOrCanvas, 0, 0, srcW, srcH, 0, 0, outW, outH);

  // Apply compression if enabled
  let blob;
  if (DOM.autoCompress.checked && targetMime !== "image/png") {
    const maxKB = Number(DOM.maxSize.value) || 500;
    const result = await compressImage(state.currentBytes, targetMime, maxKB);
    blob = result.blob;
    DOM.compressionInfo.textContent = `Compressed to ${(blob.size / 1024).toFixed(2)}KB (quality: ${result.quality})`;
  } else {
    blob = await new Promise((res) => canvas.toBlob(res, targetMime, q));
  }

  if (!blob) throw new Error("Conversion failed (canvas.toBlob returned null).");

  // Download file
  const ext = targetMime === "image/png" ? "png" : targetMime === "image/jpeg" ? "jpg" : "webp";
  const baseName = (state.currentName || "image").replace(/\.[^.]+$/, "");
  downloadBlob(blob, `${baseName}.${ext}`);

  // Cleanup
  if (bmpOrCanvas && bmpOrCanvas.close) {
    try {
      bmpOrCanvas.close();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Handle convert button click
 */
DOM.convertBtn.addEventListener("click", async () => {
  if (state.isProcessing || !state.currentBytes) return;
  DOM.convertBtn.disabled = true;
  try {
    state.isProcessing = true;
    await convertAndDownload();
    showNotification("Image converted successfully!", 'success');
  } catch (err) {
    showNotification(`Conversion error: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
    if (state.currentBytes) {
      DOM.convertBtn.disabled = false;
    }
  }
});

/**
 * Handle apply resize button click
 */
DOM.applyResizeBtn.addEventListener("click", async () => {
  if (state.isProcessing || !state.currentBytes) return;
  DOM.applyResizeBtn.disabled = true;
  try {
    if (!state.currentBytes) throw new Error("No file loaded");

    const targetMime = "image/png";
    const bmpOrCanvas = await bytesToImageBitmap(state.currentBytes);

    const srcW = bmpOrCanvas.width;
    const srcH = bmpOrCanvas.height;

    const wIn = DOM.resizeW.value ? Number(DOM.resizeW.value) : null;
    const hIn = DOM.resizeH.value ? Number(DOM.resizeH.value) : null;
    if (!wIn && !hIn) throw new Error("Enter width or height to resize.");

    // Calculate output dimensions
    let outW = srcW, outH = srcH;
    if (wIn && hIn) {
      outW = wIn;
      outH = hIn;
    } else if (wIn && !hIn) {
      outW = wIn;
      outH = Math.round((srcH / srcW) * outW);
    } else if (!wIn && hIn) {
      outH = hIn;
      outW = Math.round((srcW / srcH) * outH);
    }

    // Draw to canvas
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmpOrCanvas, 0, 0, srcW, srcH, 0, 0, outW, outH);

    const blob = await new Promise((res) => canvas.toBlob(res, targetMime, 0.92));
    if (!blob) throw new Error("Resize failed.");

    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);

    // Update file state with resized image
    const resizedName = (state.currentName || "image").replace(/\.[^.]+$/, "") + "_resized.png";
    setFileState({ name: resizedName, type: targetMime }, bytes);

    if (bmpOrCanvas && bmpOrCanvas.close) {
      try {
        bmpOrCanvas.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    showNotification("Image resized successfully!", 'success');
  } catch (err) {
    showNotification(`Resize error: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
    if (state.currentBytes) {
      DOM.applyResizeBtn.disabled = false;
    }
  }
});

// ============================================================================
// EVENT LISTENERS - ENCRYPT
// ============================================================================

/**
 * Handle encrypt button - uses AES/DES with CryptoJS
 * Supports both OpenSSL format (with salt) and raw hex ciphertext
 */
DOM.encryptBtn.addEventListener("click", async () => {
  if (state.isProcessing) {
    showNotification("Processing... please wait", 'warning');
    return;
  }

  if (!state.currentBytes) {
    showNotification("Please select an image first", 'warning');
    return;
  }

  const pass = DOM.encPass.value.trim();
  if (!pass) {
    showNotification("Please enter a passphrase", 'warning');
    return;
  }

  try {
    state.isProcessing = true;
    ensureCryptoReady();
    
    const wordArray = bytesToWordArray(state.currentBytes);
    
    // Encrypt using selected algorithm
    const cipher = DOM.encAlg.value === "AES"
      ? CryptoJS.AES.encrypt(wordArray, pass)
      : CryptoJS.DES.encrypt(wordArray, pass);
    
    // Format output based on selection
    const outFmt = DOM.encOutFmt.value;
    DOM.encOut.value = outFmt === "hex"
      ? cipher.ciphertext.toString(CryptoJS.enc.Hex)
      : cipher.toString();
    
    DOM.copyEncBtn.disabled = false;
    DOM.downloadEncBtn.disabled = false;
    
    showNotification(`${DOM.encAlg.value} encryption successful!`, 'success', 2000);
  } catch (err) {
    showNotification(`Encryption failed: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
  }
});

/**
 * Handle copy encrypt output button
 */
DOM.copyEncBtn.addEventListener("click", () => {
  const text = DOM.encOut.value.trim();
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    DOM.copyEncBtn.textContent = "✓ Copied!";
    setTimeout(() => DOM.copyEncBtn.textContent = "Copy ciphertext", 1200);
    showNotification("Ciphertext copied!", 'success', 1500);
  }).catch(() => {
    showNotification("Copy failed", 'error');
  });
});

/**
 * Handle download encrypt output button
 */
DOM.downloadEncBtn.addEventListener("click", () => {
  const text = DOM.encOut.value.trim();
  if (!text) return;

  try {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const baseName = (state.currentName || "image").replace(/\.[^.]+$/, "");
    downloadBlob(blob, `${baseName}_${DOM.encAlg.value}_ciphertext.txt`);
    showNotification("Downloaded ciphertext!", 'success', 2000);
  } catch (err) {
    showNotification(`Download failed: ${err.message}`, 'error');
  }
});

// ============================================================================
// EVENT LISTENERS - DECRYPT
// ============================================================================

/**
 * Set decrypted image preview in UI
 * Handles both image and non-image data
 * @param {Uint8Array} bytes
 */
function setDecryptedPreview(bytes) {
  // Cleanup previous URL
  if (state.decryptedObjectURL) {
    URL.revokeObjectURL(state.decryptedObjectURL);
  }

  state.decryptedMime = guessMime(bytes);
  state.decryptedBytes = bytes;

  const blob = new Blob([bytes], { type: state.decryptedMime });
  state.decryptedObjectURL = URL.createObjectURL(blob);

  // Display preview if it's an image
  if (state.decryptedMime.startsWith("image/")) {
    DOM.decPreviewImg.src = state.decryptedObjectURL;
    DOM.decPreviewPlaceholder.style.display = "none";
  } else {
    DOM.decPreviewImg.removeAttribute("src");
    DOM.decPreviewPlaceholder.style.display = "grid";
    DOM.decPreviewPlaceholder.textContent = "Decrypted data is not a supported image format (still downloadable)";
  }

  DOM.downloadDecBtn.disabled = false;
  DOM.useAsCurrentBtn.disabled = !state.decryptedMime.startsWith("image/");
}

/**
 * Handle decrypt button - supports AES/DES with multiple formats
 * Supports OpenSSL format (with salt) and raw hex ciphertext
 */
DOM.decryptBtn.addEventListener("click", async () => {
  if (state.isProcessing) {
    showNotification("Processing... please wait", 'warning');
    return;
  }

  const pass = DOM.decPass.value.trim();
  if (!pass) {
    showNotification("Please enter a passphrase", 'warning');
    return;
  }

  const input = DOM.decIn.value.trim();
  if (!input) {
    showNotification("Please paste ciphertext", 'warning');
    return;
  }

  try {
    state.isProcessing = true;
    ensureCryptoReady();
    
    const fmt = DOM.decInFmt.value;
    const alg = DOM.decAlg.value;
    let decryptedWA;

    if (fmt === "hex") {
      // For hex ciphertext (no salt header, raw bytes only)
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(input.replace(/\s+/g, ""))
      });
      
      decryptedWA = alg === "AES"
        ? CryptoJS.AES.decrypt(cipherParams, pass)
        : CryptoJS.DES.decrypt(cipherParams, pass);
      
      DOM.decMeta.textContent = "Decrypted from hex ciphertext (no salt header)";
    } else {
      // For OpenSSL format (includes salt and parameters)
      decryptedWA = alg === "AES"
        ? CryptoJS.AES.decrypt(input, pass)
        : CryptoJS.DES.decrypt(input, pass);
      
      DOM.decMeta.textContent = "Decrypted from Base64/OpenSSL formatted string";
    }

    // Convert WordArray to bytes
    const bytes = wordArrayToBytes(decryptedWA);
    if (!bytes || bytes.length === 0) {
      throw new Error("Decryption produced empty output. Verify algorithm, passphrase, and ciphertext format.");
    }

    setDecryptedPreview(bytes);
    showNotification(`${alg} decryption successful!`, 'success', 2000);
  } catch (err) {
    showNotification(`Decryption failed: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
  }
});

/**
 * Handle download decrypted file button
 */
DOM.downloadDecBtn.addEventListener("click", () => {
  if (!state.decryptedBytes) return;

  try {
    // Map MIME type to file extension
    const ext = 
      state.decryptedMime === "image/png" ? "png" :
      state.decryptedMime === "image/jpeg" ? "jpg" :
      state.decryptedMime === "image/webp" ? "webp" :
      state.decryptedMime === "image/gif" ? "gif" :
      state.decryptedMime === "image/bmp" ? "bmp" :
      state.decryptedMime === "image/svg+xml" ? "svg" : "bin";
    
    const blob = new Blob([state.decryptedBytes], { type: state.decryptedMime });
    downloadBlob(blob, `decrypted.${ext}`);
    showNotification("Downloaded decrypted file!", 'success', 2000);
  } catch (err) {
    showNotification(`Download failed: ${err.message}`, 'error');
  }
});

/**
 * Handle "use as current" button - loads decrypted image into current state
 */
DOM.useAsCurrentBtn.addEventListener("click", () => {
  if (!state.decryptedBytes) return;

  try {
    // Determine file extension from MIME type
    const ext =
      state.decryptedMime === "image/png" ? "png" :
      state.decryptedMime === "image/jpeg" ? "jpg" :
      state.decryptedMime === "image/webp" ? "webp" :
      state.decryptedMime === "image/gif" ? "gif" :
      state.decryptedMime === "image/bmp" ? "bmp" :
      state.decryptedMime === "image/svg+xml" ? "svg" : "bin";
    
    // Create pseudo-file object for decrypted data
    const fakeFile = { name: `decrypted.${ext}`, type: state.decryptedMime };
    setFileState(fakeFile, state.decryptedBytes);
    showNotification("Decrypted image set as current!", 'success', 2000);
  } catch (err) {
    showNotification(`Failed to set current file: ${err.message}`, 'error');
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

// Set initial quality label value
DOM.qualityLabel.textContent = Number(DOM.outQuality.value).toFixed(2);

// Initialize state
clearState();

