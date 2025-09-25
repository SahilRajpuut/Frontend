// src/hooks/useNotes.js
import { useState, useEffect, useCallback } from 'react';
import notesService from '../services/notesService';

export function useNotes(initialParams = {}) {
  const [notes, setNotes] = useState([]);
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

  useEffect(() => {
    loadNotes();
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

  const deleteNote = async (noteId) => {
    try {
      await notesService.deleteNote(noteId);
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

  return {
    notes,
    loading,
    error,
    pagination,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    refetch: () => loadNotes(params)
  };
}