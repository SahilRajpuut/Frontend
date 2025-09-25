// src/services/aiService.js
class AIService {
  constructor() {
    this.isEnabled = false;
    this.checkAIStatus();
  }

  // Check if AI features are available
  async checkAIStatus() {
    try {
      // For now, AI is disabled (will connect to backend later)
      this.isEnabled = false;
      return { enabled: false, message: "AI features will be enabled when backend is connected" };
    } catch (error) {
      console.error('AI status check failed:', error);
      this.isEnabled = false;
      return { enabled: false };
    }
  }

  // Ask AI a question with context
  async askQuestion(question, contextNoteIds = null, includeRecent = true) {
    try {
      if (!this.isEnabled) {
        return {
          answer: "AI features are currently not available. This is a demo response to your question: " + question,
          context_used: [],
          confidence: 0.5,
          sources: [],
          timestamp: new Date().toISOString()
        };
      }

      // This will connect to backend later
      return {
        answer: "I'm currently unable to process your question. Please check your connection and try again.",
        error: "AI service not connected",
        context_used: [],
        confidence: 0,
        sources: [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI question failed:', error);
      
      return {
        answer: "I'm currently unable to process your question. Please check your connection and try again.",
        error: error.message,
        context_used: [],
        confidence: 0,
        sources: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get proactive AI suggestions
  async getSuggestions(limit = 5) {
    try {
      if (!this.isEnabled) {
        return this.getFallbackSuggestions();
      }

      // This will connect to backend later
      return this.getFallbackSuggestions();
    } catch (error) {
      console.error('AI suggestions failed:', error);
      return this.getFallbackSuggestions();
    }
  }

  // Analyze notes using AI
  async analyzeNotes(noteIds, analysisType = 'general') {
    try {
      if (!this.isEnabled) {
        throw new Error('AI analysis is not available');
      }

      // This will connect to backend later
      return {
        analysis: {
          type: analysisType,
          note_count: noteIds.length,
          status: 'error',
          message: 'Analysis temporarily unavailable'
        },
        insights: [
          `Selected ${noteIds.length} notes for analysis`,
          'AI analysis is currently unavailable'
        ],
        recommendations: [
          'Try again later when AI services are restored',
          'Review your notes manually for key themes'
        ],
        summary: 'Analysis could not be completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      return {
        analysis: {
          type: analysisType,
          note_count: noteIds.length,
          status: 'error',
          message: 'Analysis temporarily unavailable'
        },
        insights: [
          `Selected ${noteIds.length} notes for analysis`,
          'AI analysis is currently unavailable'
        ],
        recommendations: [
          'Try again later when AI services are restored',
          'Review your notes manually for key themes'
        ],
        summary: 'Analysis could not be completed',
        timestamp: new Date().toISOString()
      };
    }
  }

  // === FALLBACK METHODS ===

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
        }
      ],
      total: 3,
      generated_at: new Date().toISOString(),
      categories: {
        study: [{ text: 'Review your recent notes and identify key concepts' }],
        review: [{ text: 'Create a summary of your latest journal entry' }],
        practice: [{ text: 'Practice explaining concepts in your own words' }],
        explore: []
      }
    };
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;