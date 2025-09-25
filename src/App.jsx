// src/App.jsx
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Import components
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import PageEditor from './components/PageEditor';

// Import hooks
import { useAuth } from './hooks/useAuth';

// Import styles
import './App.css';
import './styles/globals.css';
import './styles/animations.css';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentPageId, setCurrentPageId] = useState(null);

  // Use auth hook instead of localStorage functions
  const { user, isAuthenticated, loading } = useAuth();

  // Check authentication state
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    }
  }, [isAuthenticated, user, loading]);

  // Handle get started button click
  const handleGetStarted = () => {
    setShowAuthModal(true);
  };
  
  // Handle successful authentication
  const handleAuthSuccess = (userData) => {
    setShowAuthModal(false);
    setCurrentView('dashboard');
  };
  
  // Handle opening a page/journal
  const handleOpenPage = (pageId) => {
    setCurrentPageId(pageId);
    setCurrentView('editor');
  };
  
  // Handle returning to dashboard
  const handleBackToDashboard = () => {
    setCurrentPageId(null);
    setCurrentView('dashboard');
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
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Main app content with view transitions */}
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <LandingPage 
            key="landing" 
            onGetStarted={handleGetStarted} 
          />
        )}
        {currentView === 'dashboard' && user && (
          <Dashboard 
            key="dashboard" 
            onOpenPage={handleOpenPage} 
            user={user} 
          />
        )}
        {currentView === 'editor' && currentPageId && (
          <PageEditor 
            key="editor" 
            pageId={currentPageId} 
            onBack={handleBackToDashboard} 
          />
        )}
      </AnimatePresence>

      {/* Authentication modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;