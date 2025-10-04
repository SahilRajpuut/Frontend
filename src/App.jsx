// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import './styles/editor.css';
// Import components
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import PageEditor from './components/PageEditor';
import ProfileSettings from './components/ProfileSettings';

// Import hooks
import { useAuth } from './hooks/useAuth';

// Import styles
import './App.css';
import './styles/globals.css';
import './styles/animations.css';

const App = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Use auth hook
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Handle get started button click
  const handleGetStarted = () => {
    setShowAuthModal(true);
  };
  
  // Handle successful authentication
  const handleAuthSuccess = (userData) => {
    setShowAuthModal(false);
  };
  
  // Handle opening a page/journal
  const handleOpenPage = (pageId) => {
    setCurrentPageId(pageId);
    setShowEditor(true);
  };
  
  // Handle returning to dashboard
  const handleBackToDashboard = () => {
    setCurrentPageId(null);
    setShowEditor(false);
  };

  // Show loading screen during auth initialization
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing NoteFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white font-sans">
        {/* Show editor overlay if active */}
        {showEditor && currentPageId && (
          <PageEditor 
            pageId={currentPageId} 
            onBack={handleBackToDashboard} 
          />
        )}

        {/* Routes */}
        {!showEditor && (
          <Routes>
            {/* Landing page - only accessible when not authenticated */}
            <Route 
              path="/" 
              element={
                isAuthenticated && user ? 
                  <Navigate to="/dashboard" replace /> : 
                  <LandingPage onGetStarted={handleGetStarted} />
              } 
            />

            {/* Dashboard - protected route */}
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated && user ? 
                  <Dashboard 
                    onOpenPage={handleOpenPage} 
                    user={user} 
                  /> : 
                  <Navigate to="/" replace />
              } 
            />

            {/* Profile Settings - protected route */}
            <Route 
              path="/profile-settings" 
              element={
                isAuthenticated && user ? 
                  <ProfileSettings /> : 
                  <Navigate to="/" replace />
              } 
            />

            {/* Catch all - redirect to appropriate page */}
            <Route 
              path="*" 
              element={
                <Navigate to={isAuthenticated && user ? "/dashboard" : "/"} replace />
              } 
            />
          </Routes>
        )}

        {/* Authentication modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;