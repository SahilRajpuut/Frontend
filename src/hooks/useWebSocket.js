// src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/websocketService';
import { useAuth } from './useAuth';

export function useWebSocket() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [typingAssistance, setTypingAssistance] = useState(null);
  const connectAttempted = useRef(false);

  useEffect(() => {
    if (user && !connectAttempted.current) {
      connectAttempted.current = true;
      
      // Set up event listeners
      websocketService.on('connected', () => setConnected(true));
      websocketService.on('disconnected', () => setConnected(false));
      
      websocketService.on('aiSuggestion', (suggestion) => {
        setAiSuggestions(prev => [suggestion, ...prev.slice(0, 9)]); // Keep latest 10
      });
      
      websocketService.on('typingAssistance', (assistance) => {
        setTypingAssistance(assistance);
      });

      // Connect
      websocketService.connect(user.id);

      // Cleanup on unmount
      return () => {
        websocketService.disconnect();
        setConnected(false);
        connectAttempted.current = false;
      };
    }
  }, [user]);

  const requestAnalysis = (content, noteId) => {
    return websocketService.requestAnalysis(content, noteId);
  };

  const sendQuestion = (question, context) => {
    return websocketService.sendQuestion(question, context);
  };

  const sendTypingActivity = (content, cursorPosition) => {
    return websocketService.sendTypingActivity(content, cursorPosition);
  };

  return {
    connected,
    aiSuggestions,
    typingAssistance,
    requestAnalysis,
    sendQuestion,
    sendTypingActivity,
    clearSuggestions: () => setAiSuggestions([]),
    clearTypingAssistance: () => setTypingAssistance(null)
  };
}