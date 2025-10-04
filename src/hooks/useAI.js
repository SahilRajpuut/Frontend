// src/hooks/useAI.js
import { useState, useEffect } from 'react';
import aiService from '../services/aiService';

export function useAI() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const status = await aiService.checkAIStatus();
      setIsEnabled(status.enabled);
    } catch (err) {
      setError(err.message);
      setIsEnabled(false);
    }
  };

  const askQuestion = async (question, context = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract noteIds from context, pass null if empty
      const noteIds = context.noteIds && context.noteIds.length > 0 ? context.noteIds : null;
      
      // Call aiService with correct parameters
      const response = await aiService.askQuestion(
        question, 
        noteIds,  // Will be null if no valid noteIds
        context.includeRecent !== false  // Default to true
      );
      
      return { success: true, ...response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message, answer: '' };
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (limit = 5) => {
    try {
      setLoading(true);
      const response = await aiService.getSuggestions(limit);
      return { success: true, ...response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const analyzeNotes = async (noteIds, analysisType = 'general') => {
    try {
      setLoading(true);
      const response = await aiService.analyzeNotes(noteIds, analysisType);
      return { success: true, ...response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    isEnabled,
    loading,
    error,
    askQuestion,
    getSuggestions,
    analyzeNotes
  };
}