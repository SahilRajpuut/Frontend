// src/services/websocketService.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.listeners = new Map();
    this.connected = false;
    this.user = null;
  }

  // Connect to WebSocket
  connect(userId = null) {
    try {
      const user = userId;
      const token = localStorage.getItem('noteflow_token');
      
      if (!user || !token || token.startsWith('demo_')) {
        console.log('WebSocket: Demo mode or no valid token, skipping connection');
        return false;
      }

      // For now, WebSocket is disabled (will connect to backend later)
      console.log('WebSocket: Connection will be enabled when backend is ready');
      return false;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      return false;
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.connected = false;
      this.user = null;
    }
  }

  // Send message to WebSocket
  send(message) {
    console.log('WebSocket: Demo mode - message not sent:', message);
    return false;
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit(event, data = null) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('WebSocket event callback error:', error);
        }
      });
    }
  }

  // AI-specific methods (demo implementations)
  requestAnalysis(content, noteId = null) {
    console.log('WebSocket: Analysis request (demo mode):', { content: content.substring(0, 50), noteId });
    return false;
  }

  requestSuggestions(context = {}) {
    console.log('WebSocket: Suggestions request (demo mode):', context);
    return false;
  }

  sendTypingActivity(content, cursorPosition = 0) {
    console.log('WebSocket: Typing activity (demo mode)');
    return false;
  }

  requestRelatedContent(noteId, content = '') {
    console.log('WebSocket: Related content request (demo mode):', { noteId });
    return false;
  }

  sendQuestion(question, context = {}) {
    console.log('WebSocket: Question sent (demo mode):', question);
    return false;
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.connected,
      readyState: this.ws?.readyState,
      user: this.user,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Utility method to check if WebSocket is supported
  static isSupported() {
    return 'WebSocket' in window;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;