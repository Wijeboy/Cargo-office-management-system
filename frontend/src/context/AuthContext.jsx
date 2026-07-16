import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to save user without large avatar to localStorage (prevents QuotaExceededError)
  const saveUserToLocalStorage = (userObj) => {
    if (!userObj) {
      localStorage.removeItem('lf_user');
      return;
    }
    const { avatar, ...safeUser } = userObj;
    try {
      localStorage.setItem('lf_user', JSON.stringify(safeUser));
    } catch (e) {
      console.warn('Failed to save user to localStorage:', e);
    }
  };

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('lf_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          saveUserToLocalStorage(data.user);
        } else {
          // Token expired or invalid
          saveUserToLocalStorage(null);
          localStorage.removeItem('lf_token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid email or password. Please try again.');
    }

    if (data.status === '2fa_required') {
      return { twoFARequired: true, userId: data.userId };
    }

    setUser(data.user);
    saveUserToLocalStorage(data.user);
    localStorage.setItem('lf_token', data.token);
    return data.user;
  }, []);

  const verify2FA = useCallback(async (userId, code) => {
    const response = await fetch(`${API_URL}/api/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid two-factor code.');
    }

    setUser(data.user);
    saveUserToLocalStorage(data.user);
    localStorage.setItem('lf_token', data.token);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed. Please try again.');
    }

    return { success: true, message: data.message };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveUserToLocalStorage(null);
    localStorage.removeItem('lf_token');
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const token = localStorage.getItem('lf_token');
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile.');
    }

    setUser(data.user);
    saveUserToLocalStorage(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile, verify2FA, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
