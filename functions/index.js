const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize using default credentials if running in Cloud Functions environment.
try {
  admin.initializeApp();
} catch (e) {
  // ignore if already initialized (local dev may do manual init)
}

const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const ATTEMPT_OPTIONS = { maxAttempts: 5, windowMs: 24 * 60 * 60 * 1000 };

async function verifyBearer(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) throw new Error('Missing bearer token');
  const token = auth.split(' ')[1];
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded; // contains uid and claims
}

// Health check
app.get('/', (req, res) => res.json({ ok: true }));

// Check-only or check+increment attempts
// POST /checkAttempt?action=check|try
app.post('/checkAttempt', async (req, res) => {
  try {
    const decoded = await verifyBearer(req);
    const uid = decoded.uid;
    if (!uid) throw new Error('Invalid token');

    const docRef = db.collection('attemptCounts').doc(uid);
    const now = Date.now();
    const action = (req.query.action || 'try');

    const result = await db.runTransaction(async (t) => {
      const snap = await t.get(docRef);
      let rec = snap.exists ? snap.data() : { windowStart: 0, count: 0 };
      if (!rec.windowStart || (now - rec.windowStart) > ATTEMPT_OPTIONS.windowMs) {
        // reset window
        rec.windowStart = now;
        rec.count = 0;
      }

      if (action === 'check') {
        const remaining = Math.max(0, ATTEMPT_OPTIONS.maxAttempts - rec.count);
        return { allowed: remaining > 0, remaining, windowResetAt: rec.windowStart + ATTEMPT_OPTIONS.windowMs };
      }

      // action === try: attempt to increment
      if ((rec.count || 0) >= ATTEMPT_OPTIONS.maxAttempts) {
        const remaining = 0;
        return { allowed: false, remaining, windowResetAt: rec.windowStart + ATTEMPT_OPTIONS.windowMs };
      }

      rec.count = (rec.count || 0) + 1;
      t.set(docRef, rec, { merge: true });
      const remaining = Math.max(0, ATTEMPT_OPTIONS.maxAttempts - rec.count);
      return { allowed: true, remaining, windowResetAt: rec.windowStart + ATTEMPT_OPTIONS.windowMs };
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('checkAttempt error', err.message);
    res.status(403).json({ ok: false, error: err.message });
  }
});

// Admin: list pending requests
app.post('/listPendingRequests', async (req, res) => {
  try {
    const decoded = await verifyBearer(req);
    if (!decoded.admin) throw new Error('Admin claim required');
    const q = await db.collection('requests').where('status', '==', 'pending').get();
    const out = [];
    q.forEach(d => out.push({ id: d.id, ...d.data() }));
    res.json({ ok: true, data: out });
  } catch (err) {
    console.error('listPendingRequests', err.message);
    res.status(403).json({ ok: false, error: err.message });
  }
});

// Admin: approve request (must be admin)
app.post('/approveRequest', async (req, res) => {
  try {
    const decoded = await verifyBearer(req);
    if (!decoded.admin) throw new Error('Admin claim required');
    const { uid } = req.body;
    if (!uid) throw new Error('Missing uid');
    const userRef = db.collection('users').doc(uid);
    const reqRef = db.collection('requests').doc(uid);
    await userRef.set({ unlimited: true }, { merge: true });
    await reqRef.set({ status: 'approved', reviewedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    console.error('approveRequest', err.message);
    res.status(403).json({ ok: false, error: err.message });
  }
});

// Stripe-related placeholders (require STRIPE secret to function)
app.post('/createCheckoutSession', async (req, res) => {
  if (!process.env.STRIPE_SECRET) return res.status(501).json({ ok: false, error: 'Stripe not configured' });
  // Implement checkout session creation here if you configure STRIPE_SECRET
  res.status(501).json({ ok: false, error: 'Not implemented on this deployment' });
});

// Expose Express app
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Functions API running on port ${PORT}`));

module.exports = app;
