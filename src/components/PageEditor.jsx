import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Lightbulb, MessageCircle, Share2, Brain, X, Send,
  Video, Image, BarChart, Quote, Code, Type, Bold, Italic, 
  Underline, Link
} from 'lucide-react';

const PageEditor = ({ pageId, onBack }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Journal');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [proactiveMode, setProactiveMode] = useState(true);
  
  const editorRef = useRef(null);

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

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you're asking about "${chatInput}". Based on your current notes, here's what I can help you with...`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  const slashCommands = [
    { icon: Video, label: 'Generate Video', description: 'Create educational video content' },
    { icon: Image, label: 'Generate Image', description: 'Create diagrams and illustrations' },
    { icon: BarChart, label: 'Generate Chart', description: 'Create data visualizations' },
    { icon: Quote, label: 'Quote Block', description: 'Add a formatted quote' },
    { icon: Code, label: 'Code Block', description: 'Add code snippet' },
    { icon: Type, label: 'Heading', description: 'Add section heading' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
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
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Auto-saved</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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
        {/* Editor */}
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* AI Suggestions Bar */}
          <AnimatePresence>
            {proactiveMode && (
              <motion.div
                className="px-6 py-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-gray-800"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-white">AI is analyzing your content for improvements...</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-purple-600 rounded-lg text-sm hover:bg-purple-500 transition-colors font-medium text-white">
                      View Suggestions
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

        {/* AI Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="w-96 bg-black border-l border-gray-900 flex flex-col"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">Feynman AI</span>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your personal AI tutor ready to help with any topic or question about your notes.
                </p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
                    <h3 className="font-semibold text-lg mb-2 text-white">Start a conversation!</h3>
                    <p className="text-sm text-gray-400 mb-6">Ask me anything about your notes or any topic you're studying</p>
                    <div className="space-y-2 text-left">
                      <button className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors text-sm text-left text-white">
                        "Explain this concept in simple terms"
                      </button>
                      <button className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors text-sm text-left text-white">
                        "Give me practice questions"
                      </button>
                      <button className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors text-sm text-left text-white">
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
                            : 'bg-gray-900 text-gray-100 border border-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-900 bg-black">
                <div className="flex space-x-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask Feynman anything..."
                    className="flex-1 p-4 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500 text-white"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim()}
                    className="p-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg border border-purple-500"
                  >
                    <Send className="w-5 h-5 text-white" />
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