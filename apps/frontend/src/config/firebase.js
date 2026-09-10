import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Guarded Firebase initialisation — never crash the app when keys are
// missing or invalid. Google Sign-In is optional: email/password always
// works. `firebaseAvailable` is false when the client SDK cannot be
// initialised, and AuthContext/Login/Register use it to gracefully disable
// the Google button instead of opening a popup that can only fail.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasAllKeys = Object.values(firebaseConfig).every(
    (v) => typeof v === 'string' && v.trim().length > 0
);

let app = null;
let auth = null;
let googleProvider = null;
let storage = null;
let firebaseAvailable = false;

if (hasAllKeys) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        storage = getStorage(app);
        firebaseAvailable = true;
    } catch (err) {
        // Invalid keys (e.g. placeholders) — fall back to email/password only.
        console.warn('[Firebase] Client SDK init failed — Google Sign-In disabled.', err?.message);
    }
} else {
    console.warn('[Firebase] Missing VITE_FIREBASE_* keys — Google Sign-In disabled, email/password still works.');
}

export { auth, googleProvider, storage, firebaseAvailable };
