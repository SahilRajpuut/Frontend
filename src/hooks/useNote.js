// src/hooks/useNote.js
import { useState, useEffect } from 'react';
import notesService from '../services/notesService';

export function useNote(noteId) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (noteId && noteId !== 'new') {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const noteData = await notesService.getNote(noteId);
      setNote(noteData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (updates) => {
    try {
      setSaving(true);
      setError(null);
      
      let savedNote;
      if (noteId === 'new' || !noteId) {
        savedNote = await notesService.createNote(updates);
      } else {
        savedNote = await notesService.updateNote(noteId, updates);
      }
      
      setNote(savedNote);
      return { success: true, note: savedNote };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const autoSave = async (updates) => {
    // Silent auto-save without loading states
    try {
      if (note?.id && note.id !== 'new') {
        await notesService.updateNote(note.id, updates);
        setNote(prev => ({ ...prev, ...updates }));
      }
    } catch (err) {
      // Silent failure for auto-save
      console.error('Auto-save failed:', err);
    }
  };

  return {
    note,
    loading,
    error,
    saving,
    saveNote,
    autoSave,
    refetch: loadNote
  };
}