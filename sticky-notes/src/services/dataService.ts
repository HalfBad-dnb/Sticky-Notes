// Data Service - Handles all data operations through API calls
// This replaces any direct database access with proper API calls

import { apiRequest, API_ENDPOINTS } from '../config/api';

// Type definitions
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

interface UserData {
  email?: string;
  username?: string;
  [key: string]: any;
}

interface BoardData {
  title: string;
  description?: string;
  isPublic?: boolean;
  [key: string]: any;
}

interface NoteData {
  text?: string;
  x?: number;
  y?: number;
  done?: boolean;
  rotation?: number;
  zIndex?: number;
  width?: string;
  height?: string;
  boardId?: string;
  [key: string]: any;
}

interface ApiResponse<T = any> {
  data?: T;
  status?: number;
  message?: string;
  [key: string]: any;
}

interface HealthCheckResponse {
  status: string;
  error?: string;
  [key: string]: any;
}

class DataService {
  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  // User Methods
  async getCurrentUser(): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.USERS.ME);
  }

  async updateUserProfile(userData: UserData): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.USERS.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Board Methods
  async getAllBoards(): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.BOARDS.ALL);
  }

  async createBoard(boardData: BoardData): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.BOARDS.CREATE, {
      method: 'POST',
      body: JSON.stringify(boardData),
    });
  }

  async getBoardById(id: string | number): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.BOARDS.BY_ID(id));
  }

  async updateBoard(id: string | number, boardData: BoardData): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.BOARDS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(boardData),
    });
  }

  async deleteBoard(id: string | number): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.BOARDS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Note Methods
  async getAllNotes(): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.NOTES.ALL);
  }

  async createNote(noteData: NoteData): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.NOTES.CREATE, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getNoteById(id: string | number): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.NOTES.BY_ID(id));
  }

  async updateNote(id: string | number, noteData: NoteData): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.NOTES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id: string | number): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.NOTES.DELETE(id), {
      method: 'DELETE',
    });
  }

  async getNotesByBoard(boardId: string | number): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.NOTES.BY_BOARD(boardId));
  }

  // Subscription Methods
  async getSubscriptionTiers(): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.ALL);
  }

  async getSubscriptionTier(id: string | number): Promise<ApiResponse> {
    return await apiRequest(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id));
  }

  // Utility Methods
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${API_ENDPOINTS.BOARDS.ALL.split('/api')[0]}/health`);
      return await response.json();
    } catch (error: any) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Batch Operations
  async batchUpdateNotes(notes: (NoteData & { id: string | number })[]): Promise<ApiResponse[]> {
    const promises = notes.map(note => 
      this.updateNote(note.id, note)
    );
    return await Promise.all(promises);
  }

  async batchDeleteNotes(noteIds: (string | number)[]): Promise<ApiResponse[]> {
    const promises = noteIds.map(id => 
      this.deleteNote(id)
    );
    return await Promise.all(promises);
  }

  // Search and Filter
  async searchNotes(query: string): Promise<ApiResponse> {
    return await apiRequest(`${API_ENDPOINTS.NOTES.ALL}?search=${encodeURIComponent(query)}`);
  }

  async getNotesByType(boardType: string): Promise<ApiResponse> {
    return await apiRequest(`${API_ENDPOINTS.NOTES.ALL}?type=${encodeURIComponent(boardType)}`);
  }

  async getPrivateNotes(): Promise<ApiResponse> {
    return await apiRequest(`${API_ENDPOINTS.NOTES.ALL}?private=true`);
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;
