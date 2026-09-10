import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = async () => {
    try { await signOut(auth); } catch { /* ignore Firebase sign-out errors on logout */ }
    localStorage.removeItem('user');
    setUser(null);
  };

  const loginWithGoogle = async () => {
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
      const msg = error.response?.data?.message || error.message;
      console.error('Google Auth Error:', error);
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithGoogle, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
