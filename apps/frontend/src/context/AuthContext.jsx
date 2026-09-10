import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, firebaseAvailable } from '../config/firebase';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Server-side Google availability (Firebase Admin SDK initialised?).
  // null = unknown yet; Login/Register probe /auth/firebase-status.
  const [googleServerAvailable, setGoogleServerAvailable] = useState(null);

  const normalizeUser = (u) => {
    if (!u) return u;
    // Support both isAdmin boolean and role string
    const isAdmin = u.isAdmin === true || u.role === 'admin' || u.role === 'manager';
    return { ...u, isAdmin };
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(normalizeUser(parsed));
      }
    } catch {
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  // Probe once whether the API server has Firebase Admin configured.
  // Public, unauthenticated endpoint — safe to call on app start.
  useEffect(() => {
    let cancelled = false;
    api.get('/auth/firebase-status')
      .then(({ data }) => {
        if (!cancelled) setGoogleServerAvailable(data?.enabled === true);
      })
      .catch(() => {
        if (!cancelled) setGoogleServerAvailable(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Google Sign-In is available only when BOTH the client SDK (this app)
  // and the server (Firebase Admin) are configured.
  const googleAvailable = firebaseAvailable && googleServerAvailable !== false;

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = async () => {
    // auth is null when the client SDK is disabled — skip Firebase sign-out.
    try { if (auth) await signOut(auth); } catch { /* ignore Firebase sign-out errors on logout */ }
    localStorage.removeItem('user');
    setUser(null);
  };

  const loginWithGoogle = async () => {
    // Fail fast with a friendly code — no popup when we know it can't work.
    if (!firebaseAvailable || !auth || !googleProvider) {
      return { success: false, code: 'GOOGLE_CLIENT_DISABLED' };
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { data } = await api.post('/auth/firebase', { idToken });
      if (data.success && data.data) {
        login(data.data);
        return { success: true };
      }
      return { success: false, error: data.message || 'Firebase login failed' };
    } catch (error) {
      // 503 = Firebase not configured on the server side
      if (error.response?.status === 503 || error.response?.data?.code === 'FIREBASE_DISABLED') {
        return { success: false, code: 'GOOGLE_SERVER_DISABLED' };
      }
      // Map common Firebase popup errors to stable codes for localized UI.
      const fbCode = error?.code || '';
      if (fbCode.includes('popup-closed-by-user') || fbCode.includes('cancelled-popup-request')) {
        return { success: false, code: 'GOOGLE_CANCELLED' };
      }
      if (fbCode.includes('popup-blocked')) {
        return { success: false, code: 'GOOGLE_POPUP_BLOCKED' };
      }
      if (fbCode.includes('unauthorized-domain')) {
        return { success: false, code: 'GOOGLE_DOMAIN_NOT_ALLOWED' };
      }
      if (fbCode.includes('network-request-failed')) {
        return { success: false, code: 'GOOGLE_NETWORK_ERROR' };
      }
      const msg = error.response?.data?.message || error.message;
      console.error('Google Auth Error:', error);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithGoogle, googleAvailable, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
