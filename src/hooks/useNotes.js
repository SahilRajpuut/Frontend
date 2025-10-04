// src/hooks/useNotes.js (Updated with optimistic update fix)
import { useState, useEffect, useCallback } from 'react';
import notesService from '../services/notesService';

export function useNotes(initialParams = {}) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [params, setParams] = useState(initialParams);

  const loadNotes = useCallback(async (newParams = params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notesService.getNotes(newParams);
      setNotes(response.notes);
      setPagination({
        total: response.total,
        page: response.page,
        pages: response.pages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      });
      setParams(newParams);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const loadFolders = useCallback(async () => {
    try {
      const foldersData = await notesService.getFolders();
      setFolders(foldersData);
    } catch (err) {
      console.error('Failed to load folders:', err);
      // Don't set error state for folders to avoid disrupting main UI
    }
  }, []);

  useEffect(() => {
    loadNotes();
    loadFolders();
  }, []);

  const createNote = async (noteData) => {
    try {
      const response = await notesService.createNote(noteData);
      const newNote = response.note || response;
      
      setNotes(prev => [newNote, ...prev]);
      return { success: true, note: newNote };
    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ***************************************************************
  // FIX STARTS HERE: Applying the optimistic update logic
  // ***************************************************************
  const updateNote = async (noteId, updates) => {
    try {
      // 1. Optimistically update the UI with the user's changes immediately.
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      ));

      // 2. Send the update to the backend in the background.
      // We no longer use the response to update the state, which prevents the bug.
      const response = await notesService.updateNote(noteId, updates);
      const updatedNoteFromServer = response.note || response;
      
      // 3. (Optional but good practice) Re-sync with the final server response
      // to catch any backend-generated values like `updated_at`.
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNoteFromServer : note
      ));

      return { success: true, note: updatedNoteFromServer };
    } catch (err) {
      console.error('Failed to update note:', err);
      setError(err.message);
      // Here you could add logic to revert the change if the API call fails
      return { success: false, error: err.message };
    }
  };
  // ***************************************************************
  // FIX ENDS HERE
  // ***************************************************************

  const deleteNote = async (noteId, permanent = false) => {
    try {
      await notesService.deleteNote(noteId, permanent);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const searchNotes = async (query) => {
    try {
      setLoading(true);
      const results = await notesService.searchNotes(query);
      setNotes(results);
      setPagination({});
      return { success: true, results };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (folderData) => {
    try {
      const newFolder = await notesService.createFolder(folderData);
      setFolders(prev => [...prev, newFolder]);
      return { success: true, folder: newFolder };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateFolder = async (folderId, updates) => {
    try {
      const updatedFolder = await notesService.updateFolder(folderId, updates);
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId ? updatedFolder : folder
        )
      );
      return { success: true, folder: updatedFolder };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteFolder = async (folderId, moveNotesTo = null) => {
    try {
      await notesService.deleteFolder(folderId, moveNotesTo);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      
      if (moveNotesTo !== null) {
        await loadNotes();
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const moveNoteToFolder = async (noteId, folderId) => {
    try {
      await notesService.moveNoteToFolder(noteId, folderId);
      
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId 
            ? { ...note, folder_id: folderId }
            : note
        )
      );
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    notes,
    folders,
    loading,
    error,
    pagination,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    refetch: () => {
      loadNotes(params);
      loadFolders();
    }
  };
}