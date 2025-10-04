// src/hooks/useNote.js (Updated with optimistic updates to fix title bug)
import { useState, useEffect, useCallback } from 'react';
import notesService from '../services/notesService';

export function useNote(noteId) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadNote = useCallback(async () => {
    if (!noteId || noteId === 'new') return;
    
    try {
      setLoading(true);
      setError(null);
      const noteData = await notesService.getNote(noteId);
      setNote(noteData);
    } catch (err) {
      console.error('Failed to load note:', err);
      setError(err.message);
      
      if (err.message === 'Note not found') {
        setError('This note no longer exists or you don\'t have access to it.');
      }
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (noteId && noteId !== 'new') {
      loadNote();
    } else if (noteId === 'new') {
      // Initialize empty note for new notes
      setNote({
        id: 'new',
        title: '',
        content: '',
        summary: null,
        tags: [],
        category: 'General',
        priority: 'medium',
        status: 'draft',
        is_favorite: false
      });
    }
  }, [noteId, loadNote]);

  const saveNote = async (updates) => {
    try {
      setSaving(true);
      setError(null);
      
      // --- FIX: Optimistic UI Update ---
      // We immediately update the local state with the changes.
      setNote(prev => ({ ...prev, ...updates }));
      
      let savedNote;
      
      if (noteId === 'new' || !note?.id || note.id === 'new') {
        // Creating new note
        const response = await notesService.createNote(updates);
        savedNote = response.note || response;
        // After creating, update the note with the real ID from the backend
        setNote(savedNote); 
      } else {
        // Updating existing note
        // We send the update, but we no longer need the response to update the UI,
        // as we already did so optimistically.
        savedNote = await notesService.updateNote(noteId, updates);
      }

      return { success: true, note: savedNote };
    } catch (err) {
      console.error('Failed to save note:', err);
      setError(err.message);
      // OPTIONAL: Here you could add logic to revert the note to its previous state on failure.
      return { success: false, error: err.message };
    } finally {
      // Add a slight delay to allow the 'Saving...' status to be visible before clearing.
      setTimeout(() => setSaving(false), 500); 
    }
  };
  
  const autoSave = async (updates) => {
    // Only auto-save if we have a real note ID (not 'new')
    if (!note?.id || note.id === 'new') {
      console.log('Skipping auto-save for new note');
      return;
    }

    try {
      setSaving(true); // <--- START: Show the saving indicator
      
      // --- FIX: Optimistic UI Update for Auto-Save ---
      // 1. Immediately update the local state with the new title/content.
      setNote(prev => ({ ...prev, ...updates }));

      // 2. Send the update to the server in the background.
      // We don't wait for the response or use it to update state, preventing the overwrite bug.
      await notesService.updateNote(note.id, updates);

    } catch (err) {
      console.error('Auto-save failed:', err);
      setError('Auto-save failed. Your latest changes might not be saved.');
      // NOTE: We don't revert on auto-save failure, as it could be jarring for the user.
      // We just show an error.
    } finally {
      // Add a slight delay to allow the 'Saving...' status to be visible.
      setTimeout(() => setSaving(false), 500); // <--- END: Hide after a short delay
    }
  };

  const createNewNote = async (initialData = {}) => {
    try {
      setSaving(true);
      setError(null);
      
      const newNoteData = {
        title: 'New Note',
        content: '',
        summary: null,
        tags: [],
        category: 'General',
        priority: 'medium',
        status: 'draft',
        is_favorite: false,
        ...initialData 
      };
      
      const response = await notesService.createNote(newNoteData);
      const createdNote = response.note || response;
      
      setNote(createdNote);
      return { success: true, note: createdNote };
    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setTimeout(() => setSaving(false), 500); 
    }
  };

  const deleteNote = async (permanent = false) => {
    if (!note?.id || note.id === 'new') {
      return { success: false, error: 'No note to delete' };
    }

    try {
      setSaving(true);
      setError(null);
      
      await notesService.deleteNote(note.id, permanent);
      
      setNote(null);
      
      return { success: true };
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    note,
    loading,
    error,
    saving,
    saveNote,
    autoSave,
    createNewNote,
    deleteNote,
    clearError,
    refetch: loadNote,
    isNewNote: noteId === 'new' || !note?.id || note.id === 'new',
    hasUnsavedChanges: false 
  };
}