// src/hooks/useAI.js - FIXED VERSION
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
      
      // Extract noteIds from context, pass null if empty or not provided
      const noteIds = context.noteIds && context.noteIds.length > 0 ? context.noteIds : null;
      
      // Call aiService with correct parameters (already handles backend format)
      const response = await aiService.askQuestion(
        question, 
        noteIds,  // Will be null if no valid noteIds
        context.includeRecent !== false  // Default to true
      );
      
      // aiService already returns the correct format
      return { 
        success: response.success !== false, 
        answer: response.answer,
        ...response 
      };
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message, 
        answer: '' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (limit = 5) => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.getSuggestions(limit);
      return { success: true, ...response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message, suggestions: [] };
    } finally {
      setLoading(false);
    }
  };

  const analyzeNotes = async (noteIds, analysisType = 'general') => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.analyzeNotes(noteIds, analysisType);
      return { success: true, ...response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Quiz generation
  const generateQuiz = async (noteId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.generateQuiz(
        noteId,
        options.difficulty || 'progressive',
        options.numQuestions || 5,
        options.topic || null
      );
      
      return { success: true, ...response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Content transformation
  const transformContent = async (noteId, action, content, specificQuery = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.transformContent(
        noteId,
        action,
        content,
        specificQuery
      );
      
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
    analyzeNotes,
    generateQuiz,      // ✅ NEW
    transformContent,  // ✅ NEW
    checkAIStatus
  };
}