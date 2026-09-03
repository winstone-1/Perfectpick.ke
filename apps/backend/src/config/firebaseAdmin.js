import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

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
