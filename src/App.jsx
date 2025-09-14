import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Import components
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import PageEditor from './components/PageEditor';

// Import utilities
import { isAuthenticated, getCurrentUser } from './utils/auth';

// Import styles
import './App.css';
import './styles/globals.css';
import './styles/animations.css';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPageId, setCurrentPageId] = useState(null);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
          setCurrentView('dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  // Handle get started button click
  const handleGetStarted = () => {
    setShowAuthModal(true);
  };
  
  // Handle successful authentication
  const handleAuthSuccess = (userData) => {
    setShowAuthModal(false);
    setUser(userData);
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