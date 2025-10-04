// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  BookOpen, Search, Home, Video, Inbox, Crown, Plus, FileText, 
  ChevronDown, Grid, List, Bell, Users, Share2, MoreHorizontal,
  FolderPlus, Sparkles, Wifi, WifiOff, Loader2, X, Folder,
  HelpCircle, Trash2, ChevronRight, Edit3, Move, User, Save,
  AlertTriangle, Check
} from 'lucide-react';
import notesService from '../services/notesService';

// Import hooks
import { useNotes } from '../hooks/useNotes';
import { useWebSocket } from '../hooks/useWebSocket';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  const buttonColors = {
    danger: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
    warning: 'from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800',
    info: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 min-w-[400px] max-w-[500px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 bg-gradient-to-r ${buttonColors[type]} rounded-lg transition-all text-white font-medium`}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Update Status Toast Component
const UpdateStatusToast = ({ isVisible, status, onClose }) => {
  useEffect(() => {
    if (isVisible && status === 'success') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, status, onClose]);

  if (!isVisible) return null;

  const statusConfig = {
    saving: { icon: Save, color: 'blue', message: 'Saving changes...' },
    success: { icon: Check, color: 'green', message: 'Changes saved successfully!' },
    error: { icon: AlertTriangle, color: 'red', message: 'Failed to save changes' }
  };

  const config = statusConfig[status];
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed top-4 right-4 bg-gray-900 border border-${config.color}-500 rounded-lg p-4 flex items-center space-x-3 z-50 shadow-lg`}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
      >
        <config.icon className={`w-5 h-5 text-${config.color}-400`} />
        <span className="text-white font-medium">{config.message}</span>
        {status !== 'saving' && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Title Input Modal Component
const TitleInputModal = ({ isOpen, onClose, onSubmit, title, setTitle, error, setError, submitLabel = "Create Note" }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 min-w-[400px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Enter Note Title</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
                placeholder="Enter a unique title..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none text-white"
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <div className="flex space-x-3 justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={!title.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Folder Creation Modal Component
const FolderModal = ({ isOpen, onClose, onCreateFolder, folders = [] }) => {
  const [folderName, setFolderName] = useState('');
  const [parentFolder, setParentFolder] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder({
        name: folderName.trim(),
        parent_id: parentFolder || null
      });
      setFolderName('');
      setParentFolder('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 min-w-[400px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Create New Folder</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none text-white"
                autoFocus
              />
            </div>
            
            {folders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parent Folder (Optional)
                </label>
                <select
                  value={parentFolder}
                  onChange={(e) => setParentFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none text-white"
                >
                  <option value="">No parent folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex space-x-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!folderName.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium"
              >
                Create Folder
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Create Modal Component
const CreateModal = ({ isOpen, onClose, onCreateJournal, onCreateFolder }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          className="bg-gray-900 rounded-xl p-6 border border-gray-800 min-w-[300px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Create New</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                onCreateJournal();
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FileText className="w-6 h-6 text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-white">Journal</div>
                <div className="text-sm text-gray-400">Create a new journal page</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                onCreateFolder();
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Folder className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <div className="font-medium text-white">Folder</div>
                <div className="text-sm text-gray-400">Organize your pages</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Page Actions Dropdown Component
const PageActionsDropdown = ({ isOpen, onClose, onRename, onMove, onTrash, position }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40" onClick={onClose}>
        <motion.div
          className="absolute bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2 min-w-[160px]"
          style={{ 
            left: position.x, 
            top: position.y,
            transform: 'translateY(-100%)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onRename}
            className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 text-left transition-colors"
          >
            <Edit3 className="w-4 h-4 text-gray-400" />
            <span className="text-white">Rename</span>
          </button>
          
          <button
            onClick={onMove}
            className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 text-left transition-colors"
          >
            <Move className="w-4 h-4 text-gray-400" />
            <span className="text-white">Move to</span>
          </button>
          
          <button
            onClick={onTrash}
            className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 text-left transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="text-red-400">Move to Trash</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Upgrade Modal Component
const UpgradeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'NoteFlow Lite',
      price: '₹149',
      period: 'Per month',
      features: [
        'Unlimited journals and chats',
        '3 image generations',
        '1 video generation / day',
        '2 notes transcriptions / day',
        '2 flashcard & practice problems / day',
        '5 AI grading sessions / week',
        '7 day version history'
      ],
      buttonText: 'Get Lite',
      buttonColor: 'from-purple-600 to-purple-700',
      popular: false
    },
    {
      name: 'NoteFlow Plus',
      price: '₹499',
      period: 'Per month',
      features: [
        'Unlimited journals and chats',
        'Unlimited image generations',
        '3 video generations / day',
        '5 notes transcriptions / day',
        '5 flashcard & practice problems / day',
        '5 AI grading sessions / week',
        '30 day version history',
        'Video Vault'
      ],
      buttonText: 'Get Plus',
      buttonColor: 'from-blue-600 to-blue-700',
      popular: true
    },
    {
      name: 'NoteFlow Max',
      price: '₹999',
      period: 'Per month',
      features: [
        'Real-time, proactive AI tutor',
        'Unlimited image & video generations',
        'Unlimited notes transcriptions',
        'Unlimited flashcard & practice problems',
        'Unlimited AI grading sessions',
        'Unlimited version history'
      ],
      buttonText: 'Get Max',
      buttonColor: 'from-green-600 to-green-700',
      popular: false
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-gray-900 rounded-xl border border-gray-800 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`bg-gray-800 rounded-xl p-6 border relative ${
                    plan.popular ? 'border-blue-500' : 'border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-sm px-4 py-1 rounded-full font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white mb-1">{plan.price}</div>
                    <div className="text-gray-400">{plan.period}</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all bg-gradient-to-r ${plan.buttonColor} hover:opacity-90`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Dashboard = ({ onOpenPage, user }) => {
    const navigate = useNavigate();
     const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [pageActionsDropdown, setPageActionsDropdown] = useState({ 
    isOpen: false, 
    pageId: null, 
    itemType: 'note',
    position: { x: 0, y: 0 } 
  });
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null });
  const [updateStatus, setUpdateStatus] = useState({ isVisible: false, status: 'saving' });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  
  // New states for title input
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  
  // Rename modal state
  const [renameModal, setRenameModal] = useState({ isOpen: false, noteId: null, currentTitle: '' });
  
  // Folder rename state
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  
  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderContents, setFolderContents] = useState({});
  const [loadingFolder, setLoadingFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
const { 
  notes: journals, 
  folders,
  loading, 
  error, 
  searchNotes, 
  refetch,
  createNote,
  updateNote,
  deleteNote,
  createFolder,
  deleteFolder, 
  moveNoteToFolder
} = useNotes();
  
  const { 
    connected: wsConnected, 
    aiSuggestions 
  } = useWebSocket();

  const sidebarItems = [
    { icon: Home, label: 'Home', key: 'home', active: true },
    { icon: Video, label: 'Video Vault', key: 'videos' },
    { icon: Inbox, label: 'Inbox', key: 'inbox' },
  ];

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        refetch();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = async (query) => {
    if (query.trim()) {
      await searchNotes(query);
    } else {
      refetch();
    }
  };
  const handleSignOut = async () => {
  try {
    console.log('Signing out...');
    setIsUserDropdownOpen(false); // Close dropdown immediately
    
    // Call logout from useAuth hook - this handles backend API call
    await logout();
    
    // Clear local storage (logout should already do this, but be explicit)
    localStorage.removeItem('noteflow_token');
    localStorage.removeItem('noteflow_user');
    
    console.log('Signed out successfully');
    
    // Navigation will happen automatically via App.jsx routing
    // because user state is now null and isAuthenticated is false
    
  } catch (error) {
    console.error('Error signing out:', error);
    
    // Even if logout fails, clear local data and force navigation
    localStorage.removeItem('noteflow_token');
    localStorage.removeItem('noteflow_user');
    navigate('/', { replace: true });
  }
};
  const getLastSavedText = () => {
    if (!user?.updated_at) return 'Never';
    
    const now = new Date();
    const updatedAt = new Date(user.updated_at);
    const diffInMs = now - updatedAt;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };


  // Load folder contents when folder is selected
  const loadFolderContents = async (folderId) => {
    setLoadingFolder(true);
    try {
      const data = await notesService.getFolderContents(folderId);
      setFolderContents(prev => ({
        ...prev,
        [folderId]: data
      }));
      setCurrentFolderId(folderId);
    } catch (error) {
      console.error('Failed to load folder contents:', error);
      setUpdateStatus({ isVisible: true, status: 'error' });
    } finally {
      setLoadingFolder(false);
    }
  };

  // Navigate to folder
  const handleOpenFolder = (folderId) => {
    loadFolderContents(folderId);
  };

  // Navigate back to root
  const handleBackToRoot = () => {
    setCurrentFolderId(null);
    setFolderContents({});
    refetch();
  };

  // Toggle folder expansion
  const toggleFolderExpansion = async (folderId) => {
    const newExpandedFolders = new Set(expandedFolders);
    
    if (newExpandedFolders.has(folderId)) {
      newExpandedFolders.delete(folderId);
    } else {
      newExpandedFolders.add(folderId);
      if (!folderContents[folderId]) {
        try {
          const contents = await notesService.getFolderContents(folderId);
          setFolderContents(prev => ({
            ...prev,
            [folderId]: contents
          }));
        } catch (error) {
          console.error('Error loading folder contents:', error);
          setUpdateStatus({ isVisible: true, status: 'error' });
        }
      }
    }
    
    setExpandedFolders(newExpandedFolders);
  };

  // Updated handleCreateNote to create in current folder
  const handleCreateNote = () => {
    setNewNoteTitle('');
    setTitleError('');
    setIsTitleModalOpen(true);
  };

  // New function to create note with title (with folder support)
  const handleCreateNoteWithTitle = async () => {
    if (!newNoteTitle.trim()) {
      setTitleError('Title cannot be empty');
      return;
    }

    try {
      setUpdateStatus({ isVisible: true, status: 'saving' });
      
      const newNote = await notesService.createNote({
        title: newNoteTitle.trim(),
        content: '',
        category: 'General',
        priority: 'medium',
        shared: false,
        folder_id: currentFolderId // Create in current folder
      });
      
      console.log('Created new note:', newNote);
      
      setUpdateStatus({ isVisible: true, status: 'success' });
      setIsTitleModalOpen(false);
      
      // Refresh folder contents if inside a folder
      if (currentFolderId) {
        loadFolderContents(currentFolderId);
      } else {
        refetch();
      }
      
      onOpenPage(newNote.id);
      
    } catch (error) {
      console.error('Failed to create new journal:', error);
      
      // Check if it's a duplicate title error
      if (error.response?.data?.detail?.includes('already exists')) {
        setTitleError(error.response.data.detail);
      } else if (error.message?.includes('already exists')) {
        setTitleError(error.message);
      } else {
        setTitleError('Failed to create note. Please try again.');
      }
      
      setUpdateStatus({ isVisible: true, status: 'error' });
    }
  };

  const handleCreateFolder = async (folderData) => {
    try {
      setUpdateStatus({ isVisible: true, status: 'saving' });
      
      const result = await createFolder(folderData);
      
      if (result.success) {
        setUpdateStatus({ isVisible: true, status: 'success' });
        refetch();
      } else {
        setUpdateStatus({ isVisible: true, status: 'error' });
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      setUpdateStatus({ isVisible: true, status: 'error' });
    }
  };

  const handleUpdateNote = async (noteId, updateData) => {
    try {
      setUpdateStatus({ isVisible: true, status: 'saving' });
      
      const result = await updateNote(noteId, updateData);
      
      if (result.success) {
        setUpdateStatus({ isVisible: true, status: 'success' });
        refetch();
      } else {
        setUpdateStatus({ isVisible: true, status: 'error' });
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      setUpdateStatus({ isVisible: true, status: 'error' });
    }
  };

  const handleDeleteNote = async (noteId, permanent = false) => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: permanent ? 'Permanently Delete Note' : 'Move to Trash',
      message: permanent 
        ? 'This action cannot be undone. The note will be permanently deleted.'
        : 'Are you sure you want to move this note to trash?',
      onConfirm: async () => {
        try {
          setUpdateStatus({ isVisible: true, status: 'saving' });
          
          const result = await deleteNote(noteId, permanent);
          
          if (result.success) {
            setUpdateStatus({ isVisible: true, status: 'success' });
            
            // Refresh based on current view
            if (currentFolderId) {
              loadFolderContents(currentFolderId);
            } else {
              refetch();
            }
          } else {
            setUpdateStatus({ isVisible: true, status: 'error' });
          }
        } catch (error) {
          console.error('Failed to delete note:', error);
          setUpdateStatus({ isVisible: true, status: 'error' });
        } finally {
          setConfirmationModal({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null });
        }
      }
    });
  };

  // Note rename handler
  const handleRename = (noteId, currentTitle) => {
    setRenameModal({ isOpen: true, noteId, currentTitle });
    setTitleError('');
    setPageActionsDropdown({ isOpen: false, pageId: null, itemType: 'note', position: { x: 0, y: 0 } });
  };

  // Note rename submit handler
  const handleRenameSubmit = async () => {
    if (!renameModal.currentTitle.trim()) {
      setTitleError('Title cannot be empty');
      return;
    }

    try {
      setUpdateStatus({ isVisible: true, status: 'saving' });
      
      await notesService.renameNote(renameModal.noteId, renameModal.currentTitle.trim());
      
      setUpdateStatus({ isVisible: true, status: 'success' });
      setRenameModal({ isOpen: false, noteId: null, currentTitle: '' });
      setTitleError('');
      
      // Refresh based on current view
      if (currentFolderId) {
        loadFolderContents(currentFolderId);
      } else {
        refetch();
      }
      
    } catch (error) {
      console.error('Failed to rename note:', error);
      if (error.message.includes('already exists')) {
        setTitleError(error.message);
      } else {
        setTitleError('Failed to rename note. Please try again.');
      }
      setUpdateStatus({ isVisible: true, status: 'error' });
    }
  };

  // Folder rename handler
  const handleRenameFolder = (folderId, currentName) => {
    setRenamingFolderId(folderId);
    setRenameFolderName(currentName);
    setTitleError('');
    setPageActionsDropdown({ isOpen: false, pageId: null, itemType: 'note', position: { x: 0, y: 0 } });
  };

  // Folder rename submit handler
  const handleRenameFolderSubmit = async () => {
    if (!renameFolderName.trim()) {
      setTitleError('Folder name cannot be empty');
      return;
    }

    try {
      setUpdateStatus({ isVisible: true, status: 'saving' });
      
      await notesService.renameFolder(renamingFolderId, renameFolderName.trim());
      
      setUpdateStatus({ isVisible: true, status: 'success' });
      setRenamingFolderId(null);
      setRenameFolderName('');
      setTitleError('');
      
      refetch();
      
    } catch (error) {
      console.error('Failed to rename folder:', error);
      if (error.message.includes('already exists')) {
        setTitleError(error.message);
      } else {
        setTitleError('Failed to rename folder. Please try again.');
      }
      setUpdateStatus({ isVisible: true, status: 'error' });
    }
  };

  const handlePageActions = (event, pageId, action, itemType = 'note') => {
    event.stopPropagation();
    
    if (action === 'menu') {
      const rect = event.currentTarget.getBoundingClientRect();
      setPageActionsDropdown({
        isOpen: true,
        pageId,
        itemType,
        position: {
          x: rect.left,
          y: rect.top
        }
      });
    }
  };

  const handlePageAction = (action, pageId, itemType = 'note') => {
    setPageActionsDropdown({ isOpen: false, pageId: null, itemType: 'note', position: { x: 0, y: 0 } });
    
    switch (action) {
      case 'rename':
        if (itemType === 'folder') {
          const folder = folders.find(f => f.id === pageId);
          if (folder) {
            handleRenameFolder(pageId, folder.name);
          }
        } else {
          const note = journals.find(j => j.id === pageId);
          if (note) {
            handleRename(pageId, note.title);
          }
        }
        break;
      case 'move':
        console.log('Move:', itemType, pageId);
        break;
      case 'trash':
        if (itemType === 'folder') {
          handleDeleteFolder(pageId);
        } else {
          handleDeleteNote(pageId, false);
        }
        break;
      default:
        break;
    }
  };

  const handleDeleteFolder = async (folderId) => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Folder',
      message: 'Are you sure you want to delete this folder? All notes in this folder will be moved to the root level.',
      onConfirm: async () => {
        try {
          setUpdateStatus({ isVisible: true, status: 'saving' });
          
          const result = await deleteFolder(folderId, null);
          
          if (result.success) {
            setUpdateStatus({ isVisible: true, status: 'success' });
            refetch();
          } else {
            setUpdateStatus({ isVisible: true, status: 'error' });
          }
        } catch (error) {
          console.error('Failed to delete folder:', error);
          setUpdateStatus({ isVisible: true, status: 'error' });
        } finally {
          setConfirmationModal({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null });
        }
      }
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (e, item, type) => {
    console.log('Drag started:', { item, type });
    setDraggedItem({ ...item, type });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag enter folder:', folderId);
    setDragOverFolder(folderId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      console.log('Drag leave folder');
      setDragOverFolder(null);
    }
  };

  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop event:', { draggedItem, targetFolderId });
    setDragOverFolder(null);
    
    if (draggedItem && draggedItem.type === 'note') {
      try {
        setUpdateStatus({ isVisible: true, status: 'saving' });
        console.log('Moving note to folder:', draggedItem.id, 'to', targetFolderId);
        
        const result = await moveNoteToFolder(String(draggedItem.id), targetFolderId ? String(targetFolderId) : null);
        
        if (result.success) {
          setUpdateStatus({ isVisible: true, status: 'success' });
          
          // Refresh based on current view
          if (currentFolderId) {
            loadFolderContents(currentFolderId);
          } else {
            refetch();
          }
        } else {
          console.error('Move failed:', result.error);
          setUpdateStatus({ isVisible: true, status: 'error' });
        }
      } catch (error) {
        console.error('Failed to move note:', error);
        setUpdateStatus({ isVisible: true, status: 'error' });
      }
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  // Filter notes based on active tab AND current folder view
  const filteredJournals = currentFolderId === null 
    ? journals.filter(journal => {
        // Only show notes that are NOT in any folder (folder_id is null)
        if (journal.folder_id !== null) return false;
        
        if (activeTab === 'shared') return journal.shared;
        if (activeTab === 'owned') return !journal.shared;
        return true;
      })
    : []; // If inside a folder, use folderContents.notes instead

  // Get display notes - either filtered journals or folder contents
  const displayNotes = currentFolderId !== null && folderContents[currentFolderId]
    ? folderContents[currentFolderId].notes.filter(note => {
        if (activeTab === 'shared') return note.shared;
        if (activeTab === 'owned') return !note.shared;
        return true;
      })
    : filteredJournals;

  return (
    <div className="min-h-screen bg-black flex">
      <UpdateStatusToast
        isVisible={updateStatus.isVisible}
        status={updateStatus.status}
        onClose={() => setUpdateStatus({ isVisible: false, status: 'saving' })}
      />

      {/* Sidebar */}
      <motion.div 
        className="w-1/5 bg-black border-r border-gray-900 flex flex-col h-screen fixed left-0 top-0 z-10"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* User Profile - Top */}
        <div className="p-4 border-b border-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-white text-sm truncate">Hi, {user?.name || 'User'}</span>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-2 py-1 bg-teal-500 hover:bg-teal-600 rounded-md text-white text-xs font-medium transition-colors flex items-center space-x-1"
            >
              <span>Create</span>
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search journals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-500 text-white text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 overflow-hidden">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.key}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 mb-1 text-sm ${
                item.active 
                  ? 'bg-gray-900 border border-purple-500/50 shadow-lg' 
                  : 'hover:bg-gray-900'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <item.icon className={`w-4 h-4 ${item.active ? 'text-purple-400' : 'text-gray-400'}`} />
              <span className={`font-medium truncate ${item.active ? 'text-white' : 'text-gray-300'}`}>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-purple-500 text-xs px-1.5 py-0.5 rounded-full font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}

          {/* Your Pages Section */}
          <div className="mt-6 mb-3 relative">
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-gray-400">
              <button
                onClick={() => setIsPagesDropdownOpen(!isPagesDropdownOpen)}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <span>Your Pages</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isPagesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {isPagesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={handleCreateNote}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-gray-900 transition-colors text-left text-teal-400 hover:text-teal-300"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-xs font-medium">New Page</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="px-3 py-1.5">
                <div className="flex items-center space-x-1.5 text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Loading...</span>
                </div>
              </div>
            ) : (
              journals.slice(0, 3).map((journal) => (
                <motion.div
                  key={journal.id}
                  className="flex items-center group"
                  whileHover={{ scale: 1.01 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, journal, 'note')}
                  onDragEnd={handleDragEnd}
                >
                  <button
                    onClick={() => onOpenPage(journal.id)}
                    className="flex-1 flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-gray-900 transition-colors text-left min-w-0"
                  >
                    <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-300 truncate">{journal.title}</span>
                  </button>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                    <button
                      onClick={handleCreateNote}
                      className="p-0.5 hover:bg-gray-800 rounded"
                    >
                      <Plus className="w-2.5 h-2.5 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => handlePageActions(e, journal.id, 'menu')}
                      className="p-0.5 hover:bg-gray-800 rounded"
                    >
                      <MoreHorizontal className="w-2.5 h-2.5 text-gray-400" />
                    </button>
                    <ChevronRight className="w-2.5 h-2.5 text-gray-400 ml-0.5" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-900 space-y-1 bg-black flex-shrink-0">
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-900 transition-colors text-left"
          >
            <Crown className="w-4 h-4 text-teal-400" />
            <span className="text-white font-medium text-sm">Upgrade</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-900 transition-colors text-left">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Quick Guide</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-900 transition-colors text-left">
            <Trash2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Trash</span>
          </button>
          
          <div className="relative pb-1">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-900 transition-colors text-left"
            >
              <User className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium text-sm truncate block">{user?.name || 'User'}</span>
                <div className="text-xs text-gray-400">{user?.plan || 'Free'}</div>
              </div>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isUserDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1"
                >
                  <div className="px-3 py-1.5 border-b border-gray-800">
                    <div className="text-xs text-white font-medium truncate">{user?.email || 'user@example.com'}</div>
                    <div className="text-xs text-gray-400">Last saved {getLastSavedText()}</div>
                  </div>
                  <button  onClick={() => {
    setIsUserDropdownOpen(false);
    navigate('/profile-settings');
    // Navigate to profile settings page
  }} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
                    Profile Settings
                  </button>
                  <button   onClick={() => {
                    setIsUserDropdownOpen(false);
                    handleSignOut();
                  }} className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="w-4/5 ml-[20%] min-h-screen bg-black">
        <motion.header 
          className="bg-black border-b border-gray-900 sticky top-0 z-5"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentFolderId !== null && (
                <button
                  onClick={handleBackToRoot}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-purple-400 transform rotate-180" />
                </button>
              )}
              <BookOpen className="w-7 h-7 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">
                {currentFolderId !== null && folderContents[currentFolderId]?.folder 
                  ? folderContents[currentFolderId].folder.name 
                  : 'Home'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
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
                {aiSuggestions.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </motion.header>

        <div className="p-8 min-h-screen overflow-y-auto">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 mb-6">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={refetch}
                className="text-sm text-purple-400 hover:text-purple-300 mt-2"
              >
                Try again
              </button>
            </div>
          )}

          {aiSuggestions.length > 0 && (
            <motion.div
              className="mb-8 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">AI Suggestions</h3>
              <div className="space-y-2">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="text-sm text-gray-300 bg-black/20 rounded-lg p-3">
                    {suggestion.text || suggestion.content}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Folders Section - Only show if at root level */}
          {currentFolderId === null && (
            <motion.section 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span>Folders</span>
                  <span className="bg-gray-900 text-sm px-3 py-1 rounded-full border border-gray-800">
                    {folders?.length || 0}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <motion.button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="h-40 bg-gray-900 border-2 border-dashed border-purple-500/50 rounded-2xl hover:border-purple-500 hover:bg-gray-800 transition-all duration-300 flex flex-col items-center justify-center space-y-3 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FolderPlus className="w-10 h-10 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  <span className="text-gray-400 group-hover:text-purple-400 transition-colors font-medium">
                    Create Folder
                  </span>
                </motion.button>

                {folders?.map((folder) => (
                  <motion.div
                    key={folder.id}
                    className="relative"
                  >
                    {/* Main Folder Card */}
                    <motion.div
                      onClick={() => !renamingFolderId && handleOpenFolder(folder.id)}
                      className={`h-40 bg-gray-900 rounded-2xl border transition-all duration-300 cursor-pointer group p-6 relative ${
                        dragOverFolder === folder.id 
                          ? 'border-purple-500 bg-purple-900/20 scale-105' 
                          : 'border-gray-800 hover:bg-gray-800'
                      } ${renamingFolderId === folder.id ? 'ring-2 ring-purple-500' : ''}`}
                      whileHover={{ scale: renamingFolderId !== folder.id && dragOverFolder !== folder.id ? 1.02 : 1 }}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, folder.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, folder.id)}
                    >
                      <div className="h-full flex flex-col">
                        <div className="flex-1 mb-4">
                          <div className="h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl mb-4 flex items-center justify-center border border-blue-500/20 relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFolderExpansion(folder.id);
                              }}
                              className="absolute top-2 left-2 p-1.5 hover:bg-gray-800 rounded-lg transition-colors z-10"
                            >
                              {expandedFolders.has(folder.id) ? (
                                <ChevronDown className="w-4 h-4 text-blue-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-blue-400" />
                              )}
                            </button>
                            <Folder className="w-8 h-8 text-blue-400" />
                          </div>
                          
                          {renamingFolderId === folder.id ? (
                            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={renameFolderName}
                                onChange={(e) => {
                                  setRenameFolderName(e.target.value);
                                  if (titleError) setTitleError('');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRenameFolderSubmit();
                                  } else if (e.key === 'Escape') {
                                    setRenamingFolderId(null);
                                    setRenameFolderName('');
                                    setTitleError('');
                                  }
                                }}
                                className="w-full px-2 py-1 bg-gray-800 border border-purple-500 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                autoFocus
                              />
                              {titleError && (
                                <p className="text-red-400 text-xs">{titleError}</p>
                              )}
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleRenameFolderSubmit}
                                  className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs font-medium transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingFolderId(null);
                                    setRenameFolderName('');
                                    setTitleError('');
                                  }}
                                  className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold text-white truncate text-lg">{folder.name}</h3>
                              <p className="text-sm text-gray-400">
                                {folder.note_count || 0} notes
                              </p>
                            </>
                          )}
                        </div>
                        
                        {!renamingFolderId && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{folder.created_at}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePageActions(e, folder.id, 'menu','folder');

                                  }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-800 rounded-lg"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {dragOverFolder === folder.id && draggedItem && (
                        <div className="absolute inset-0 border-2 border-purple-500 border-dashed rounded-2xl bg-purple-500/10 flex items-center justify-center pointer-events-none">
                          <div className="text-purple-400 font-medium">Drop here</div>
                        </div>
                      )}
                    </motion.div>

                    {/* Expanded Folder Contents */}
                    <AnimatePresence>
                      {expandedFolders.has(folder.id) && folderContents[folder.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 ml-6 pl-4 border-l-2 border-gray-800 space-y-2"
                        >
                          {folderContents[folder.id].notes?.map((note) => (
                            <motion.div
                              key={note.id}
                              onClick={() => onOpenPage(note.id)}
                              className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 cursor-pointer transition-colors group flex items-center space-x-3"
                              whileHover={{ scale: 1.01 }}
                            >
                              <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                              <span className="text-white text-sm flex-1 truncate">{note.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePageActions(e, note.id, 'menu', 'note');
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </button>
                            </motion.div>
                          ))}
                          {(!folderContents[folder.id].notes || folderContents[folder.id].notes.length === 0) && (
                            <div className="text-gray-500 text-sm italic p-3">No notes in this folder</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Journals Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <span>Journals</span>
                <span className="bg-gray-900 text-sm px-3 py-1 rounded-full border border-gray-800">
                  {displayNotes.length}
                </span>
              </h2>
            </div>

            {(loading || loadingFolder) && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading your journals...</p>
              </div>
            )}

            {!loading && !loadingFolder && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                <motion.button
                  onClick={() => setIsCreateModalOpen(true)}
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

                {displayNotes.map((journal, index) => (
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
                    draggable
                    onDragStart={(e) => handleDragStart(e, journal, 'note')}
                    onDragEnd={handleDragEnd}
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
                            <span className="text-xs text-gray-500">{journal.date || journal.created_at}</span>
                          </div>
                          <button
                            onClick={(e) => handlePageActions(e, journal.id, 'menu')}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-800 rounded-lg"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
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
                          <p className="text-sm text-gray-400">{journal.date || journal.created_at}</p>
                        </div>
                        {journal.shared && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">Shared</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => handlePageActions(e, journal.id, 'menu')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-800 rounded-lg"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && !loadingFolder && displayNotes.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-300 mb-3">
                  {currentFolderId !== null ? 'This folder is empty' : 'Ready to start learning?'}
                </h3>
                <p className="text-gray-400 mb-8 text-lg">
                  {currentFolderId !== null 
                    ? 'Create your first note in this folder or drag notes here'
                    : 'Create your first journal and let our AI tutor help you learn faster'}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-8 py-4 bg-black border-2 border-purple-600 rounded-xl hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg text-white"
                >
                  {currentFolderId !== null ? 'Create Note in Folder' : 'Create Your First Journal'}
                </button>
              </motion.div>
            )}
          </motion.section>
        </div>
      </div>

      {/* Modals */}
      <CreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateJournal={handleCreateNote}
        onCreateFolder={() => setIsFolderModalOpen(true)}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
        folders={folders}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <PageActionsDropdown
        isOpen={pageActionsDropdown.isOpen}
        onClose={() => setPageActionsDropdown({ isOpen: false, pageId: null, itemType: 'note', position: { x: 0, y: 0 } })}
        onRename={() => handlePageAction('rename', pageActionsDropdown.pageId, pageActionsDropdown.itemType || 'note')}
        onMove={() => handlePageAction('move', pageActionsDropdown.pageId, pageActionsDropdown.itemType || 'note')}
        onTrash={() => handlePageAction('trash', pageActionsDropdown.pageId, pageActionsDropdown.itemType || 'note')}
        position={pageActionsDropdown.position}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: null })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
      />

      {/* Title Input Modal for Creating Notes */}
      <TitleInputModal
        isOpen={isTitleModalOpen}
        onClose={() => {
          setIsTitleModalOpen(false);
          setNewNoteTitle('');
          setTitleError('');
        }}
        onSubmit={handleCreateNoteWithTitle}
        title={newNoteTitle}
        setTitle={setNewNoteTitle}
        error={titleError}
        setError={setTitleError}
        submitLabel="Create Note"
      />

      {/* Title Input Modal for Renaming Notes */}
      <TitleInputModal
        isOpen={renameModal.isOpen}
        onClose={() => {
          setRenameModal({ isOpen: false, noteId: null, currentTitle: '' });
          setTitleError('');
        }}
        onSubmit={handleRenameSubmit}
        title={renameModal.currentTitle}
        setTitle={(newTitle) => setRenameModal({ ...renameModal, currentTitle: newTitle })}
        error={titleError}
        setError={setTitleError}
        submitLabel="Rename"
      />
    </div>
  );
};

export default Dashboard;