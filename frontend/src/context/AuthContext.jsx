import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, interactionsAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cwta_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cwta_access_token');
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
          localStorage.setItem('cwta_user', JSON.stringify(res.data));
          fetchNotifications();
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await interactionsAPI.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('cwta_access_token', access);
    localStorage.setItem('cwta_refresh_token', refresh);
    localStorage.setItem('cwta_user', JSON.stringify(userData));
    setUser(userData);
    fetchNotifications();
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('cwta_access_token', access);
    localStorage.setItem('cwta_refresh_token', refresh);
    localStorage.setItem('cwta_user', JSON.stringify(userData));
    setUser(userData);
    fetchNotifications();
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('cwta_access_token');
    localStorage.removeItem('cwta_refresh_token');
    localStorage.removeItem('cwta_user');
    setUser(null);
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    notifications,
    unreadCount,
    fetchNotifications,
    isAdmin: user?.role === 'ADMIN' || user?.is_admin,
    isInstructor: user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
