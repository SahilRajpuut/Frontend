// src/components/PageEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Lightbulb, MessageCircle, Share2, Brain, X, Send,
  Video, Image, BarChart, Quote, Code, Type, Bold, Italic, 
  Underline, Link, Wifi, WifiOff, Loader2
} from 'lucide-react';

// Import hooks
import { useNote } from '../hooks/useNote';
import { useAI } from '../hooks/useAI';
import { useWebSocket } from '../hooks/useWebSocket';

const PageEditor = ({ pageId, onBack }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Journal');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [proactiveMode, setProactiveMode] = useState(true);
  
  const editorRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // Custom hooks
  const { 
    note, 
    loading, 
    error, 
    saving, 
    saveNote, 
    autoSave 
  } = useNote(pageId);
  
  const { 
    isEnabled: aiEnabled, 
    loading: aiLoading,
    askQuestion, 
    getSuggestions 
  } = useAI();
  
  const { 
    connected: wsConnected, 
    aiSuggestions, 
    sendTypingActivity,
    requestAnalysis 
  } = useWebSocket();

  // Load note data when component mounts
  useEffect(() => {
    if (note) {
      setTitle(note.title || 'Untitled Journal');
      setContent(note.content || '');
    }
  }, [note]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      if (content || title !== 'Untitled Journal') {
        autoSave({ title, content });
        
        // Send typing activity for real-time AI assistance
        if (wsConnected && proactiveMode) {
          sendTypingActivity(content);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, title, autoSave, wsConnected, proactiveMode, sendTypingActivity]);

  // Enhanced chat functionality
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      // Use AI service to get response
      const response = await askQuestion(chatInput, {
        noteIds: note?.id ? [note.id] : null,
        includeRecent: true
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.success ? response.answer : 'I encountered an error processing your question.',
        timestamp: new Date(),
        confidence: response.confidence || 0
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat message failed:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
        error: true
      };

      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Request AI analysis of current content
  const handleAIAnalysis = async () => {
    if (content && wsConnected) {
      requestAnalysis(content, note?.id);
    } else if (aiEnabled && content) {
      // Fallback to direct AI service
      try {
        const response = await askQuestion(
          `Analyze this content and provide insights: ${content.substring(0, 500)}...`
        );
        
        if (response.success) {
          const analysisMessage = {
            id: Date.now().toString(),
            type: 'ai',
            content: response.answer,
            timestamp: new Date(),
            isAnalysis: true
          };
          
          setChatMessages(prev => [...prev, analysisMessage]);
          setShowChat(true);
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === '/') {
      setShowSlashMenu(true);
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
    } else if (e.key === '\\' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setShowChat(!showChat);
    }
  };

  const slashCommands = [
    { icon: Video, label: 'Generate Video', description: 'Create educational video content' },
    { icon: Image, label: 'Generate Image', description: 'Create diagrams and illustrations' },
    { icon: BarChart, label: 'Generate Chart', description: 'Create data visualizations' },
    { icon: Quote, label: 'Quote Block', description: 'Add a formatted quote' },
    { icon: Code, label: 'Code Block', description: 'Add code snippet' },
    { icon: Type, label: 'Heading', description: 'Add section heading' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your journal...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load journal: {error}</p>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Enhanced AI suggestions display
  const renderAISuggestions = () => {
    if (!proactiveMode || aiSuggestions.length === 0) return null;

    return (
      <div className="px-6 py-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-white">AI Suggestions</span>
            {wsConnected && (
              <div className="flex items-center space-x-1">
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Live</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setAiSuggestions([])}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
        
        <div className="space-y-2">
          {aiSuggestions.slice(0, 3).map((suggestion, index) => (
            <div 
              key={index}
              className="text-sm text-gray-300 bg-black/20 rounded-lg p-3 cursor-pointer hover:bg-black/40 transition-colors"
              onClick={() => {
                setContent(prev => prev + '\n\n' + (suggestion.text || suggestion.content));
              }}
            >
              {suggestion.text || suggestion.content}
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleAIAnalysis}
          disabled={aiLoading}
          className="mt-3 px-3 py-1 bg-purple-600 rounded-lg text-sm hover:bg-purple-500 transition-colors font-medium text-white disabled:opacity-50"
        >
          {aiLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing...</span>
            </div>
          ) : (
            'Analyze Content'
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header with save status */}
      <motion.header 
        className="bg-black border-b border-gray-900"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-900 rounded-xl transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400 min-w-0 flex-1"
              placeholder="Untitled Journal"
            />
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${
                saving ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
              }`} />
              <span>{saving ? 'Saving...' : 'Auto-saved'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* AI status indicator */}
            <div className="flex items-center space-x-2 text-xs">
              {aiEnabled ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Brain className="w-3 h-3" />
                  <span>AI Ready</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Brain className="w-3 h-3" />
                  <span>AI Offline</span>
                </div>
              )}
            </div>
            
            {/* WebSocket status */}
            {wsConnected ? (
              <div className="flex items-center space-x-1 text-xs text-blue-400">
                <Wifi className="w-3 h-3" />
                <span>Live AI</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}

            {/* AI Toggle */}
            <div className="flex items-center space-x-2 bg-gray-900 px-3 py-2 rounded-xl border border-gray-800">
              <Lightbulb className={`w-4 h-4 ${proactiveMode ? 'text-yellow-400' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-white">AI Tutor</span>
              <button
                onClick={() => setProactiveMode(!proactiveMode)}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  proactiveMode ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transition-transform absolute top-0.5 ${
                  proactiveMode ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-xl transition-colors border border-gray-800 ${
                showChat ? 'bg-purple-600' : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>

            <button className="px-4 py-3 bg-black border-2 border-purple-600 rounded-xl hover:bg-purple-600 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg text-white">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* AI Suggestions */}
          {renderAISuggestions()}

          {/* Content Editor */}
          <div className="flex-1 p-8 relative bg-black">
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start writing or type '/' for commands..."
              className="w-full h-full bg-transparent border-none outline-none text-white placeholder-gray-500 resize-none text-lg leading-relaxed font-light"
              style={{ minHeight: '600px', fontFamily: 'inherit' }}
            />

            {/* Slash Menu */}
            <AnimatePresence>
              {showSlashMenu && (
                <motion.div
                  className="absolute top-20 left-8 bg-black border border-gray-800 rounded-2xl shadow-2xl p-2 z-20 min-w-80"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                >
                  {slashCommands.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setShowSlashMenu(false)}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-gray-900 rounded-xl transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-purple-500/20">
                        <item.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.label}</div>
                        <div className="text-sm text-gray-400">{item.description}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Toolbar */}
            <div className="fixed bottom-8 right-8">
              <div className="bg-black border border-gray-800 rounded-2xl p-2 flex items-center space-x-1 shadow-2xl">
                <button className="p-3 hover:bg-gray-900 rounded-xl transition-colors">
                  <Bold className="w-4 h-4 text-white" />
                </button>
                <button className="p-3 hover:bg-gray-900 rounded-xl transition-colors">
                  <Italic className="w-4 h-4 text-white" />
                </button>
                <button className="p-3 hover:bg-gray-900 rounded-xl transition-colors">
                  <Underline className="w-4 h-4 text-white" />
                </button>
                <div className="w-px h-6 bg-gray-800 mx-2" />
                <button className="p-3 hover:bg-gray-900 rounded-xl transition-colors">
                  <Link className="w-4 h-4 text-white" />
                </button>
                <button className="p-3 hover:bg-gray-900 rounded-xl transition-colors">
                  <Code className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="w-96 bg-black border-l border-gray-900 flex flex-col"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Enhanced chat header */}
              <div className="p-6 border-b border-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">Feynman AI</span>
                    {aiEnabled && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {aiEnabled 
                    ? "Your personal AI tutor ready to help with any topic or question about your notes."
                    : "AI features are currently unavailable. Some functionality may be limited."
                  }
                </p>
                {wsConnected && (
                  <div className="mt-2 flex items-center space-x-2 text-xs text-blue-400">
                    <Wifi className="w-3 h-3" />
                    <span>Real-time assistance active</span>
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
                    <h3 className="font-semibold text-lg mb-2 text-white">Start a conversation!</h3>
                    <p className="text-sm text-gray-400 mb-6">Ask me anything about your notes or any topic you're studying</p>
                    <div className="space-y-2 text-left">
                      <button 
                        onClick={() => setChatInput("Explain this concept in simple terms")}
                        className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors text-sm text-left text-white"
                      >
                        "Explain this concept in simple terms"
                      </button>
                      <button 
                        onClick={() => setChatInput("Give me practice questions")}
                        className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors text-sm text-left text-white"
                      >
                        "Give me practice questions"
                      </button>
                      <button 
                        onClick={() => setChatInput("Create a study plan for this topic")}
                        className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors text-sm text-left text-white"
                      >
                        "Create a study plan for this topic"
                      </button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-purple-600 text-white'
                            : `bg-gray-900 text-gray-100 border border-gray-800 ${
                                message.error ? 'border-red-500' : ''
                              }`
                        }`}
                      >
                        {message.content}
                        {message.confidence && message.confidence < 0.7 && (
                          <div className="mt-2 text-xs text-yellow-400">
                            Low confidence response
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Enhanced Chat Input */}
              <div className="p-6 border-t border-gray-900 bg-black">
                <div className="flex space-x-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask Feynman anything..."
                    disabled={!aiEnabled}
                    className="flex-1 p-4 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500 text-white disabled:opacity-50"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || !aiEnabled || aiLoading}
                    className="p-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg border border-purple-500"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>Ctrl + \ to toggle</span>
                  <span>Enter to send</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PageEditor;