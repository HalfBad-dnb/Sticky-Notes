// Data Service - Handles all data operations through API calls
// This replaces any direct database access with proper API calls

import { apiRequest, API_ENDPOINTS } from '../config/api.js';

class DataService {
  // Authentication Methods
  async login(credentials) {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return await apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken() {
    return await apiRequest(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
    });
  }

  async logout() {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  // User Methods
  async getCurrentUser() {
    return await apiRequest(API_ENDPOINTS.USERS.ME);
  }

  async updateUserProfile(userData) {
    return await apiRequest(API_ENDPOINTS.USERS.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Board Methods
  async getAllBoards() {
    return await apiRequest(API_ENDPOINTS.BOARDS.ALL);
  }

  async createBoard(boardData) {
    return await apiRequest(API_ENDPOINTS.BOARDS.CREATE, {
      method: 'POST',
      body: JSON.stringify(boardData),
    });
  }

  async getBoardById(id) {
    return await apiRequest(API_ENDPOINTS.BOARDS.BY_ID(id));
  }

  async updateBoard(id, boardData) {
    return await apiRequest(API_ENDPOINTS.BOARDS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(boardData),
    });
  }

  async deleteBoard(id) {
    return await apiRequest(API_ENDPOINTS.BOARDS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Note Methods
  async getAllNotes() {
    return await apiRequest(API_ENDPOINTS.NOTES.ALL);
  }

  async createNote(noteData) {
    return await apiRequest(API_ENDPOINTS.NOTES.CREATE, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getNoteById(id) {
    return await apiRequest(API_ENDPOINTS.NOTES.BY_ID(id));
  }

  async updateNote(id, noteData) {
    return await apiRequest(API_ENDPOINTS.NOTES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id) {
    return await apiRequest(API_ENDPOINTS.NOTES.DELETE(id), {
      method: 'DELETE',
    });
  }

  async getNotesByBoard(boardId) {
    return await apiRequest(API_ENDPOINTS.NOTES.BY_BOARD(boardId));
  }

  // Subscription Methods
  async getSubscriptionTiers() {
    return await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.ALL);
  }

  async getSubscriptionTier(id) {
    return await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id));
  }

  // Utility Methods
  async healthCheck() {
    try {
      const response = await fetch(`${API_ENDPOINTS.BOARDS.ALL.split('/api')[0]}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Batch Operations
  async batchUpdateNotes(notes) {
    const promises = notes.map(note => 
      this.updateNote(note.id, note)
    );
    return await Promise.all(promises);
  }

  async batchDeleteNotes(noteIds) {
    const promises = noteIds.map(id => 
      this.deleteNote(id)
    );
    return await Promise.all(promises);
  }

  // Search and Filter
  async searchNotes(query) {
    return await apiRequest(`${API_ENDPOINTS.NOTES.ALL}?search=${encodeURIComponent(query)}`);
  }

  async getNotesByType(boardType) {
    return await apiRequest(`${API_ENDPOINTS.NOTES.ALL}?type=${encodeURIComponent(boardType)}`);
  }

  async getPrivateNotes() {
    return await apiRequest(`${API_ENDPOINTS.NOTES.ALL}?private=true`);
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
