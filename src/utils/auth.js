// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import {
  login as loginUtil,
  signup as signupUtil,
  logout as logoutUtil,
  isAuthenticated as isAuthenticatedUtil,
  getCurrentUser,
} from "../utils/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Load user on mount
  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticatedUtil();
      setIsAuthenticated(auth);
      if (auth) {
        setUser(getCurrentUser());
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // ✅ Login
  const login = useCallback((credentials) => {
    const result = loginUtil(credentials);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  // ✅ Signup
  const signup = useCallback((credentials) => {
    const result = signupUtil(credentials);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  // ✅ Logout
  const logout = useCallback(() => {
    logoutUtil();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
  };
};
