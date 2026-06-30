import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_CREDENTIALS, MOCK_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));

    const cred = MOCK_CREDENTIALS[email];
    if (!cred || cred.password !== password) {
      throw new Error('Invalid email or password. Please try again.');
    }

    const userData = MOCK_USERS.find(u => u.id === cred.userId);
    if (!userData || !userData.status) {
      throw new Error('Your account has been deactivated. Contact administrator.');
    }

    const sessionUser = { ...userData };
    setUser(sessionUser);
    localStorage.setItem('lf_user', JSON.stringify(sessionUser));
    localStorage.setItem('lf_token', `mock-jwt-token-${userData.id}-${Date.now()}`);
    return sessionUser;
  }, []);

  const register = useCallback(async (formData) => {
    await new Promise(r => setTimeout(r, 1500));
    // In mock mode, just simulate success
    // Real: POST /api/auth/register
    return { success: true, message: 'Account created successfully! Please login.' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('lf_user');
    localStorage.removeItem('lf_token');
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('lf_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
