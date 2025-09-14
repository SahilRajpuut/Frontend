import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Home, Video, Inbox, Crown, Plus, FileText, 
  ChevronDown, Grid, List, Bell, Users, Share2, MoreHorizontal,
  FolderPlus, Sparkles
} from 'lucide-react';

const Dashboard = ({ onOpenPage, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  
  const [journals] = useState([
    { id: '1', title: 'Physics Notes', content: 'Quantum mechanics and thermodynamics...', date: 'Oct 15, 2024', shared: false },
    { id: '2', title: 'Math Studies', content: 'Calculus and linear algebra concepts...', date: 'Oct 12, 2024', shared: true },
    { id: '3', title: 'AI Research', content: 'Machine learning algorithms and neural networks...', date: 'Oct 10, 2024', shared: false },
  ]);

  const sidebarItems = [
    { icon: Home, label: 'Home', key: 'home', active: true },
    { icon: Video, label: 'Video Vault', key: 'videos' },
    { icon: Inbox, label: 'Inbox', key: 'inbox', badge: 3 },
  ];

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <motion.div 
        className="w-72 bg-black border-r border-gray-900 flex flex-col"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* User Profile */}
        <div className="p-6 border-b border-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-lg font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">Hi, {user?.name || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">{user?.plan || 'Free'}</span>
                <Crown className="w-3 h-3 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search journals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500 text-white"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.key}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${
                item.active 
                  ? 'bg-gray-900 border border-purple-500/50 shadow-lg' 
                  : 'hover:bg-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-purple-400' : 'text-gray-400'}`} />
              <span className={`font-medium ${item.active ? 'text-white' : 'text-gray-300'}`}>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-purple-500 text-xs px-2 py-1 rounded-full font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}

          {/* Your Journals Section */}
          <div className="mt-8 mb-4">
            <div className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-gray-400">
              <span>Your Journals</span>
              <button 
                onClick={() => onOpenPage('new')}
                className="hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {journals.slice(0, 3).map((journal) => (
              <motion.button
                key={journal.id}
                onClick={() => onOpenPage(journal.id)}
                className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
              >
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-300 truncate">{journal.title}</span>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Upgrade Section */}
        <div className="p-4 border-t border-gray-900">
          <motion.button
            className="w-full p-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all duration-300 flex items-center justify-center space-x-2 font-semibold shadow-lg text-white border border-amber-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade to Pro</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Header */}
        <motion.header 
          className="bg-black border-b border-gray-900"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-7 h-7 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Home</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Tab Filters */}
              <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'shared', label: 'Shared' },
                  { key: 'owned', label: 'Mine' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                      activeTab === tab.key
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button className="p-3 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800 relative">
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="flex-1 p-8 bg-black">
          {/* Folders Section */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <span>Folders</span>
                <span className="bg-gray-900 text-sm px-3 py-1 rounded-full border border-gray-800">0</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create Folder */}
              <motion.button
                className="h-40 bg-gray-900 border-2 border-dashed border-purple-500/50 rounded-2xl hover:border-purple-500 hover:bg-gray-800 transition-all duration-300 flex flex-col items-center justify-center space-y-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FolderPlus className="w-10 h-10 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-purple-400 transition-colors font-medium">
                  Create Folder
                </span>
              </motion.button>
            </div>
          </motion.section>

          {/* Journals Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <span>Journals</span>
                <span className="bg-gray-900 text-sm px-3 py-1 rounded-full border border-gray-800">{journals.length}</span>
              </h2>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {/* Create Journal */}
              <motion.button
                onClick={() => onOpenPage('new')}
                className={`bg-gray-900 border-2 border-dashed border-purple-500/50 rounded-2xl hover:border-purple-500 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group ${
                  viewMode === 'grid' ? 'h-56 flex-col space-y-4' : 'h-20 space-x-4 px-6'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText className="w-10 h-10 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-gray-400 group-hover:text-purple-400 transition-colors font-medium">
                  Create Journal
                </span>
              </motion.button>

              {/* Existing Journals */}
              {journals.map((journal, index) => (
                <motion.div
                  key={journal.id}
                  className={`bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all duration-300 cursor-pointer group border border-gray-800 ${
                    viewMode === 'grid' ? 'h-56 p-6' : 'h-20 px-6 flex items-center'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onOpenPage(journal.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {viewMode === 'grid' ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 mb-4">
                        <div className="h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl mb-4 flex items-center justify-center border border-purple-500/20">
                          <FileText className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 truncate text-lg">{journal.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2
                        }}>{journal.content}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {journal.shared && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-green-400" />
                              <span className="text-xs text-green-400">Shared</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">{journal.date}</span>
                        </div>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-800 rounded-lg"
                        >
                          <Share2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 w-full">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-purple-500/20">
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{journal.title}</h3>
                        <p className="text-sm text-gray-400">{journal.date}</p>
                      </div>
                      {journal.shared && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Shared</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {journals.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-300 mb-3">Ready to start learning?</h3>
                <p className="text-gray-400 mb-8 text-lg">Create your first journal and let our AI tutor help you learn faster</p>
                <button
                  onClick={() => onOpenPage('new')}
                  className="px-8 py-4 bg-black border-2 border-purple-600 rounded-xl hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg text-white"
                >
                  Create Your First Journal
                </button>
              </motion.div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;