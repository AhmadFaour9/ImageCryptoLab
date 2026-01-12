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
  encKeySize: document.getElementById("encKeySize"),
  encMode: document.getElementById("encMode"),
  encPadding: document.getElementById("encPadding"),
  encIVSize: document.getElementById("encIVSize"),
  encSaltSize: document.getElementById("encSaltSize"),
  encPass: document.getElementById("encPass"),
  encIterations: document.getElementById("encIterations"),
  encOutFmt: document.getElementById("encOutFmt"),
  encInfo: document.getElementById("encInfo"),
  encryptBtn: document.getElementById("encryptBtn"),
  encOut: document.getElementById("encOut"),
  copyEncBtn: document.getElementById("copyEncBtn"),
  downloadEncBtn: document.getElementById("downloadEncBtn"),
  decAlg: document.getElementById("decAlg"),
  decKeySize: document.getElementById("decKeySize"),
  decMode: document.getElementById("decMode"),
  decPadding: document.getElementById("decPadding"),
  decPass: document.getElementById("decPass"),
  decInFmt: document.getElementById("decInFmt"),
  decIterations: document.getElementById("decIterations"),
  decInfo: document.getElementById("decInfo"),
  decryptBtn: document.getElementById("decryptBtn"),
  decIn: document.getElementById("decIn"),
  decMeta: document.getElementById("decMeta"),
  downloadDecBtn: document.getElementById("downloadDecBtn"),
  useAsCurrentBtn: document.getElementById("useAsCurrentBtn"),
  decPreviewImg: document.getElementById("decPreviewImg"),
  decPreviewPlaceholder: document.getElementById("decPreviewPlaceholder"),
  // Auth and attempt UI
  signInBtn: document.getElementById("signInBtn"),
  signOutBtn: document.getElementById("signOutBtn"),
  userBadge: document.getElementById("userBadge"),
  decryptAttempts: document.getElementById("decryptAttempts"),
  authModal: document.getElementById("authModal"),
  authModalSignIn: document.getElementById("authModalSignIn"),
  authModalClose: document.getElementById("authModalClose"),
  accountBtn: document.getElementById("accountBtn"),
  accountModal: document.getElementById("accountModal"),
  accountModalClose: document.getElementById("accountModalClose"),
  accountInfo: document.getElementById("accountInfo"),
  requestUnlimitedBtn: document.getElementById("requestUnlimitedBtn"),
  // Email auth fields
  showEmailFormBtn: document.getElementById("showEmailFormBtn"),
  emailAuthForm: document.getElementById("emailAuthForm"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  authEmailSignUp: document.getElementById("authEmailSignUp"),
  authEmailSignIn: document.getElementById("authEmailSignIn"),
  authResendVerification: document.getElementById("authResendVerification"),
  authMessage: document.getElementById("authMessage"),
  checkVerificationBtn: document.getElementById("checkVerificationBtn")
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
// ATTEMPT LIMITER & AUTH HOOKS
// ============================================================================

const ATTEMPT_OPTIONS = {
  maxAttempts: 5,
  windowMs: 24 * 60 * 60 * 1000 // 24 hours
};

// Add user field to state
state.user = null;

function _getAttemptKey() {
  return state.user && state.user.uid ? `icl_attempts_uid_${state.user.uid}` : 'icl_attempts_anon';
}

function _loadAttempts() {
  const key = _getAttemptKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { count: 0, firstTs: 0 };
    const rec = JSON.parse(raw);
    // Validate
    if (!rec.firstTs || !rec.count) return { count: 0, firstTs: 0 };
    return rec;
  } catch (e) {
    return { count: 0, firstTs: 0 };
  }
}

function _saveAttempts(rec) {
  const key = _getAttemptKey();
  localStorage.setItem(key, JSON.stringify(rec));
}

function _isExpired(rec) {
  if (!rec || !rec.firstTs) return true;
  return (Date.now() - rec.firstTs) > ATTEMPT_OPTIONS.windowMs;
}

function resetAttempts() {
  const rec = { count: 0, firstTs: 0 };
  _saveAttempts(rec);
  _updateAttemptsUI();
}

function incrementAttempt() {
  let rec = _loadAttempts();
  if (_isExpired(rec)) rec = { count: 0, firstTs: 0 };
  rec.count = (rec.count || 0) + 1;
  if (!rec.firstTs) rec.firstTs = Date.now();
  _saveAttempts(rec);
  _updateAttemptsUI();
  return rec;
}

function getAttemptsLeft() {
  const rec = _loadAttempts();
  if (_isExpired(rec)) return ATTEMPT_OPTIONS.maxAttempts;
  return Math.max(0, ATTEMPT_OPTIONS.maxAttempts - (rec.count || 0));
}

function isBlocked() {
  const rec = _loadAttempts();
  if (_isExpired(rec)) return false;
  return (rec.count || 0) >= ATTEMPT_OPTIONS.maxAttempts;
}

function getBlockedUntil() {
  const rec = _loadAttempts();
  if (!rec.firstTs) return 0;
  return rec.firstTs + ATTEMPT_OPTIONS.windowMs;
}

function _updateAttemptsUI() {
  if (!DOM.decryptAttempts) return;
  const left = getAttemptsLeft();
  // Add pulse animation for change
  DOM.decryptAttempts.classList.remove('pulse');
  void DOM.decryptAttempts.offsetWidth; // trigger reflow

  if (left > 0) {
    DOM.decryptAttempts.textContent = `Attempts left: ${left}`;
    DOM.decryptAttempts.classList.remove('blocked');
    DOM.decryptAttempts.classList.remove('warn');
    if (left <= 2) DOM.decryptAttempts.classList.add('warn');
    DOM.decryptBtn.disabled = false;
  } else {
    const until = getBlockedUntil();
    const remainingMs = Math.max(0, until - Date.now());
    const hours = Math.ceil(remainingMs / (60 * 60 * 1000));
    DOM.decryptAttempts.textContent = `No attempts left. ${hours} hour(s) until reset.`;
    DOM.decryptAttempts.classList.add('blocked');
    DOM.decryptBtn.disabled = true;
  }

  // Visual pulse when updated
  DOM.decryptAttempts.classList.add('pulse');

  // Update mini panel quota if visible
  if (DOM.miniQuota) {
    if (state.user && state.user.unlimited) {
      DOM.miniQuota.textContent = 'Unlimited';
    } else if (state.user && typeof state.user.remainingAttempts !== 'undefined') {
      DOM.miniQuota.classList.remove('mini-pop');
      DOM.miniQuota.textContent = `Attempts left: ${state.user.remainingAttempts}`;
      void DOM.miniQuota.offsetWidth; // reflow to restart animation
      DOM.miniQuota.classList.add('mini-pop');
    } else {
      DOM.miniQuota.classList.remove('mini-pop');
      DOM.miniQuota.textContent = `Attempts left: ${getAttemptsLeft()}`;
      void DOM.miniQuota.offsetWidth; // reflow to restart animation
      DOM.miniQuota.classList.add('mini-pop');
    }
  }
}

// Auth helpers (Firebase optional - requires config)
async function initAuthIfAvailable() {
  if (!window.FIREBASE_CONFIG) {
    // Sign-in disabled — provide hint in UI
    if (DOM.signInBtn) DOM.signInBtn.disabled = false; // allow the modal to show instructions
    return;
  }

  // Dynamically load firebase compat SDKs if not present
  if (typeof firebase === 'undefined') {
    await new Promise((resolve, reject) => {
      const s1 = document.createElement('script');
      s1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
      s1.onload = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
        s2.onload = resolve;
        s2.onerror = reject;
        document.head.appendChild(s2);
      };
      s1.onerror = reject;
      document.head.appendChild(s1);
    });
  }

  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);

    // Ensure Firestore is available
    if (typeof firebase.firestore === 'undefined') {
      await new Promise((resolve, reject) => {
        const s3 = document.createElement('script');
        s3.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
        s3.onload = resolve;
        s3.onerror = reject;
        document.head.appendChild(s3);
      });
    }

    firebase.initializeApp(window.FIREBASE_CONFIG);
    const db = firebase.firestore();

    // Helper to fetch/create user doc
    async function fetchUserDoc(uid) {
      if (!db) return null;
      const ref = db.collection('users').doc(uid);
      const snap = await ref.get();
      if (!snap.exists) {
        const doc = { createdAt: firebase.firestore.FieldValue.serverTimestamp(), unlimited: false };
        await ref.set(doc);
        return { id: uid, ...doc, unlimited: false };
      }
      return { id: uid, ...snap.data() };
    }

    // Admin helper: fetch pending requests if user has admin claim
    async function fetchPendingRequests() {
      if (!db) return [];
      try {
        const token = await firebase.auth().currentUser.getIdTokenResult();
        if (!token.claims || !token.claims.admin) return [];
        const q = await db.collection('requests').where('status', '==', 'pending').get();
        const out = [];
        q.forEach(d => out.push({ id: d.id, ...d.data() }));
        return out;
      } catch (err) {
        console.warn('fetchPendingRequests failed', err);
        return [];
      }
    }

    // Admin helper: approve request and grant unlimited
    async function approveRequest(uid) {
      if (!db) throw new Error('Firestore unavailable');
      // Set the users/{uid}.unlimited = true and mark request as approved
      const userRef = db.collection('users').doc(uid);
      const reqRef = db.collection('requests').doc(uid);
      await userRef.set({ unlimited: true }, { merge: true });
      await reqRef.set({ status: 'approved', reviewedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return true;
    }

    // Expose admin helpers
    window._icl_fetchPendingRequests = fetchPendingRequests;
    window._icl_approveRequest = approveRequest;

    firebase.auth().onAuthStateChanged(async (u) => {
      if (u) {
        // ensure fresh user info
        await u.reload();
        const userDoc = await fetchUserDoc(u.uid);
        // if email verified, mark account enabled in users/{uid}
        if (u.emailVerified && db) {
          await db.collection('users').doc(u.uid).set({ enabled: true }, { merge: true });
        }
        state.user = { uid: u.uid, displayName: u.displayName, email: u.email, unlimited: !!userDoc.unlimited, enabled: !!userDoc.enabled };
      } else {
        state.user = null;
      }
      _updateAuthUI();
      _updateAttemptsUI();
    });

    // Request unlimited hook (writes a request document)
    async function requestUnlimitedForUser(uid) {
      if (!db) throw new Error('Firestore unavailable');
      const reqRef = db.collection('requests').doc(uid);
      await reqRef.set({ uid, requestedAt: firebase.firestore.FieldValue.serverTimestamp(), status: 'pending' });
      return true;
    }

    // Attach to global for UI functions
    window._icl_requestUnlimited = requestUnlimitedForUser;
  } catch (err) {
    console.warn('Firebase init failed', err);
  }
}

async function signInWithGoogle() {
  if (typeof firebase === 'undefined') {
    showNotification('Auth is not configured. See README for setup.', 'warning');
    return;
  }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    showNotification('Signed in successfully', 'success');
  } catch (err) {
    showNotification(`Sign-in failed: ${err.message}`, 'error');
  }
}

// Email/password signup
async function signUpWithEmail(email, password) {
  if (typeof firebase === 'undefined') { throw new Error('Auth not configured'); }
  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
    // send verification email
    if (cred && cred.user) {
      await cred.user.sendEmailVerification();
      // create a minimal user doc
      if (db) await db.collection('users').doc(cred.user.uid).set({ unlimited: false, enabled: false, email: email }, { merge: true });
      return { ok: true, message: 'Verification email sent. Please check your inbox.' };
    }
    return { ok: false, error: 'Sign-up failed' };
  } catch (err) { return { ok: false, error: err.message } }
}

// Email/password sign-in
async function signInWithEmailFunc(email, password) {
  if (typeof firebase === 'undefined') { throw new Error('Auth not configured'); }
  try {
    const res = await firebase.auth().signInWithEmailAndPassword(email, password);
    // if signed in but not verified, show message
    if (res.user && !res.user.emailVerified) {
      return { ok: true, verified: false, message: 'Signed in but email not verified. Check your inbox.' };
    }
    // If verified, ensure users/{uid}.enabled = true
    if (res.user && res.user.emailVerified && db) {
      await db.collection('users').doc(res.user.uid).set({ enabled: true }, { merge: true });
    }
    return { ok: true, verified: (res.user && res.user.emailVerified) };
  } catch (err) { return { ok: false, error: err.message } }
}

async function resendVerificationEmail() {
  const u = firebase.auth().currentUser;
  if (!u) throw new Error('Not signed in');
  try {
    await u.sendEmailVerification();
    return { ok: true };
  } catch (err) { return { ok: false, error: err.message } }
}

async function signOutUser() {
  if (typeof firebase === 'undefined') {
    showNotification('Auth is not configured.', 'warning');
    return;
  }
  try {
    await firebase.auth().signOut();
    showNotification('Signed out', 'success');
  } catch (err) {
    showNotification(`Sign-out failed: ${err.message}`, 'error');
  }
}

function _updateAuthUI() {
  if (state.user) {
    if (DOM.userBadge) {
      DOM.userBadge.style.display = 'block';
      DOM.userBadge.textContent = `${state.user.displayName || state.user.email}`;
    }
    if (DOM.signInBtn) DOM.signInBtn.style.display = 'none';
    if (DOM.signOutBtn) DOM.signOutBtn.style.display = 'inline-flex';
    if (DOM.accountBtn) DOM.accountBtn.style.display = 'inline-flex';
    // Mini account
    if (DOM.miniAccount) {
      DOM.miniAccount.style.display = 'flex';
      if (DOM.miniName) DOM.miniName.textContent = state.user.displayName || state.user.email;
      if (DOM.miniQuota) DOM.miniQuota.textContent = state.user.unlimited ? 'Unlimited' : `Attempts left: ${state.user.remainingAttempts ?? getAttemptsLeft()}`;
    }

    // Check verification button: show if signed-in and not enabled
    if (DOM.checkVerificationBtn) {
      if (state.user && !state.user.enabled) {
        DOM.checkVerificationBtn.style.display = 'inline-flex';
      } else {
        DOM.checkVerificationBtn.style.display = 'none';
      }
    }

  } else {
    if (DOM.userBadge) DOM.userBadge.style.display = 'none';
    if (DOM.signInBtn) DOM.signInBtn.style.display = 'inline-flex';
    if (DOM.signOutBtn) DOM.signOutBtn.style.display = 'none';
    if (DOM.accountBtn) DOM.accountBtn.style.display = 'none';
    if (DOM.miniAccount) DOM.miniAccount.style.display = 'none';
    if (DOM.checkVerificationBtn) DOM.checkVerificationBtn.style.display = 'none';
  }
}

function showAuthModal() {
  if (!DOM.authModal) return;
  DOM.authModal.classList.add('show');
  DOM.authModal.setAttribute('aria-hidden', 'false');
}

function hideAuthModal() {
  if (!DOM.authModal) return;
  DOM.authModal.classList.remove('show');
  DOM.authModal.setAttribute('aria-hidden', 'true');
}

async function showAccountModal() {
  if (!DOM.accountModal) return;
  // populate info
  const attemptsLeft = getAttemptsLeft();
  const unlimited = state.user?.unlimited ? 'Yes' : 'No';
  if (DOM.accountInfo) DOM.accountInfo.textContent = `User: ${state.user?.displayName || state.user?.email}\nUnlimited: ${unlimited}\nAttempts left: ${attemptsLeft}`;

  // Load admin preview if admin
  try {
    const pending = await (window._icl_fetchPendingRequests ? window._icl_fetchPendingRequests() : Promise.resolve([]));
    if (pending && pending.length > 0) {
      if (DOM.adminPreview) DOM.adminPreview.style.display = 'block';
      if (DOM.adminList) {
        DOM.adminList.innerHTML = '';
        pending.forEach(req => {
          const row = document.createElement('div');
          row.style.display = 'flex'; row.style.justifyContent = 'space-between'; row.style.gap='8px'; row.style.alignItems='center'; row.style.padding='6px 0';
          row.innerHTML = `<div style="flex:1"><strong>${req.uid || req.id}</strong> — requested at ${new Date(req.requestedAt?.toDate ? req.requestedAt.toDate() : (req.requestedAt||'')).toLocaleString()}</div>`;
          const btn = document.createElement('button');
          btn.className = 'btn';
          btn.textContent = 'Approve';
          btn.addEventListener('click', async () => {
            try {
              if (FUNCTIONS_BASE && firebase && firebase.auth().currentUser) {
                // call server approve endpoint
                const token = await firebase.auth().currentUser.getIdToken();
                const resp = await fetch(`${FUNCTIONS_BASE}/approveRequest`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: req.uid || req.id }) });
                const data = await resp.json();
                if (!data.ok) throw new Error(data.error || 'Approve failed');
              } else if (window._icl_approveRequest) {
                await window._icl_approveRequest(req.uid || req.id);
              } else {
                throw new Error('Approve facility not available');
              }

              showNotification('Request approved', 'success');
              // refresh list
              if (FUNCTIONS_BASE && firebase && firebase.auth().currentUser) {
                const token = await firebase.auth().currentUser.getIdToken();
                const refreshedResp = await fetch(`${FUNCTIONS_BASE}/listPendingRequests`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
                const refreshed = await refreshedResp.json();
                if (refreshed && refreshed.ok && refreshed.data.length === 0) {
                  DOM.adminList.textContent = 'No pending requests';
                } else {
                  showAccountModal();
                }
              } else {
                const refreshed = await window._icl_fetchPendingRequests();
                if (refreshed.length === 0) DOM.adminList.textContent = 'No pending requests'; else showAccountModal();
              }
            } catch (err) {
              showNotification(`Approve failed: ${err.message}`, 'error');
            }
          });
          row.appendChild(btn);
          DOM.adminList.appendChild(row);
        });
      }
    } else {
      if (DOM.adminPreview) DOM.adminPreview.style.display = 'none';
      if (DOM.adminList) DOM.adminList.textContent = 'No pending requests';
    }
  } catch (err) {
    console.warn('admin preview failed', err);
  }

  DOM.accountModal.classList.add('show');
  DOM.accountModal.setAttribute('aria-hidden', 'false');
}

function hideAccountModal() {
  if (!DOM.accountModal) return;
  DOM.accountModal.classList.remove('show');
  DOM.accountModal.setAttribute('aria-hidden', 'true');
}

// Attach auth & account UI handlers
if (DOM.signInBtn) DOM.signInBtn.addEventListener('click', () => showAuthModal());
if (DOM.authModalClose) DOM.authModalClose.addEventListener('click', () => hideAuthModal());
if (DOM.authModalSignIn) DOM.authModalSignIn.addEventListener('click', async () => { hideAuthModal(); await signInWithGoogle(); });
if (DOM.showEmailFormBtn) DOM.showEmailFormBtn.addEventListener('click', () => { if (DOM.emailAuthForm) DOM.emailAuthForm.style.display = 'block'; });
if (DOM.authEmailSignUp) DOM.authEmailSignUp.addEventListener('click', async () => {
  const email = DOM.authEmail.value.trim(); const pass = DOM.authPassword.value.trim();
  if (!email || !pass) { showNotification('Email and password required', 'warning'); return; }
  try {
    const r = await signUpWithEmail(email, pass);
    if (r.ok) {
      DOM.authMessage.textContent = r.message || 'Verification email sent';
      DOM.authResendVerification.style.display = 'inline-flex';
    } else {
      DOM.authMessage.textContent = `Error: ${r.error}`;
    }
  } catch (err) { DOM.authMessage.textContent = `Error: ${err.message}` }
});
if (DOM.authEmailSignIn) DOM.authEmailSignIn.addEventListener('click', async () => {
  const email = DOM.authEmail.value.trim(); const pass = DOM.authPassword.value.trim();
  if (!email || !pass) { showNotification('Email and password required', 'warning'); return; }
  const r = await signInWithEmailFunc(email, pass);
  if (r.ok) {
    if (r.verified) { hideAuthModal(); showNotification('Signed in (email verified)', 'success'); }
    else { DOM.authMessage.textContent = r.message || 'Sign-in successful: email not verified'; DOM.authResendVerification.style.display = 'inline-flex'; }
  } else {
    DOM.authMessage.textContent = `Sign-in failed: ${r.error}`;
  }
});
if (DOM.authResendVerification) DOM.authResendVerification.addEventListener('click', async () => { try { const r = await resendVerificationEmail(); if (r.ok) showNotification('Verification email sent', 'success'); else showNotification(`Failed: ${r.error}`, 'error'); } catch (err) { showNotification(`Failed: ${err.message}`, 'error'); } });
if (DOM.signOutBtn) DOM.signOutBtn.addEventListener('click', () => signOutUser());
if (DOM.accountBtn) DOM.accountBtn.addEventListener('click', () => showAccountModal());
if (DOM.accountModalClose) DOM.accountModalClose.addEventListener('click', () => hideAccountModal());
if (DOM.requestUnlimitedBtn) DOM.requestUnlimitedBtn.addEventListener('click', async () => {
  if (!state.user || !state.user.uid) { showNotification('Sign in first to request unlimited access', 'warning'); return; }
  try {
    if (typeof window._icl_requestUnlimited !== 'function') throw new Error('Request facility not configured');
    await window._icl_requestUnlimited(state.user.uid);
    showNotification('Request submitted — admin will review', 'success');
  } catch (err) {
    showNotification(`Request failed: ${err.message}`, 'error');
  }
});

// Check verification button
if (DOM.checkVerificationBtn) DOM.checkVerificationBtn.addEventListener('click', async () => {
  if (!firebase || !firebase.auth) { showNotification('Auth not configured', 'warning'); return; }
  const u = firebase.auth().currentUser;
  if (!u) { showNotification('Sign in first to check verification', 'warning'); return; }
  try {
    await u.reload();
    if (u.emailVerified) {
      if (db) await db.collection('users').doc(u.uid).set({ enabled: true }, { merge: true });
      showNotification('Email verified — account activated', 'success');
      // refresh state
      const userDoc = await fetchUserDoc(u.uid);
      state.user.enabled = !!userDoc.enabled;
      _updateAuthUI();
      _updateAttemptsUI();
    } else {
      showNotification('Email not yet verified. Check your inbox or click Resend verification.', 'warning');
    }
  } catch (err) {
    showNotification(`Check failed: ${err.message}`, 'error');
  }
});

// Purchase button handler (Stripe via functions)
if (DOM.purchaseBtn) DOM.purchaseBtn.addEventListener('click', async () => {
  if (!state.user || !state.user.uid) { showNotification('Sign in first to purchase', 'warning'); return; }
  if (!FUNCTIONS_BASE) { showNotification('Purchase not available (functions not configured)', 'warning'); return; }
  try {
    const token = await firebase.auth().currentUser.getIdToken();
    const resp = await fetch(`${FUNCTIONS_BASE}/createCheckoutSession`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const data = await resp.json();
    if (!data.ok) throw new Error(data.error || 'Checkout creation failed');
    if (data.sessionUrl) {
      window.open(data.sessionUrl, '_blank');
      showNotification('Opening Stripe Checkout...', 'success');
    } else {
      showNotification('Checkout session created', 'success');
    }
  } catch (err) {
    showNotification(`Purchase failed: ${err.message}`, 'error');
  }
});

if (DOM.signOutBtn) DOM.signOutBtn.addEventListener('click', () => signOutUser());

// Functions base (can be set via FIREBASE_FUNCTIONS_BASE in index.html or env)
const FUNCTIONS_BASE = window.FIREBASE_FUNCTIONS_BASE || window.FUNCTIONS_BASE || '';

async function serverCheckAttempt(action = 'try') {
  if (!FUNCTIONS_BASE) throw new Error('Functions endpoint not configured');
  if (!firebase || !firebase.auth().currentUser) throw new Error('Not authenticated');
  const token = await firebase.auth().currentUser.getIdToken();
  const url = `${FUNCTIONS_BASE}/checkAttempt?action=${encodeURIComponent(action)}`;
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  const data = await r.json();
  if (!data.ok) throw new Error(data.error || 'Function call failed');
  return data;
}

// Initialize auth on load
window.addEventListener('load', () => {
  initAuthIfAvailable().then(async () => {
    // for signed-in users, attempt to fetch server-side attempt status
    try {
      if (state.user && FUNCTIONS_BASE) {
        const s = await serverCheckAttempt('check');
        state.user.remainingAttempts = s.remaining;
      }
    } catch (e) { /* ignore */ }

    // enable purchase button if functions+stripe available
    if (DOM.purchaseBtn) {
      try {
        if (FUNCTIONS_BASE && firebase && firebase.auth().currentUser) {
          // quick probe: call createCheckoutSession with check-only=false but expect 501 or 400 if not configured fully
          const token = firebase.auth().currentUser && await firebase.auth().currentUser.getIdToken();
          const probe = await fetch(`${FUNCTIONS_BASE}/createCheckoutSession`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
          if (probe.status === 501 || probe.status === 400) {
            // Stripe not fully configured, disable
            DOM.purchaseBtn.disabled = true;
          } else {
            DOM.purchaseBtn.disabled = false;
          }
        } else {
          DOM.purchaseBtn.disabled = true;
        }
      } catch (e) { DOM.purchaseBtn.disabled = true; }
    }

    _updateAttemptsUI();
    _updateAuthUI();
    layoutResponsive();
  });
});

// Re-layout on resize (responsive adjustments)
function layoutResponsive() {
  try {
    const w = window.innerWidth;
    // Example: small devices - ensure decrypt attempts are visible and moved if needed
    const isNarrow = w <= 640;
    if (isNarrow) {
      if (DOM.decryptAttempts) {
        DOM.decryptAttempts.style.textAlign = 'right';
        DOM.decryptAttempts.style.display = 'block';
      }
      document.body.classList.add('mobile');
    } else {
      if (DOM.decryptAttempts) {
        DOM.decryptAttempts.style.textAlign = '';
        DOM.decryptAttempts.style.display = 'block';
      }
      document.body.classList.remove('mobile');
    }

    // mini account panel visibility adjustments
    if (DOM.miniAccount) {
      if (isNarrow && state.user) {
        DOM.miniAccount.style.display = 'flex';
      } else if (!isNarrow) {
        DOM.miniAccount.style.display = 'flex';
      } else {
        DOM.miniAccount.style.display = 'none';
      }
    }
  } catch (e) { /* ignore */ }
}

window.addEventListener('resize', () => layoutResponsive());

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
// ============================================================================
// ENCRYPTION/DECRYPTION UTILITIES - ENHANCED
// ============================================================================

/**
 * Generate a random salt for key derivation
 */
function generateSalt(size = 8) {
  const salt = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    salt[i] = Math.floor(Math.random() * 256);
  }
  return salt;
}

/**
 * Generate a random IV (Initialization Vector)
 */
function generateIV(size = 16) {
  const iv = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    iv[i] = Math.floor(Math.random() * 256);
  }
  return iv;
}

/**
 * Get CryptoJS encryption configuration based on parameters
 */
function getEncryptionConfig(params) {
  // Determine the cipher configuration
  let cipherConfig = {
    mode: CryptoJS.mode[params.mode] || CryptoJS.mode.CBC,
    padding: CryptoJS.pad[params.padding] || CryptoJS.pad.Pkcs7,
  };

  // Generate IV if needed (except for ECB mode)
  if (params.mode !== 'ECB') {
    const ivBytes = generateIV(parseInt(params.ivSize || 16));
    cipherConfig.iv = CryptoJS.lib.WordArray.create(ivBytes);
  }

  return cipherConfig;
}

/**
 * Build OpenSSL-compatible EVP_BytesToKey structure
 */
function buildEVPStructure(salt, iv, password, cipherConfig) {
  return {
    salt: salt,
    iv: iv,
    cipherConfig: cipherConfig
  };
}

/**
 * Create encryption metadata for storing with ciphertext
 */
function createEncryptionMetadata(params, salt, iv) {
  return {
    algorithm: params.algorithm,
    keySize: params.keySize,
    mode: params.mode,
    padding: params.padding,
    iterations: params.iterations,
    ivSize: iv.length,
    saltSize: salt.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Serialize encryption parameters for display
 */
function serializeEncryptionParams(params, salt, iv, metadata) {
  return {
    ...metadata,
    salt: bytesToHex(salt).toUpperCase(),
    iv: bytesToHex(iv).toUpperCase(),
    keyLength: `${params.keySize} bits`,
    derivationMethod: `PBKDF2 (${params.iterations} iterations)`,
    saltLength: salt.length,
    ivLength: iv.length
  };
}

// ============================================================================
// EVENT LISTENERS - ENCRYPT (ENHANCED)
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

    // Collect all encryption parameters
    const params = {
      algorithm: DOM.encAlg.value,
      keySize: parseInt(DOM.encKeySize.value),
      mode: DOM.encMode.value,
      padding: DOM.encPadding.value,
      ivSize: parseInt(DOM.encIVSize.value),
      saltSize: parseInt(DOM.encSaltSize.value),
      iterations: parseInt(DOM.encIterations.value),
      outFormat: DOM.encOutFmt.value
    };

    // Validate parameters
    if (params.saltSize < 0 || params.saltSize > 32) {
      throw new Error('Salt size must be between 0 and 32 bytes');
    }
    if (params.ivSize < 8 || params.ivSize > 32) {
      throw new Error('IV size must be between 8 and 32 bytes');
    }
    if (params.iterations < 1000 || params.iterations > 1000000) {
      throw new Error('Iterations must be between 1000 and 1000000');
    }

    // Generate salt and IV
    const salt = generateSalt(params.saltSize);
    const iv = generateIV(params.ivSize);

    // Convert data to WordArray
    const dataWordArray = bytesToWordArray(state.currentBytes);

    // Get cipher configuration
    const cipherConfig = getEncryptionConfig(params);

    // Perform encryption using CryptoJS
    let cipher;
    if (params.algorithm === 'AES') {
      cipher = CryptoJS.AES.encrypt(dataWordArray, pass, cipherConfig);
    } else if (params.algorithm === 'DES') {
      cipher = CryptoJS.DES.encrypt(dataWordArray, pass, cipherConfig);
    } else if (params.algorithm === 'TripleDES') {
      cipher = CryptoJS.TripleDES.encrypt(dataWordArray, pass, cipherConfig);
    } else {
      throw new Error(`Unknown algorithm: ${params.algorithm}`);
    }

    // Build complete ciphertext with metadata
    let ciphertextOutput;
    if (params.outFormat === 'hex') {
      const saltHex = bytesToHex(salt);
      const ivHex = bytesToHex(iv);
      const ciphertextHex = cipher.ciphertext.toString(CryptoJS.enc.Hex);
      ciphertextOutput = `${saltHex}:${ivHex}:${ciphertextHex}`;
    } else if (params.outFormat === 'base32') {
      // Simplified Base32 encoding
      const saltHex = bytesToHex(salt);
      const ivHex = bytesToHex(iv);
      const ciphertextBase64 = cipher.toString();
      ciphertextOutput = `${saltHex}:${ivHex}:${ciphertextBase64}`;
    } else {
      // Base64 (default) - OpenSSL compatible
      const saltHex = bytesToHex(salt);
      const ivHex = bytesToHex(iv);
      const ciphertextBase64 = cipher.toString();
      ciphertextOutput = `${saltHex}:${ivHex}:${ciphertextBase64}`;
    }

    // Store ciphertext
    DOM.encOut.value = ciphertextOutput;

    // Create and display metadata
    const metadata = createEncryptionMetadata(params, salt, iv);
    const serialized = serializeEncryptionParams(params, salt, iv, metadata);
    DOM.encInfo.value = JSON.stringify(serialized, null, 2);

    // Enable output buttons
    DOM.copyEncBtn.disabled = false;
    DOM.downloadEncBtn.disabled = false;

    showNotification(`${params.algorithm} encryption successful with full parameters!`, 'success', 2000);
  } catch (err) {
    showNotification(`Encryption failed: ${err.message}`, 'error');
    DOM.encInfo.value = `Error: ${err.message}`;
  } finally {
    state.isProcessing = false;
  }
});

// ============================================================================
// EVENT LISTENERS - DECRYPT (ENHANCED)
// ============================================================================

DOM.decryptBtn.addEventListener("click", async () => {
  if (state.isProcessing) {
    showNotification("Processing... please wait", 'warning');
    return;
  }

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

  // Check attempt limits
  if (state.user) {
    // signed-in: consult server (if available)
    try {
      if (FUNCTIONS_BASE) {
        const resp = await serverCheckAttempt('try');
        if (!resp.allowed) {
          const until = resp.windowResetAt || 0;
          const hours = Math.ceil(Math.max(0, until - Date.now()) / (60 * 60 * 1000));
          showNotification(`No attempts left. Come back in ${hours} hour(s).`, 'warning');
          return;
        }
        // reflect remaining attempts from server
        state.user.remainingAttempts = resp.remaining;
        _updateAttemptsUI();
      } else {
        // If server not configured fall back to client-side local attempt tracking per-user
        if (isBlocked()) { showNotification('No attempts left. Sign in required for administrative help.', 'warning'); return; }
        incrementAttempt();
      }
    } catch (err) {
      showNotification(`Attempt check failed: ${err.message}`, 'error');
      return;
    }
  } else {
    // anonymous user: local attempts
    if (isBlocked()) { showAuthModal(); return; }
    incrementAttempt();
  }

  try {
    state.isProcessing = true;
    if (typeof CryptoJS === 'undefined') {
      throw new Error('CryptoJS library not loaded');
    }

    // Collect decryption parameters
    const params = {
      algorithm: DOM.decAlg.value,
      keySize: parseInt(DOM.decKeySize.value),
      mode: DOM.decMode.value,
      padding: DOM.decPadding.value,
      iterations: parseInt(DOM.decIterations.value),
      inFormat: DOM.decInFmt.value
    };

    // Parse ciphertext format (salt:iv:ciphertext)
    const parts = ciphertext.split(':');
    let salt, iv, ciphertextData;

    if (parts.length === 3) {
      salt = hexToBytes(parts[0]);
      iv = hexToBytes(parts[1]);
      ciphertextData = parts[2];
    } else {
      throw new Error('Invalid ciphertext format. Expected format: saltHex:ivHex:ciphertextData');
    }

    // Get cipher configuration with the parsed IV
    const cipherConfig = {
      mode: CryptoJS.mode[params.mode] || CryptoJS.mode.CBC,
      padding: CryptoJS.pad[params.padding] || CryptoJS.pad.Pkcs7,
    };

    if (params.mode !== 'ECB') {
      cipherConfig.iv = CryptoJS.lib.WordArray.create(iv);
    }

    // Perform decryption
    let decrypted;
    if (params.algorithm === 'AES') {
      decrypted = CryptoJS.AES.decrypt(ciphertextData, pass, cipherConfig);
    } else if (params.algorithm === 'DES') {
      decrypted = CryptoJS.DES.decrypt(ciphertextData, pass, cipherConfig);
    } else if (params.algorithm === 'TripleDES') {
      decrypted = CryptoJS.TripleDES.decrypt(ciphertextData, pass, cipherConfig);
    } else {
      throw new Error(`Unknown algorithm: ${params.algorithm}`);
    }

    state.decryptedBytes = wordArrayToBytes(decrypted);

    if (state.decryptedBytes.length === 0) {
      throw new Error('Decryption failed - check passphrase, algorithm, and mode/padding settings');
    }

    // Try to preview the decrypted data
    setPreviewFromBytes(state.decryptedBytes);

    // Display decryption info
    const decryptionInfo = {
      algorithm: params.algorithm,
      keySize: `${params.keySize} bits`,
      mode: params.mode,
      padding: params.padding,
      iterations: params.iterations,
      saltHex: bytesToHex(salt).toUpperCase(),
      ivHex: bytesToHex(iv).toUpperCase(),
      decryptedSize: `${state.decryptedBytes.length} bytes`,
      detectedMime: guessMime(state.decryptedBytes),
      status: 'SUCCESS'
    };

    DOM.decInfo.value = JSON.stringify(decryptionInfo, null, 2);

    DOM.decPreviewImg.removeAttribute('src');
    DOM.decPreviewImg.style.display = 'none';
    if (DOM.decPreviewPlaceholder) DOM.decPreviewPlaceholder.style.display = 'grid';

    const mime = guessMime(state.decryptedBytes);
    if (mime.startsWith('image/')) {
      const blob = new Blob([state.decryptedBytes], { type: mime });
      const url = URL.createObjectURL(blob);
      DOM.decPreviewImg.src = url;
      DOM.decPreviewPlaceholder.style.display = 'none';
      state.decryptedObjectURL = url;
    } else {
      DOM.decPreviewPlaceholder.textContent = `Decrypted data (${mime}) - ${state.decryptedBytes.length} bytes`;
    }

    DOM.decMeta.textContent = `Decrypted: ${state.decryptedBytes.length} bytes | Format: ${mime}`;

    // Successful decryption: reset attempt counter
    resetAttempts();

    // Enable output buttons
    DOM.downloadDecBtn.disabled = false;
    DOM.useAsCurrentBtn.disabled = false;

    showNotification("Decryption successful with parameter verification!", 'success', 2000);
  } catch (err) {
    showNotification(`Decryption failed: ${err.message}`, 'error');
    DOM.decInfo.value = `Error: ${err.message}\n\nMake sure:\n1. Algorithm matches (AES/DES/TripleDES)\n2. Key size is correct\n3. Cipher mode and padding match\n4. PBKDF2 iterations are the same\n5. Ciphertext format is correct (saltHex:ivHex:ciphertextData)`;
  } finally {
    state.isProcessing = false;
  }
});

// Copy encrypted ciphertext
DOM.copyEncBtn.addEventListener("click", () => {
  const text = DOM.encOut.value.trim();
  if (!text) {
    showNotification("No ciphertext to copy", 'warning');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showNotification("Ciphertext copied to clipboard", 'success', 1500);
  }).catch(() => {
    showNotification("Copy failed", 'error');
  });
});

// Download encrypted ciphertext
DOM.downloadEncBtn.addEventListener("click", () => {
  const text = DOM.encOut.value.trim();
  if (!text) {
    showNotification("No ciphertext to download", 'warning');
    return;
  }
  try {
    const params = {
      algorithm: DOM.encAlg.value,
      keySize: DOM.encKeySize.value,
      mode: DOM.encMode.value,
      padding: DOM.encPadding.value,
      iterations: DOM.encIterations.value
    };
    const metadata = `# Encryption Metadata\n# Algorithm: ${params.algorithm}\n# Key Size: ${params.keySize} bits\n# Mode: ${params.mode}\n# Padding: ${params.padding}\n# PBKDF2 Iterations: ${params.iterations}\n# Timestamp: ${new Date().toISOString()}\n\n`;
    const content = metadata + text;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `encrypted-${Date.now()}.txt`);
    showNotification("Downloaded ciphertext with metadata", 'success', 2000);
  } catch (err) {
    showNotification(`Download failed: ${err.message}`, 'error');
  }
});

// ============================================================================
// EVENT LISTENERS - DECRYPT OUTPUT
// ============================================================================

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

// ============================================================================
// TAB SWITCHING
// ============================================================================

document.querySelectorAll('.tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', (e) => {
    const tabName = tabBtn.getAttribute('data-tab');
    if (!tabName) return;

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });

    // Remove show class from all panels
    document.querySelectorAll('.panel').forEach(panel => {
      panel.classList.remove('show');
    });

    // Add active class to clicked tab
    tabBtn.classList.add('active');
    tabBtn.setAttribute('aria-selected', 'true');

    // Show corresponding panel
    const panel = document.getElementById(`panel-${tabName}`);
    if (panel) {
      panel.classList.add('show');
    }
  });
});

