import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kas_token');
    const storedAdmin = localStorage.getItem('kas_admin');

    if (token && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
        // Verify with backend
        api.get('/auth/me')
          .then((res) => {
            if (res.data.success) {
              setAdmin(res.data.admin);
              localStorage.setItem('kas_admin', JSON.stringify(res.data.admin));
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      localStorage.setItem('kas_token', res.data.token);
      localStorage.setItem('kas_admin', JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
      return res.data;
    }
    throw new Error(res.data.message || 'Login gagal');
  };

  const logout = () => {
    localStorage.removeItem('kas_token');
    localStorage.removeItem('kas_admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
