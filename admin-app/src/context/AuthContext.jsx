import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { loginAdmin, logoutAdmin, changeAdminPassword } from '../api/admin';
import { AuthContext } from './authContextInstance';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('campusplus_admin_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusplus_admin_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const savedToken = localStorage.getItem('campusplus_admin_token');
    const savedUser = localStorage.getItem('campusplus_admin_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('campusplus_admin_token');
        localStorage.removeItem('campusplus_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const result = await loginAdmin(username, password);
    const newToken = result.token;
    const newUser = result.admin;

    localStorage.setItem('campusplus_admin_token', newToken);
    localStorage.setItem('campusplus_admin_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    return result;
  };

  const logout = async () => {
    await logoutAdmin();
    localStorage.removeItem('campusplus_admin_token');
    localStorage.removeItem('campusplus_admin_user');
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await changeAdminPassword(currentPassword, newPassword);
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
