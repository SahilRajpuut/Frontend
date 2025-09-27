// src/services/notesService.js
import apiClient from '../utils/apiClient';

class NotesService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get all notes with pagination and filtering
  async getNotes(params = {}) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Get from backend
        const response = await apiClient.getNotes(params);
        
        // Transform backend notes to match frontend journal format
        const transformedNotes = response.notes?.map(note => ({
          id: note.id.toString(),
          title: note.title,
          content: note.content,
          date: new Date(note.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: note.is_public || false,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          tags: note.tags || [],
          category: note.category || 'General',
          priority: note.priority || 'medium',
          isFavorite: note.is_favorite || false,
          folder_id: note.folder_id || null
        })) || [];

        return {
          notes: transformedNotes,
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1,
          hasNext: response.has_next || false,
          hasPrev: response.has_prev || false
        };
      } else {
        // Use localStorage for demo mode
        return this.getLocalNotes(params);
      }
    } catch (error) {
      console.error('Failed to get notes:', error);
      // Fallback to localStorage
      return this.getLocalNotes(params);
    }
  }

  // Get single note by ID
  async getNote(noteId) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Get from backend
        const response = await apiClient.getNote(noteId);
        
        // Transform backend note to frontend format
        return {
          id: response.id.toString(),
          title: response.title,
          content: response.content,
          date: new Date(response.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: response.is_public || false,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
          tags: response.tags || [],
          category: response.category || 'General',
          priority: response.priority || 'medium',
          isFavorite: response.is_favorite || false,
          folder_id: response.folder_id || null
        };
      } else {
        // Get from localStorage
        return this.getLocalNote(noteId);
      }
    } catch (error) {
      console.error('Failed to get note:', error);
      return this.getLocalNote(noteId);
    }
  }

  // Create new note
  async createNote(noteData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Create via backend
        const backendData = {
          title: noteData.title,
          content: noteData.content,
          summary: noteData.summary || null,
          tags: noteData.tags || [],
          category: noteData.category || 'General',
          priority: noteData.priority || 'medium',
          is_public: noteData.shared || false,
          is_favorite: noteData.isFavorite || false,
          folder_id: noteData.folder_id || null
        };
        
        const response = await apiClient.createNote(backendData);
        
        // Transform response to frontend format
        return {
          id: response.note.id.toString(),
          title: response.note.title,
          content: response.note.content,
          date: new Date(response.note.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: response.note.is_public || false,
          createdAt: response.note.created_at,
          updatedAt: response.note.updated_at,
          tags: response.note.tags || [],
          category: response.note.category || 'General',
          priority: response.note.priority || 'medium',
          isFavorite: response.note.is_favorite || false,
          folder_id: response.note.folder_id || null
        };
      } else {
        // Create locally
        return this.createLocalNote(noteData);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      // Fallback to local creation
      return this.createLocalNote(noteData);
    }
  }

  // Update existing note
  async updateNote(noteId, noteData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Update via backend
        const backendData = {
          title: noteData.title,
          content: noteData.content,
          summary: noteData.summary || null,
          tags: noteData.tags || [],
          category: noteData.category || 'General',
          priority: noteData.priority || 'medium',
          is_public: noteData.shared || false,
          is_favorite: noteData.isFavorite || false,
          folder_id: noteData.folder_id || null
        };
        
        const response = await apiClient.updateNote(noteId, backendData);
        
        // Transform response to frontend format
        return {
          id: response.note.id.toString(),
          title: response.note.title,
          content: response.note.content,
          date: new Date(response.note.updated_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: response.note.is_public || false,
          createdAt: response.note.created_at,
          updatedAt: response.note.updated_at,
          tags: response.note.tags || [],
          category: response.note.category || 'General',
          priority: response.note.priority || 'medium',
          isFavorite: response.note.is_favorite || false,
          folder_id: response.note.folder_id || null
        };
      } else {
        // Update locally
        return this.updateLocalNote(noteId, noteData);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      // Fallback to local update
      return this.updateLocalNote(noteId, noteData);
    }
  }

  // Delete note
  async deleteNote(noteId, permanent = false) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Delete via backend
        await apiClient.deleteNote(noteId, permanent);
        return true;
      } else {
        // Delete locally
        return this.deleteLocalNote(noteId);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      // Fallback to local deletion
      return this.deleteLocalNote(noteId);
    }
  }

  // Search notes
  async searchNotes(query, limit = 10) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Search via backend
        const response = await apiClient.searchNotes(query, limit);
        
        // Transform results to frontend format
        return response.map(note => ({
          id: note.id.toString(),
          title: note.title,
          content: note.content,
          date: new Date(note.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: note.is_public || false,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
          tags: note.tags || [],
          category: note.category || 'General',
          priority: note.priority || 'medium',
          isFavorite: note.is_favorite || false,
          folder_id: note.folder_id || null
        }));
      } else {
        // Search locally
        return this.searchLocalNotes(query);
      }
    } catch (error) {
      console.error('Failed to search notes:', error);
      return this.searchLocalNotes(query);
    }
  }

  // Get note statistics
  async getNoteStats() {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Get stats from backend
        return await apiClient.getNoteStats();
      } else {
        // Calculate local stats
        return this.getLocalStats();
      }
    } catch (error) {
      console.error('Failed to get note stats:', error);
      return this.getLocalStats();
    }
  }

  // === FOLDER METHODS ===

  // Get all folders
  async getFolders() {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Get from backend
        const response = await apiClient.getFolders();
        
        // Transform backend folders to frontend format
        return response.map(folder => ({
          id: folder.id.toString(),
          name: folder.name,
          parent_id: folder.parent_id,
          note_count: folder.note_count || 0,
          created_at: new Date(folder.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          updated_at: folder.updated_at
        }));
      } else {
        // Get from localStorage
        return this.getLocalFolders();
      }
    } catch (error) {
      console.error('Failed to get folders:', error);
      return this.getLocalFolders();
    }
  }

  // Create new folder
  async createFolder(folderData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Create via backend
        const backendData = {
          name: folderData.name,
          parent_id: folderData.parent_id || null
        };
        
        const response = await apiClient.createFolder(backendData);
        
        // Transform response to frontend format
        return {
          id: response.folder.id.toString(),
          name: response.folder.name,
          parent_id: response.folder.parent_id,
          note_count: 0,
          created_at: new Date(response.folder.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          updated_at: response.folder.updated_at
        };
      } else {
        // Create locally
        return this.createLocalFolder(folderData);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      // Fallback to local creation
      return this.createLocalFolder(folderData);
    }
  }

  // Update existing folder
  async updateFolder(folderId, folderData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Update via backend
        const response = await apiClient.updateFolder(folderId, folderData);
        
        // Transform response to frontend format
        return {
          id: response.folder.id.toString(),
          name: response.folder.name,
          parent_id: response.folder.parent_id,
          note_count: response.folder.note_count || 0,
          created_at: new Date(response.folder.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          updated_at: response.folder.updated_at
        };
      } else {
        // Update locally
        return this.updateLocalFolder(folderId, folderData);
      }
    } catch (error) {
      console.error('Failed to update folder:', error);
      // Fallback to local update
      return this.updateLocalFolder(folderId, folderData);
    }
  }

  // Delete folder
  async deleteFolder(folderId) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Delete via backend
        await apiClient.deleteFolder(folderId);
        return true;
      } else {
        // Delete locally
        return this.deleteLocalFolder(folderId);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      // Fallback to local deletion
      return this.deleteLocalFolder(folderId);
    }
  }

  // Move note to folder
  async moveNoteToFolder(noteId, folderId) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        // Move via backend
        const response = await apiClient.updateNote(noteId, { folder_id: folderId });
        return response;
      } else {
        // Move locally
        return this.moveLocalNoteToFolder(noteId, folderId);
      }
    } catch (error) {
      console.error('Failed to move note to folder:', error);
      // Fallback to local move
      return this.moveLocalNoteToFolder(noteId, folderId);
    }
  }

  // === FALLBACK METHODS FOR LOCAL STORAGE ===

  getLocalNotes(params = {}) {
    const journals = this.getJournals();
    let notes = Object.values(journals).map(journal => ({
      ...journal,
      date: new Date(journal.createdAt || Date.now()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }));

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      notes = notes.filter(note => 
        note.title?.toLowerCase().includes(searchTerm) ||
        note.content?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedNotes = notes.slice(start, end);

    return {
      notes: paginatedNotes,
      total: notes.length,
      page: page,
      pages: Math.ceil(notes.length / perPage),
      hasNext: end < notes.length,
      hasPrev: page > 1
    };
  }

  getLocalNote(noteId) {
    const journals = this.getJournals();
    const note = journals[noteId];
    if (note) {
      return {
        ...note,
        date: new Date(note.createdAt || Date.now()).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      };
    }
    return null;
  }

  createLocalNote(noteData) {
    const id = Date.now().toString();
    const note = {
      id,
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      shared: noteData.shared || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      tags: noteData.tags || [],
      category: noteData.category || 'General',
      priority: noteData.priority || 'medium',
      isFavorite: noteData.isFavorite || false,
      folder_id: noteData.folder_id || null
    };

    const journals = this.getJournals();
    journals[id] = note;
    localStorage.setItem('noteflow_journals', JSON.stringify(journals));
    
    return note;
  }

  updateLocalNote(noteId, noteData) {
    const journals = this.getJournals();
    const existingNote = journals[noteId];
    
    if (existingNote) {
      const updatedNote = {
        ...existingNote,
        ...noteData,
        id: noteId,
        updatedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      };
      
      journals[noteId] = updatedNote;
      localStorage.setItem('noteflow_journals', JSON.stringify(journals));
      
      return updatedNote;
    }
    
    return null;
  }

  deleteLocalNote(noteId) {
    const journals = this.getJournals();
    if (journals[noteId]) {
      delete journals[noteId];
      localStorage.setItem('noteflow_journals', JSON.stringify(journals));
      return true;
    }
    return false;
  }

  searchLocalNotes(query) {
    const journals = this.getJournals();
    const searchTerm = query.toLowerCase();
    
    return Object.values(journals).filter(journal => 
      journal.title?.toLowerCase().includes(searchTerm) ||
      journal.content?.toLowerCase().includes(searchTerm)
    ).map(note => ({
      ...note,
      date: new Date(note.createdAt || Date.now()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }

  getLocalStats() {
    const journals = this.getJournals();
    const notes = Object.values(journals);
    
    return {
      total_notes: notes.length,
      notes_by_priority: {
        high: notes.filter(n => n.priority === 'high').length,
        medium: notes.filter(n => n.priority === 'medium').length,
        low: notes.filter(n => n.priority === 'low').length
      },
      total_words: notes.reduce((sum, note) => 
        sum + (note.content?.split(' ').length || 0), 0
      ),
      favorites: notes.filter(n => n.isFavorite).length,
      shared: notes.filter(n => n.shared).length
    };
  }

  // Local folder methods
  getLocalFolders() {
    const folders = localStorage.getItem('noteflow_folders');
    return folders ? JSON.parse(folders) : [];
  }

  createLocalFolder(folderData) {
    const id = Date.now().toString();
    const folder = {
      id,
      name: folderData.name,
      parent_id: folderData.parent_id || null,
      note_count: 0,
      created_at: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      updated_at: new Date().toISOString()
    };

    const folders = this.getLocalFolders();
    folders.push(folder);
    localStorage.setItem('noteflow_folders', JSON.stringify(folders));
    
    return folder;
  }

  updateLocalFolder(folderId, folderData) {
    const folders = this.getLocalFolders();
    const folderIndex = folders.findIndex(f => f.id === folderId);
    
    if (folderIndex !== -1) {
      const updatedFolder = {
        ...folders[folderIndex],
        ...folderData,
        updated_at: new Date().toISOString()
      };
      
      folders[folderIndex] = updatedFolder;
      localStorage.setItem('noteflow_folders', JSON.stringify(folders));
      
      return updatedFolder;
    }
    
    return null;
  }

  deleteLocalFolder(folderId) {
    const folders = this.getLocalFolders();
    const filteredFolders = folders.filter(f => f.id !== folderId);
    
    if (filteredFolders.length !== folders.length) {
      localStorage.setItem('noteflow_folders', JSON.stringify(filteredFolders));
      return true;
    }
    return false;
  }

  moveLocalNoteToFolder(noteId, folderId) {
    const journals = this.getJournals();
    if (journals[noteId]) {
      journals[noteId].folder_id = folderId;
      localStorage.setItem('noteflow_journals', JSON.stringify(journals));
      return true;
    }
    return false;
  }

  getJournals() {
    const journals = localStorage.getItem('noteflow_journals');
    return journals ? JSON.parse(journals) : {};
  }
}

// Export singleton instance
const notesService = new NotesService();
export default notesService;