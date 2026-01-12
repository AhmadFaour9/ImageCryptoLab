/**
 * ImageCryptoLab - Enhanced Image Processing & Encryption Tool
 * Simplified and Fixed Version
 * @version 2.1
 */

const MAX_FILE_SIZE = 100 * 1024 * 1024;

// DOM Cache
const DOM = {
  fileInput: document.getElementById("fileInput"),
  fileMeta: document.getElementById("fileMeta"),
  previewImg: document.getElementById("previewImg"),
  previewPlaceholder: document.getElementById("previewPlaceholder"),
  clearBtn: document.getElementById("clearBtn"),
  downloadOriginalBtn: document.getElementById("downloadOriginalBtn"),
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
  makeBase64Btn: document.getElementById("makeBase64Btn"),
  makeHexBtn: document.getElementById("makeHexBtn"),
  copyEncodeBtn: document.getElementById("copyEncodeBtn"),
  downloadEncodeBtn: document.getElementById("downloadEncodeBtn"),
  encodeOut: document.getElementById("encodeOut"),
  encodeMeta: document.getElementById("encodeMeta"),
  encAlg: document.getElementById("encAlg"),
  encPass: document.getElementById("encPass"),
  encOutFmt: document.getElementById("encOutFmt"),
  encryptBtn: document.getElementById("encryptBtn"),
  encOut: document.getElementById("encOut"),
  copyEncBtn: document.getElementById("copyEncBtn"),
  downloadEncBtn: document.getElementById("downloadEncBtn"),
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

// State
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

function bytesToBase64(bytes) {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function base64ToBytes(b64) {
  const clean = b64.trim().replace(/^data:.*?;base64,/, "").replace(/\s+/g, "");
  const binary = atob(clean);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function guessMime(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return "image/jpeg";
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return "image/gif";
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  return "application/octet-stream";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'assertive');
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

function setFileState(file, bytes) {
  try {
    if (bytes.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 100MB limit.`);
    }
    
    state.currentFile = file;
    state.currentBytes = bytes;
    state.currentMime = file.type || guessMime(bytes);
    state.currentName = file.name || 'image';
    
    setPreviewFromBytes(bytes);
    DOM.fileMeta.textContent = `${state.currentName} (${(bytes.length / 1024).toFixed(2)}KB)`;
    
    // Enable all buttons
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

function bytesToWordArray(bytes) {
  const words = [];
  for (let i = 0; i < bytes.length; i += 4) {
    words.push(
      ((bytes[i] || 0) << 24) |
      ((bytes[i + 1] || 0) << 16) |
      ((bytes[i + 2] || 0) << 8) |
      (bytes[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

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

DOM.clearBtn.addEventListener("click", () => {
  DOM.fileInput.value = "";
  clearState();
  showNotification("Cleared", 'success', 1500);
});

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

function enableEncodeOutputs() {
  DOM.copyEncodeBtn.disabled = !DOM.encodeOut.value.trim();
  DOM.downloadEncodeBtn.disabled = !DOM.encodeOut.value.trim();
}

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

DOM.copyEncodeBtn.addEventListener("click", () => {
  const text = DOM.encodeOut.value.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showNotification("Copied to clipboard", 'success', 1500);
  }).catch(() => {
    showNotification("Copy failed", 'error');
  });
});

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

DOM.outQuality.addEventListener("input", () => {
  DOM.qualityLabel.textContent = Number(DOM.outQuality.value).toFixed(2);
});

async function convertAndDownload() {
  if (!state.currentBytes) return;
  
  const targetMime = DOM.outFormat.value;
  const q = Number(DOM.outQuality.value);
  const wIn = DOM.resizeW.value ? Number(DOM.resizeW.value) : null;
  const hIn = DOM.resizeH.value ? Number(DOM.resizeH.value) : null;

  try {
    // Load image
    const blob = new Blob([state.currentBytes], { type: state.currentMime });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error("Failed to load image"));
      img.src = url;
    });

    // Calculate dimensions
    let outW = img.naturalWidth;
    let outH = img.naturalHeight;
    
    if (wIn && hIn) {
      outW = wIn;
      outH = hIn;
    } else if (wIn && !hIn) {
      outH = Math.round((img.naturalHeight / img.naturalWidth) * wIn);
      outW = wIn;
    } else if (!wIn && hIn) {
      outW = Math.round((img.naturalWidth / img.naturalHeight) * hIn);
      outH = hIn;
    }

    // Draw to canvas
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, outW, outH);

    // Convert to blob
    const outputBlob = await new Promise((res, rej) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) rej(new Error("Conversion failed"));
          else res(blob);
        },
        targetMime,
        q
      );
    });

    // Download
    const ext = targetMime === "image/png" ? "png" : targetMime === "image/jpeg" ? "jpg" : "webp";
    const baseName = (state.currentName || "image").replace(/\.[^.]+$/, "");
    downloadBlob(outputBlob, `${baseName}.${ext}`);
    
    URL.revokeObjectURL(url);
  } catch (err) {
    throw err;
  }
}

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

DOM.applyResizeBtn.addEventListener("click", async () => {
  if (state.isProcessing || !state.currentBytes) return;
  DOM.applyResizeBtn.disabled = true;
  
  try {
    state.isProcessing = true;
    const wIn = DOM.resizeW.value ? Number(DOM.resizeW.value) : null;
    const hIn = DOM.resizeH.value ? Number(DOM.resizeH.value) : null;
    
    if (!wIn && !hIn) throw new Error("Enter width or height to resize.");

    const blob = new Blob([state.currentBytes], { type: state.currentMime });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error("Failed to load image"));
      img.src = url;
    });

    // Calculate dimensions
    let outW = img.naturalWidth;
    let outH = img.naturalHeight;
    
    if (wIn && hIn) {
      outW = wIn;
      outH = hIn;
    } else if (wIn && !hIn) {
      outH = Math.round((img.naturalHeight / img.naturalWidth) * wIn);
      outW = wIn;
    } else if (!wIn && hIn) {
      outW = Math.round((img.naturalWidth / img.naturalHeight) * hIn);
      outH = hIn;
    }

    // Draw to canvas
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, outW, outH);

    const resizedBlob = await new Promise((res, rej) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) rej(new Error("Resize failed"));
          else res(blob);
        },
        "image/png",
        0.92
      );
    });

    const buf = await resizedBlob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const resizedName = (state.currentName || "image").replace(/\.[^.]+$/, "") + "_resized.png";
    
    setFileState({ name: resizedName, type: "image/png" }, bytes);
    URL.revokeObjectURL(url);
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
    if (typeof CryptoJS === 'undefined') {
      throw new Error('CryptoJS library not loaded');
    }
    
    const wordArray = bytesToWordArray(state.currentBytes);
    
    const cipher = DOM.encAlg.value === "AES"
      ? CryptoJS.AES.encrypt(wordArray, pass)
      : CryptoJS.DES.encrypt(wordArray, pass);
    
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

DOM.copyEncBtn.addEventListener("click", () => {
  const text = DOM.encOut.value.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showNotification("Copied to clipboard", 'success', 1500);
  }).catch(() => {
    showNotification("Copy failed", 'error');
  });
});

DOM.downloadEncBtn.addEventListener("click", () => {
  const text = DOM.encOut.value.trim();
  if (!text) return;
  try {
    const blob = new Blob([text], { type: "text/plain" });
    downloadBlob(blob, `encrypted-${Date.now()}.txt`);
    showNotification("Downloaded ciphertext", 'success', 2000);
  } catch (err) {
    showNotification(`Download failed: ${err.message}`, 'error');
  }
});

// ============================================================================
// EVENT LISTENERS - DECRYPT
// ============================================================================

DOM.decryptBtn.addEventListener("click", async () => {
  if (state.isProcessing) return;
  
  const ciphertext = DOM.decIn.value.trim();
  if (!ciphertext) {
    showNotification("Please paste ciphertext", 'warning');
    return;
  }

  const pass = DOM.decPass.value.trim();
  if (!pass) {
    showNotification("Please enter a passphrase", 'warning');
    return;
  }

  try {
    state.isProcessing = true;
    if (typeof CryptoJS === 'undefined') {
      throw new Error('CryptoJS library not loaded');
    }
    
    const decrypted = DOM.decAlg.value === "AES"
      ? CryptoJS.AES.decrypt(ciphertext, pass)
      : CryptoJS.DES.decrypt(ciphertext, pass);
    
    state.decryptedBytes = wordArrayToBytes(decrypted);
    
    if (state.decryptedBytes.length === 0) {
      throw new Error('Decryption failed - check passphrase and format');
    }
    
    setPreviewFromBytes(state.decryptedBytes);
    
    DOM.downloadDecBtn.disabled = false;
    DOM.useAsCurrentBtn.disabled = false;
    
    showNotification("Decryption successful!", 'success', 2000);
  } catch (err) {
    showNotification(`Decryption failed: ${err.message}`, 'error');
  } finally {
    state.isProcessing = false;
  }
});

DOM.downloadDecBtn.addEventListener("click", () => {
  if (!state.decryptedBytes) return;
  try {
    const mime = guessMime(state.decryptedBytes);
    downloadBlob(
      new Blob([state.decryptedBytes], { type: mime }),
      `decrypted-${Date.now()}`
    );
    showNotification("Downloaded decrypted data", 'success', 2000);
  } catch (err) {
    showNotification(`Download failed: ${err.message}`, 'error');
  }
});

DOM.useAsCurrentBtn.addEventListener("click", () => {
  if (!state.decryptedBytes) return;
  try {
    const mime = guessMime(state.decryptedBytes);
    setFileState({ name: "decrypted-file", type: mime }, state.decryptedBytes);
    showNotification("Decrypted data set as current", 'success', 2000);
  } catch (err) {
    showNotification(`Error: ${err.message}`, 'error');
  }
});
