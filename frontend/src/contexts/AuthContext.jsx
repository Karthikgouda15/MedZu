import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

const DASHBOARD_ROUTES = {
  admin: '/admin/dashboard',
  pharmacy: '/pharmacy/dashboard',
  distributor: '/distributor/dashboard',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
      setProfile(data.data.profile);
      connectSocket(token);
    } catch {
      // Clear tokens on any auth error (401, 403, etc.)
      localStorage.clear();
      disconnectSocket();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadUser();
    });
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    setProfile(data.data.profile);
    connectSocket(data.data.accessToken);
    return data.data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.clear();
    disconnectSocket();
    setUser(null);
    setProfile(null);
  };

  const getDashboardRoute = (role) => DASHBOARD_ROUTES[role] || '/';

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, register, logout, loadUser, getDashboardRoute }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
