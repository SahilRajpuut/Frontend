// src/services/authService.js - COMPLETE FIXED VERSION WITH EVENT DISPATCHING
import apiClient from '../utils/apiClient';

class AuthService {
  constructor() {
    this.user = null;
    this.isInitialized = false;
  }

  // Dispatch auth state change event
  dispatchAuthChange(user, isAuthenticated) {
    console.log('Dispatching auth state change:', { user, isAuthenticated });
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user, isAuthenticated } 
    }));
  }

  // Initialize auth state from stored tokens
  async initialize() {
    if (this.isInitialized) return;
    
    const token = localStorage.getItem('noteflow_token');
    if (token && !token.startsWith('demo_')) {
      try {
        // Verify token and get current user
        const userData = await apiClient.getCurrentUser();
        this.user = userData;
        localStorage.setItem('noteflow_user', JSON.stringify(userData));
      } catch (error) {
        console.error('Token verification failed:', error);
        this.clearAuth();
      }
    }
    
    this.isInitialized = true;
  }

  // Login user with backend
  async login(credentials) {
    try {
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await apiClient.login(credentials.email, credentials.password);
      
      console.log('Login response received:', response);
      
      // Store token and user data
      if (response.access_token && response.user) {
        localStorage.setItem('noteflow_token', response.access_token);
        localStorage.setItem('noteflow_user', JSON.stringify(response.user));
        this.user = response.user;
        
        // Dispatch auth state change event
        this.dispatchAuthChange(response.user, true);
        
        return { 
          success: true, 
          user: response.user,
          message: 'Login successful'
        };
      } else {
        throw new Error('Invalid login response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      return this.handleError(error, 'Login failed');
    }
  }

  // Register new user with backend (NO AUTO-LOGIN)
  async signup(credentials) {
    try {
      console.log('Attempting signup with:', { 
        email: credentials.email, 
        name: credentials.name 
      });
      
      const response = await apiClient.register(
        credentials.email, 
        credentials.password, 
        credentials.name
      );
      
      console.log('Signup response received:', response);
      
      // FIXED: Just return success, don't auto-login
      if (response.user || response.message) {
        return { 
          success: true, 
          message: response.message || 'Account created successfully! Please login with your credentials.',
          requireLogin: true // Flag to indicate user needs to login
        };
      } else {
        throw new Error('Registration failed - invalid response from server');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return this.handleError(error, 'Registration failed');
    }
  }

  // Centralized error handling
  handleError(error, defaultMessage) {
    let errorMessage = defaultMessage;
    
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        // Handle FastAPI validation errors
        errorMessage = error.response.data.detail
          .map(err => {
            if (err.msg) return err.msg;
            if (err.message) return err.message;
            return 'Validation error';
          })
          .join(', ');
      } else if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific error cases
    if (errorMessage.includes('Network error') || errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Unable to connect to server. Please check if the backend is running on port 8000.';
    } else if (error.response?.status === 400) {
      // Keep validation messages as is
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.response?.status === 422) {
      errorMessage = 'Please check your input data and try again.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('noteflow_token');
      if (token && !token.startsWith('demo_')) {
        await apiClient.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      // Dispatch auth state change event for logout
      this.dispatchAuthChange(null, false);
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('noteflow_token');
    return token !== null && !token.startsWith('demo_');
  }

  // Get current user
  getCurrentUser() {
    if (this.user) return this.user;
    
    const userStr = localStorage.getItem('noteflow_user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        return this.user;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearAuth();
        return null;
      }
    }
    
    return null;
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.updateProfile(updates);
        this.user = response;
        localStorage.setItem('noteflow_user', JSON.stringify(response));
        
        // Dispatch user update event (for profile changes)
        window.dispatchEvent(new Event('userUpdated'));
        
        return response;
      } else {
        throw new Error('No valid authentication token');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error(this.handleError(error, 'Profile update failed').error);
    }
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('noteflow_token');
    localStorage.removeItem('noteflow_user');
    this.user = null;
  }

  // Get user stats and usage
  async getUserStats() {
    try {
      const token = localStorage.getItem('noteflow_token');
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.client.get('/auth/stats');
        return response.data;
      } else {
        throw new Error('No valid authentication token');
      }
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  }

  // Check if backend is available
  async checkBackendHealth() {
    try {
      await apiClient.healthCheck();
      return true;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;