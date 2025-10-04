// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      await authService.initialize();
      const currentUser = authService.getCurrentUser();
      console.log('Auth initialized, user:', currentUser);
      setUser(currentUser);
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen for auth state changes from authService
  useEffect(() => {
    const handleAuthStateChange = (event) => {
      console.log('Auth state changed:', event.detail);
      const { user: newUser, isAuthenticated } = event.detail;
      
      if (isAuthenticated && newUser) {
        setUser(newUser);
      } else {
        setUser(null);
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  // Listen for user profile updates
  useEffect(() => {
    const handleUserUpdate = () => {
      console.log('User profile updated');
      const storedUser = localStorage.getItem('noteflow_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (err) {
          console.error('Error parsing stored user:', err);
        }
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(credentials);
      
      if (result.success) {
        // User state will be updated by authStateChanged event
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('useAuth: Calling authService.logout()');
      await authService.logout();
      // User state will be updated by authStateChanged event
      console.log('useAuth: Logout complete');
    } catch (err) {
      console.error('Logout error:', err);
      // Force clear state even on error
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('Manually refreshing user data...');
      await authService.initialize();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      console.log('User data refreshed:', currentUser);
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    updateProfile: authService.updateUserProfile.bind(authService)
  };
}