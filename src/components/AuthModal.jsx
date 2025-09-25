// src/components/AuthModal.jsx - COMPLETE FIXED VERSION
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Function to safely extract error message
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        return error.response.data.detail.map(e => e.msg || e.message || 'Validation error').join(', ');
      }
      return error.response.data.detail;
    }
    return 'An unexpected error occurred';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowSuccess(false);
    
    try {
      const credentials = isLogin 
        ? { email, password }
        : { email, password, name };
      
      console.log('Submitting credentials:', { email, name: credentials.name });
      
      if (isLogin) {
        // LOGIN FLOW
        const result = await authService.login(credentials);
        
        console.log('Login result:', result);
        
        if (result.success) {
          onSuccess(result.user);
          // Reset form
          setEmail('');
          setPassword('');
          setName('');
          setError('');
        } else {
          const errorMessage = getErrorMessage(result.error || result);
          console.log('Setting login error:', errorMessage);
          setError(errorMessage);
        }
      } else {
        // SIGNUP FLOW
        const result = await authService.signup(credentials);
        
        console.log('Signup result:', result);
        
        if (result.success) {
          // Show success message and switch to login
          setSuccessMessage(result.message || 'Account created successfully! Please login with your credentials.');
          setShowSuccess(true);
          
          // Reset form
          setEmail('');
          setPassword('');
          setName('');
          setError('');
          
          // Auto-switch to login after 3 seconds
          setTimeout(() => {
            setShowSuccess(false);
            setIsLogin(true);
          }, 3000);
        } else {
          const errorMessage = getErrorMessage(result.error || result);
          console.log('Setting signup error:', errorMessage);
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Auth error caught:', error);
      const errorMessage = getErrorMessage(error);
      console.log('Setting caught error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-md bg-black rounded-3xl shadow-2xl overflow-hidden border border-gray-800"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
            
            <div className="relative p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-900 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 text-white">
                  Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">NoteFlow</span>
                </h2>
                <p className="text-gray-400">
                  {isLogin ? 'Sign in to continue learning' : 'Start your learning journey'}
                </p>
              </div>

              {/* SUCCESS MESSAGE */}
              {showSuccess && (
                <motion.div 
                  className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded-xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 text-sm">{successMessage}</p>
                  </div>
                  <p className="text-green-300 text-xs mt-2">Switching to login in 3 seconds...</p>
                </motion.div>
              )}

              {/* ERROR MESSAGE */}
              {error && !showSuccess && (
                <motion.div 
                  className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-red-400 text-sm">
                    {getErrorMessage(error)}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                      placeholder="Enter your full name"
                      required={!isLogin}
                      disabled={isLoading || showSuccess}
                    />
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 pl-12 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                      placeholder="Enter your email"
                      required
                      disabled={isLoading || showSuccess}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 pr-12 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading || showSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={isLoading || showSuccess}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500 mt-2">
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || showSuccess}
                  className="w-full p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                    </div>
                  ) : showSuccess ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Account Created!</span>
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <span className="text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setShowSuccess(false);
                    setEmail('');
                    setPassword('');
                    setName('');
                  }}
                  disabled={isLoading || showSuccess}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors disabled:opacity-50"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;