import admin from 'firebase-admin';

// firebaseAdmin.js — safe initialisation that never crashes the server.
//
// Three failure modes handled:
//   1. FIREBASE_SERVICE_ACCOUNT env var is missing → warn, skip init
//   2. Env var is not valid JSON (e.g. still has the client SDK config object
//      with unquoted keys, or raw .env line-breaks) → log error, skip init
//   3. JSON parsed but missing required service-account fields (type, private_key,
//      client_email) → log error with instructions, skip init
//
// In all failure cases the module still exports the `admin` namespace so that
// importing files don't need to guard against a null default export — they just
// won't have a working credential.

let firebaseInitialised = false;

const tryInit = () => {
  let saEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  // ── 1. Missing env var ──────────────────────────────────────────────────
  if (!saEnv || !saEnv.trim()) {
    console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT not set — Social Login disabled.');
    return;
  }

  saEnv = saEnv.trim();

  // ── 2. Strip accidental outer quotes added by some env managers ──────────
  if (
    (saEnv.startsWith("'") && saEnv.endsWith("'")) ||
    (saEnv.startsWith('"') && saEnv.endsWith('"'))
  ) {
    saEnv = saEnv.slice(1, -1).trim();
  }

  // ── 3. Parse JSON ────────────────────────────────────────────────────────
  let sa;
  try {
    sa = JSON.parse(saEnv);
  } catch (parseError) {
    console.error(
      '[Firebase] FIREBASE_SERVICE_ACCOUNT is not valid JSON — Social Login disabled.',
      parseError.message
    );
    return;
  }

  // ── 4. Validate it is a service-account object, not the client SDK config ─
  //   Client SDK objects have apiKey but no private_key / client_email / type.
  if (!sa.private_key || !sa.client_email) {
    console.error(
      '[Firebase] FIREBASE_SERVICE_ACCOUNT looks like a client SDK config (missing ' +
        'private_key / client_email). Paste the SERVICE ACCOUNT JSON from ' +
        'Firebase Console → Project Settings → Service Accounts. Social Login disabled.'
    );
    return;
  }

  if (sa.type !== 'service_account') {
    // Gracefully fill in missing type field instead of rejecting
    sa.type = 'service_account';
  }

  // ── 5. Fix escaped newlines in private_key ───────────────────────────────
  if (typeof sa.private_key === 'string') {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  }

  // ── 6. Back-fill optional fields that admin SDK expects ──────────────────
  const projectId = sa.project_id || process.env.FIREBASE_PROJECT_ID || '';
  if (!sa.project_id) sa.project_id = projectId;
  if (!sa.private_key_id) sa.private_key_id = 'key-1';
  if (!sa.client_id) sa.client_id = '0';
  if (!sa.auth_uri) sa.auth_uri = 'https://accounts.google.com/o/oauth2/auth';
  if (!sa.token_uri) sa.token_uri = 'https://oauth2.googleapis.com/token';
  if (!sa.auth_provider_x509_cert_url)
    sa.auth_provider_x509_cert_url = 'https://www.googleapis.com/oauth2/v1/certs';

  // ── 7. Initialise ────────────────────────────────────────────────────────
  try {
    admin.initializeApp({
      credential: admin.credential.cert(sa),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    firebaseInitialised = true;
    console.log('[Firebase] Admin SDK initialised successfully.');
  } catch (initError) {
    console.error('[Firebase] initializeApp failed — Social Login disabled.', initError.message);
  }
};

tryInit();

export { firebaseInitialised };
export default admin;
