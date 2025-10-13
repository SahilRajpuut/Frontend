// src/services/aiService.js - ENHANCED WITH QUIZ METHODS
class AIService {
  constructor() {
    this.isEnabled = false;
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.checkAIStatus();
  }

  getAuthToken() {
    return localStorage.getItem('noteflow_token') || sessionStorage.getItem('noteflow_token');
  }

  async apiCall(endpoint, method = 'GET', body = null) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      console.error('API Error:', error);
      throw new Error(error.detail || JSON.stringify(error) || 'API request failed');
    }

    return response.json();
  }

  async checkAIStatus() {
    try {
      const response = await this.apiCall('/ai/status');
      this.isEnabled = response.enabled;
      console.log('✅ AI Service Status:', response.enabled ? 'ENABLED' : 'DISABLED');
      return response;
    } catch (error) {
      console.error('❌ AI status check failed:', error);
      this.isEnabled = false;
      return { enabled: false, error: error.message };
    }
  }

  async askQuestion(question, contextNoteIds = null, includeRecent = true) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return {
          answer: "Please log in to use AI features",
          error: "Not authenticated",
          context_used: 0,
          confidence: 0,
          sources: [],
          timestamp: new Date().toISOString(),
          success: false
        };
      }

      const requestBody = {
        question: question,
        context_note_ids: contextNoteIds,
        include_recent: includeRecent
      };

      console.log('🤖 Sending AI request:', requestBody);
      const response = await this.apiCall('/ai/ask', 'POST', requestBody);
      
      return {
        answer: response.response,
        context_used: response.context_used,
        confidence: response.confidence || 0.8,
        sources: response.sources || [],
        timestamp: response.timestamp,
        model: response.model,
        success: response.success !== false
      };

    } catch (error) {
      console.error('❌ AI question failed:', error);
      
      return {
        answer: `Failed to get AI response: ${error.message}`,
        error: error.message,
        context_used: 0,
        confidence: 0,
        sources: [],
        timestamp: new Date().toISOString(),
        success: false
      };
    }
  }

  async getSuggestions(limit = 5) {
    try {
      const response = await this.apiCall(`/ai/suggestions?limit=${limit}`);
      
      return {
        suggestions: response.suggestions.map(s => ({
          id: s.id,
          text: s.description || s.title || s.text,
          title: s.title,
          description: s.description,
          category: s.type || s.category,
          priority: s.priority,
          timestamp: s.timestamp,
          source: s.source
        })),
        total: response.total,
        generated_at: response.generated_at,
        success: true
      };
    } catch (error) {
      console.error('❌ AI suggestions failed:', error);
      return {
        suggestions: this.getFallbackSuggestions().suggestions,
        total: 0,
        error: error.message,
        success: false
      };
    }
  }

  async analyzeNotes(noteIds, analysisType = 'general') {
    try {
      const response = await this.apiCall('/ai/analyze', 'POST', {
        note_ids: noteIds,
        analysis_type: analysisType
      });
      
      return {
        analysis: response.analysis,
        insights: response.insights,
        recommendations: response.recommendations,
        timestamp: response.timestamp,
        success: true
      };
    } catch (error) {
      console.error('❌ Note analysis failed:', error);
      return {
        analysis: {},
        insights: [],
        recommendations: [],
        error: error.message,
        success: false
      };
    }
  }

  // ✅ NEW: Contextual Quiz Generation
  async generateContextualQuiz(noteId, contextQuery = null, numQuestions = 5) {
    try {
      const response = await this.apiCall('/ai/quiz/generate', 'POST', {
        note_id: noteId,
        difficulty: 'progressive',
        num_questions: numQuestions,
        topic: null,
        quiz_type: 'contextual',
        context_query: contextQuery
      });
      
      return {
        success: response.success,
        quiz: response.quiz,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Contextual quiz generation failed:', error);
      throw error;
    }
  }

  // ✅ NEW: Comprehensive Quiz Generation
  async generateComprehensiveQuiz(noteId, topic = null, numQuestions = 15) {
    try {
      const response = await this.apiCall('/ai/quiz/generate', 'POST', {
        note_id: noteId,
        difficulty: 'progressive',
        num_questions: numQuestions,
        topic: topic,
        quiz_type: 'comprehensive',
        context_query: null
      });
      
      return {
        success: response.success,
        quiz: response.quiz,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Comprehensive quiz generation failed:', error);
      throw error;
    }
  }

  // ✅ NEW: Content transformation method
  async transformContent(noteId, action, content, specificQuery = null) {
    try {
      const response = await this.apiCall('/ai/notes/ai-transform', 'POST', {
        note_id: noteId,
        action: action,
        content: content,
        specific_query: specificQuery
      });
      
      return {
        success: response.success,
        transformed_content: response.transformed_content,
        original_action: response.original_action,
        timestamp: response.timestamp
      };
    } catch (error) {
      console.error(`❌ Content ${action} failed:`, error);
      throw error;
    }
  }

  // ✅ NEW: Get quiz attempts history
  async getQuizAttempts(quizId, limit = 10) {
    try {
      const response = await this.apiCall(`/quiz/attempts/${quizId}?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get quiz attempts:', error);
      throw error;
    }
  }

  // ✅ NEW: Get quiz statistics
  async getQuizStats(quizId) {
    try {
      const response = await this.apiCall(`/quiz/${quizId}/stats`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get quiz stats:', error);
      throw error;
    }
  }

  getFallbackSuggestions() {
    return {
      suggestions: [
        {
          id: '1',
          text: 'Review your recent notes and identify key concepts',
          category: 'study',
          priority: 'high'
        },
        {
          id: '2',
          text: 'Create a summary of your latest journal entry',
          category: 'review',
          priority: 'medium'
        },
        {
          id: '3',
          text: 'Practice explaining concepts in your own words',
          category: 'practice',
          priority: 'medium'
        },
        {
          id: '4',
          text: 'Generate a quiz to test your understanding',
          category: 'practice',
          priority: 'high'
        }
      ],
      total: 4,
      generated_at: new Date().toISOString()
    };
  }
}

const aiService = new AIService();
export default aiService;