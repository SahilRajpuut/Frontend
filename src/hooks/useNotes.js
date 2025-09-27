// src/hooks/useNotes.js
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
      const newNote = await notesService.createNote(noteData);
      setNotes(prev => [newNote, ...prev]);
      return { success: true, note: newNote };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateNote = async (noteId, updates) => {
    try {
      const updatedNote = await notesService.updateNote(noteId, updates);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      return { success: true, note: updatedNote };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteNote = async (noteId, permanent = false) => {
    try {
      await notesService.deleteNote(noteId, permanent);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      return { success: true };
    } catch (err) {
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

  const deleteFolder = async (folderId) => {
    try {
      await notesService.deleteFolder(folderId);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const moveNoteToFolder = async (noteId, folderId) => {
    try {
      const result = await notesService.moveNoteToFolder(noteId, folderId);
      
      // Update local state
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