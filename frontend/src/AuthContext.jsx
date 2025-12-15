import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from './api';
import jwtDecode from 'jwt-decode';


const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // In AuthContext.jsx, update the checkAuth function:
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
          setLoading(false);
          return;
        }
        
        // Try to get current user
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };
  
  // Also update the login function:
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      // Get user data
      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.data);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Clear token if login fails
      localStorage.removeItem('token');
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      await authAPI.signup(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};