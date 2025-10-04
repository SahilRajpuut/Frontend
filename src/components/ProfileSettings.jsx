import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Edit3, Save, X, Check, 
  AlertTriangle, Loader2, Shield, Calendar, Crown, ArrowLeft
} from 'lucide-react';
import apiClient from '../utils/apiClient';

// Status Toast Component
const StatusToast = ({ isVisible, status, message, onClose }) => {
  useEffect(() => {
    if (isVisible && (status === 'success' || status === 'error')) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, status, onClose]);

  if (!isVisible) return null;

  const statusConfig = {
    saving: { icon: Loader2, color: 'blue', spin: true },
    success: { icon: Check, color: 'green', spin: false },
    error: { icon: AlertTriangle, color: 'red', spin: false }
  };

  const config = statusConfig[status];
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed top-4 right-4 bg-gray-900 border border-${config.color}-500 rounded-lg p-4 flex items-center space-x-3 z-[60] shadow-lg`}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
      >
        <config.icon className={`w-5 h-5 text-${config.color}-400 ${config.spin ? 'animate-spin' : ''}`} />
        <span className="text-white font-medium">{message}</span>
        {status !== 'saving' && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Verification Modal Component
const VerificationModal = ({ isOpen, onClose, onVerify, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = React.useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }
    onVerify(verificationCode);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
        <motion.div
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 min-w-[400px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Email Verification</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-gray-300 text-center mb-2">
              We've sent a verification code to
            </p>
            <p className="text-white font-medium text-center">{email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                />
              ))}
            </div>
            
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            
            <div className="flex space-x-3 justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium"
              >
                Verify
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Password Change Modal
const PasswordChangeModal = ({ isOpen, onClose, onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    onSubmit({ currentPassword, newPassword });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
        <motion.div
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 min-w-[400px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Change Password</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none text-white"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            
            <div className="flex space-x-3 justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium"
              >
                Change Password
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Main Profile Settings Component
const ProfileSettings = ({ onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const [statusToast, setStatusToast] = useState({ isVisible: false, status: 'saving', message: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingPasswordChange, setPendingPasswordChange] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const userData = await apiClient.getCurrentUser();
      
      console.log('Fetched user data:', userData);
      setUser(userData);
      setTempUsername(userData.name);
    } catch (error) {
      console.error('Error fetching user data:', error);
      showToast('error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (status, message) => {
    setStatusToast({ isVisible: true, status, message });
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setTempUsername(user.name);
    setUsernameError('');
  };

  const handleUsernameSave = async () => {
    if (!tempUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    if (tempUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    try {
      showToast('saving', 'Updating username...');
      
      console.log('Updating username to:', tempUsername);
      
      const updatedUser = await apiClient.updateProfile({ name: tempUsername });
      
      console.log('Username updated successfully:', updatedUser);
      
      setUser(updatedUser);
      setIsEditingUsername(false);
      showToast('success', 'Username updated successfully!');
      
      // Update localStorage with new user data
      localStorage.setItem('noteflow_user', JSON.stringify(updatedUser));
      
      // Trigger user update event to refresh data across the app
      console.log('Dispatching userUpdated event...');
      window.dispatchEvent(new Event('userUpdated'));
      
    } catch (error) {
      console.error('Error updating username:', error);
      if (error.message?.includes('already exists')) {
        setUsernameError(error.message);
      } else {
        setUsernameError('Failed to update username. Please try again.');
        showToast('error', 'Failed to update username');
      }
    }
  };

  const handlePasswordChangeRequest = async (passwordData) => {
    try {
      showToast('saving', 'Requesting password change...');
      
      const response = await apiClient.client.post(
        '/auth/change-password-request',
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_new_password: passwordData.newPassword
        }
      );

      setPendingPasswordChange(passwordData);
      setIsPasswordModalOpen(false);
      setIsVerificationModalOpen(true);
      showToast('success', response.data?.message || 'Verification code sent!');
    } catch (error) {
      console.error('Error requesting password change:', error);
      showToast('error', error.message || 'Failed to request password change');
    }
  };

  const handleVerification = async (code) => {
    try {
      showToast('saving', 'Verifying code...');
      
      const response = await apiClient.client.post(
        '/auth/change-password-confirm',
        {
          verification_code: code,
          new_password: pendingPasswordChange.newPassword
        }
      );

      setIsVerificationModalOpen(false);
      showToast('success', 'Password changed successfully!');
      setPendingPasswordChange(null);
    } catch (error) {
      console.error('Error verifying code:', error);
      showToast('error', error.message || 'Invalid verification code');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white">Failed to load user data</p>
          <button
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-y-auto">
      <StatusToast
        isVisible={statusToast.isVisible}
        status={statusToast.status}
        message={statusToast.message}
        onClose={() => setStatusToast({ ...statusToast, isVisible: false })}
      />

      <div className="max-w-4xl mx-auto p-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-gray-400 mb-3">{user.email}</p>
                <div className="flex items-center flex-wrap gap-4">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 rounded-full border border-purple-500/30">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">{user.plan_type || 'Free'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <User className="w-5 h-5 text-purple-400" />
            <span>Account Details</span>
          </h3>

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <div className="flex items-center space-x-3">
                {isEditingUsername ? (
                  <>
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => {
                        setTempUsername(e.target.value);
                        setUsernameError('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                      autoFocus
                    />
                    <button
                      onClick={handleUsernameSave}
                      className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Save className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingUsername(false);
                        setUsernameError('');
                      }}
                      className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                      {user.name}
                    </div>
                    <button
                      onClick={handleUsernameEdit}
                      className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Edit3 className="w-5 h-5 text-purple-400" />
                    </button>
                  </>
                )}
              </div>
              {usernameError && (
                <p className="text-red-400 text-sm mt-2">{usernameError}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                  {user.email_verified && (
                    <div className="ml-auto flex items-center space-x-1 px-2 py-1 bg-green-600/20 rounded-full border border-green-500/30 flex-shrink-0">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                {user.name}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-purple-400" />
            <span>Security</span>
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Password</h4>
                <p className="text-sm text-gray-400">
                  Change your password regularly for better security
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium flex-shrink-0 self-start sm:self-center"
              >
                Change Password
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium flex-shrink-0 self-start sm:self-center">
                Enable
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChangeRequest}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setPendingPasswordChange(null);
        }}
        onVerify={handleVerification}
        email={user.email}
      />
    </div>
  );
};

export default ProfileSettings;