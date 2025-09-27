// src/utils/apiClient.js
import axios from 'axios';

class ApiClient {
  constructor() {
    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('noteflow_token');
        if (token && !token.startsWith('demo_')) {
          // Only add real JWT tokens, not demo tokens
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method?.toUpperCase(), config.url, config.data); // Debug log
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url, response.data); // Debug log
        return response;
      },
      async (error) => {
        console.error('API Error:', error.response?.status, error.response?.data || error.message); // Debug log
        
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          // Clear invalid tokens and redirect to login
          this.clearAuth();
          window.location.reload();
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network error:', error.message);
          throw new Error('Network error - please check your connection and ensure backend is running on port 8000');
        }

        // Handle other HTTP errors
        const errorMessage = error.response.data?.detail || 
                           error.response.data?.message || 
                           `Request failed with status ${error.response.status}`;
        
        throw new Error(errorMessage);
      }
    );
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.client.post('/auth/login', {
      email,
      password
    });
    return response.data;
  }

  async register(email, password, name) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      confirm_password: password, // Backend requires this field
      name
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updateProfile(userData) {
    const response = await this.client.put('/auth/me', userData);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    this.clearAuth();
  }

  // Notes/Journals methods
  async getNotes(params = {}) {
    const response = await this.client.get('/notes/', { params });
    return response.data;
  }

  async getNote(noteId) {
    const response = await this.client.get(`/notes/${noteId}`);
    return response.data;
  }

  async createNote(noteData) {
    const response = await this.client.post('/notes/', noteData);
    return response.data;
  }

  async updateNote(noteId, noteData) {
    const response = await this.client.put(`/notes/${noteId}`, noteData);
    return response.data;
  }

  async deleteNote(noteId, permanent = false) {
    const response = await this.client.delete(`/notes/${noteId}?permanent=${permanent}`);
    return response.data;
  }

  async searchNotes(query, limit = 10) {
    const response = await this.client.get('/notes/search', {
      params: { q: query, limit }
    });
    return response.data;
  }

  async getNoteStats() {
    const response = await this.client.get('/notes/stats/overview');
    return response.data;
  }

  // Folder methods
  async getFolders() {
    const response = await this.client.get('/folders/');
    return response.data;
  }

  async getFolder(folderId) {
    const response = await this.client.get(`/folders/${folderId}`);
    return response.data;
  }

  async createFolder(folderData) {
    const response = await this.client.post('/folders/', folderData);
    return response.data;
  }

  async updateFolder(folderId, folderData) {
    const response = await this.client.put(`/folders/${folderId}`, folderData);
    return response.data;
  }

  async deleteFolder(folderId, moveNotesTo = null) {
    const params = moveNotesTo ? { move_notes_to: moveNotesTo } : {};
    const response = await this.client.delete(`/folders/${folderId}`, { params });
    return response.data;
  }

  // AI methods
  async askAI(question, contextNoteIds = null, includeRecent = true) {
    const response = await this.client.post('/ai/ask', {
      question,
      context_note_ids: contextNoteIds,
      include_recent: includeRecent
    });
    return response.data;
  }

  async getAISuggestions(limit = 5) {
    const response = await this.client.get('/ai/suggestions', {
      params: { limit }
    });
    return response.data;
  }

  async analyzeNotes(noteIds, analysisType = 'general') {
    const response = await this.client.post('/ai/analyze', {
      note_ids: noteIds,
      analysis_type: analysisType
    });
    return response.data;
  }

  async getAIStatus() {
    const response = await this.client.get('/ai/status');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Utility methods
  clearAuth() {
    localStorage.removeItem('noteflow_token');
    localStorage.removeItem('noteflow_user');
  }

  setToken(token) {
    localStorage.setItem('noteflow_token', token);
  }

  getToken() {
    return localStorage.getItem('noteflow_token');
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;