import admin from 'firebase-admin';

let app;

try {
  let saEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (saEnv) {
    let sa;
    try {
      // Robust parsing: strip potential outer quotes if they exist
      if ((saEnv.startsWith("'") && saEnv.endsWith("'")) || (saEnv.startsWith('"') && saEnv.endsWith('"'))) {
        saEnv = saEnv.slice(1, -1);
      }
      
      sa = JSON.parse(saEnv);
      
      // Ensure private_key newlines are actual newlines
      if (sa.private_key && typeof sa.private_key === 'string') {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      }
      
      // Add missing required fields if not present
      if (!sa.project_id) sa.project_id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'antigravity-a3438';
      if (!sa.private_key_id) sa.private_key_id = '1';
      if (!sa.client_email) sa.client_email = `service-account@${sa.project_id}.iam.gserviceaccount.com`;
      if (!sa.client_id) sa.client_id = '1';
      if (!sa.auth_uri) sa.auth_uri = 'https://accounts.google.com/o/oauth2/auth';
      if (!sa.token_uri) sa.token_uri = 'https://oauth2.googleapis.com/token';
      if (!sa.auth_provider_x509_cert_url) sa.auth_provider_x509_cert_url = 'https://www.googleapis.com/oauth2/v1/certs';
      if (!sa.client_x509_cert_url) sa.client_x509_cert_url = `https://www.googleapis.com/robot/v1/metadata/x509/${sa.client_email.split('@')[0]}%40${sa.project_id}.iam.gserviceaccount.com`;
    } catch (parseError) {
      console.error('FIREBASE_SERVICE_ACCOUNT parsing error:', parseError.message);
    }

    if (sa) {
      app = admin.initializeApp({
        credential: admin.credential.cert(sa),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      console.log('Firebase Admin Initialized successfully');
    } else {
      console.error('FIREBASE_SERVICE_ACCOUNT is provided but not valid JSON. Auth disabled.');
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT not found. Social Login/Storage will fail.');
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error.message);
}

export default admin;
