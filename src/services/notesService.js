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
        const response = await apiClient.getNotes(params);
        
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
        return this.getLocalNotes(params);
      }
    } catch (error) {
      console.error('Failed to get notes:', error);
      return this.getLocalNotes(params);
    }
  }

  // Get single note by ID
  async getNote(noteId) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.getNote(noteId);
        
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
        return this.getLocalNote(noteId);
      }
    } catch (error) {
      console.error('Failed to get note:', error);
      throw error;
    }
  }

  // Create new note
  async createNote(noteData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const backendData = {
          title: noteData.title || 'New Journal',
          content: noteData.content || '',
          summary: noteData.summary || null,
          tags: noteData.tags || [],
          category: noteData.category || 'General',
          priority: noteData.priority || 'medium',
          is_public: noteData.shared || false,
          is_favorite: noteData.isFavorite || false,
          folder_id: noteData.folder_id || null
        };
        
        const response = await apiClient.createNote(backendData);
        const responseNoteData = response.note || response;
        
        const transformedNote = {
          id: responseNoteData.id.toString(),
          title: responseNoteData.title,
          content: responseNoteData.content,
          date: new Date(responseNoteData.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: responseNoteData.is_public || false,
          createdAt: responseNoteData.created_at,
          updatedAt: responseNoteData.updated_at,
          tags: responseNoteData.tags || [],
          category: responseNoteData.category || 'General',
          priority: responseNoteData.priority || 'medium',
          isFavorite: responseNoteData.is_favorite || false,
          folder_id: responseNoteData.folder_id || null
        };
        
        return transformedNote;
      } else {
        return this.createLocalNote(noteData);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  }

  // Update existing note
  async updateNote(noteId, noteData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
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
        const responseNoteData = response.note || response;
        
        const transformedNote = {
          id: responseNoteData.id.toString(),
          title: responseNoteData.title,
          content: responseNoteData.content,
          date: new Date(responseNoteData.updated_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: responseNoteData.is_public || false,
          createdAt: responseNoteData.created_at,
          updatedAt: responseNoteData.updated_at,
          tags: responseNoteData.tags || [],
          category: responseNoteData.category || 'General',
          priority: responseNoteData.priority || 'medium',
          isFavorite: responseNoteData.is_favorite || false,
          folder_id: responseNoteData.folder_id || null
        };
        
        return transformedNote;
      } else {
        return this.updateLocalNote(noteId, noteData);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  }

  // Rename note
  async renameNote(noteId, newTitle) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.renameNote(noteId, newTitle);
        const responseNoteData = response.note || response;
        
        return {
          id: responseNoteData.id.toString(),
          title: responseNoteData.title,
          content: responseNoteData.content,
          date: new Date(responseNoteData.updated_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          shared: responseNoteData.is_public || false,
          createdAt: responseNoteData.created_at,
          updatedAt: responseNoteData.updated_at,
          tags: responseNoteData.tags || [],
          category: responseNoteData.category || 'General',
          priority: responseNoteData.priority || 'medium',
          isFavorite: responseNoteData.is_favorite || false,
          folder_id: responseNoteData.folder_id || null
        };
      } else {
        return this.updateLocalNote(noteId, { title: newTitle });
      }
    } catch (error) {
      console.error('Failed to rename note:', error);
      throw error;
    }
  }

  // Delete note
  async deleteNote(noteId, permanent = false) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        await apiClient.deleteNote(noteId, permanent);
        return true;
      } else {
        return this.deleteLocalNote(noteId);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  }

  // Search notes
  async searchNotes(query, limit = 10) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.searchNotes(query, limit);
        
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
        return await apiClient.getNoteStats();
      } else {
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
        const response = await apiClient.getFolders();
        
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
        return this.getLocalFolders();
      }
    } catch (error) {
      console.error('Failed to get folders:', error);
      return this.getLocalFolders();
    }
  }

  // Get folder contents
  async getFolderContents(folderId) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.getFolderContents(folderId);
        
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
          folder: response.folder,
          notes: transformedNotes,
          subfolders: response.subfolders || [],
          total_notes: response.total_notes || 0,
          total_subfolders: response.total_subfolders || 0
        };
      } else {
        return this.getLocalFolderContents(folderId);
      }
    } catch (error) {
      console.error('Failed to get folder contents:', error);
      throw error;
    }
  }

  // Create new folder
  async createFolder(folderData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const backendData = {
          name: folderData.name,
          parent_id: folderData.parent_id || null
        };
        
        const response = await apiClient.createFolder(backendData);
        const responseFolderData = response.folder || response;
        
        return {
          id: responseFolderData.id.toString(),
          name: responseFolderData.name,
          parent_id: responseFolderData.parent_id,
          note_count: 0,
          created_at: new Date(responseFolderData.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          updated_at: responseFolderData.updated_at
        };
      } else {
        return this.createLocalFolder(folderData);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  // Update existing folder
  async updateFolder(folderId, folderData) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.updateFolder(folderId, folderData);
        const responseFolderData = response.folder || response;
        
        return {
          id: responseFolderData.id.toString(),
          name: responseFolderData.name,
          parent_id: responseFolderData.parent_id,
          note_count: responseFolderData.note_count || 0,
          created_at: new Date(responseFolderData.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          updated_at: responseFolderData.updated_at
        };
      } else {
        return this.updateLocalFolder(folderId, folderData);
      }
    } catch (error) {
      console.error('Failed to update folder:', error);
      throw error;
    }
  }

  // Rename folder
  async renameFolder(folderId, newName) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        const response = await apiClient.renameFolder(folderId, newName);
        const responseFolderData = response.folder || response;
        
        return {
          id: responseFolderData.id.toString(),
          name: responseFolderData.name,
          parent_id: responseFolderData.parent_id,
          note_count: responseFolderData.note_count || 0,
          created_at: new Date(responseFolderData.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          updated_at: responseFolderData.updated_at
        };
      } else {
        return this.updateLocalFolder(folderId, { name: newName });
      }
    } catch (error) {
      console.error('Failed to rename folder:', error);
      throw error;
    }
  }

  // Delete folder
  async deleteFolder(folderId, moveNotesTo = null) {
    try {
      const token = localStorage.getItem('noteflow_token');
      
      if (token && !token.startsWith('demo_')) {
        await apiClient.deleteFolder(folderId, moveNotesTo);
        return true;
      } else {
        return this.deleteLocalFolder(folderId);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  }

  // Move note to folder
  async moveNoteToFolder(noteId, folderId) {
    try {
      const token = localStorage.getItem('noteflow_token');
       
       if (token && !token.startsWith('demo_')) {
        const response = await apiClient.updateNote(noteId, { folder_id: folderId });
        return { success: true, note: response.note || response };
      } else {
        const result = this.moveLocalNoteToFolder(noteId, folderId);
        return { success: result };
      }
    } catch (error) {
      console.error('Failed to move note to folder:', error);
      throw error;
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

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      notes = notes.filter(note => 
        note.title?.toLowerCase().includes(searchTerm) ||
        note.content?.toLowerCase().includes(searchTerm)
      );
    }

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
    throw new Error('Note not found');
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
    
    throw new Error('Note not found');
  }

  deleteLocalNote(noteId) {
    const journals = this.getJournals();
    if (journals[noteId]) {
      delete journals[noteId];
      localStorage.setItem('noteflow_journals', JSON.stringify(journals));
      return true;
    }
    throw new Error('Note not found');
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

  getLocalFolderContents(folderId) {
    const journals = this.getJournals();
    const folders = this.getLocalFolders();
    
    const notes = Object.values(journals)
      .filter(note => note.folder_id === folderId)
      .map(note => ({
        ...note,
        date: new Date(note.createdAt || Date.now()).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      }));
    
    const subfolders = folders.filter(f => f.parent_id === folderId);
    const folder = folderId ? folders.find(f => f.id === folderId) : null;
    
    return {
      folder,
      notes,
      subfolders,
      total_notes: notes.length,
      total_subfolders: subfolders.length
    };
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
    
    throw new Error('Folder not found');
  }

  deleteLocalFolder(folderId) {
    const folders = this.getLocalFolders();
    const filteredFolders = folders.filter(f => f.id !== folderId);
    
    if (filteredFolders.length !== folders.length) {
      localStorage.setItem('noteflow_folders', JSON.stringify(filteredFolders));
      return true;
    }
    throw new Error('Folder not found');
  }

  moveLocalNoteToFolder(noteId, folderId) {
    const journals = this.getJournals();
    if (journals[noteId]) {
      journals[noteId].folder_id = folderId;
      localStorage.setItem('noteflow_journals', JSON.stringify(journals));
      return true;
    }
    throw new Error('Note not found');
  }

  getJournals() {
    const journals = localStorage.getItem('noteflow_journals');
    return journals ? JSON.parse(journals) : {};
  }
}

// Export singleton instance
const notesService = new NotesService();
export default notesService;