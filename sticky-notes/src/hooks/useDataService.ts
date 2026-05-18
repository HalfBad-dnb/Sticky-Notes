// React Hook for Data Service
// Provides a convenient way to use the data service in React components

import { useState, useCallback } from 'react';
import dataService from '../services/dataService.ts';

// Type definitions
interface ApiServiceMethod {
  (...args: any[]): Promise<any>;
}

interface UseDataServiceReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Authentication
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (userData: { email: string; password: string; username?: string }) => Promise<any>;
  logout: () => Promise<any>;
  refreshToken: () => Promise<any>;
  
  // User operations
  getCurrentUser: () => Promise<any>;
  updateUserProfile: (userData: any) => Promise<any>;
  
  // Board operations
  getAllBoards: () => Promise<any>;
  createBoard: (boardData: any) => Promise<any>;
  getBoardById: (id: string | number) => Promise<any>;
  updateBoard: (id: string | number, boardData: any) => Promise<any>;
  deleteBoard: (id: string | number) => Promise<any>;
  
  // Note operations
  getAllNotes: () => Promise<any>;
  createNote: (noteData: any) => Promise<any>;
  getNoteById: (id: string | number) => Promise<any>;
  updateNote: (id: string | number, noteData: any) => Promise<any>;
  deleteNote: (id: string | number) => Promise<any>;
  getNotesByBoard: (boardId: string | number) => Promise<any>;
  
  // Subscription operations
  getSubscriptionTiers: () => Promise<any>;
  getSubscriptionTier: (id: string | number) => Promise<any>;
  
  // Utility operations
  healthCheck: () => Promise<any>;
  searchNotes: (query: string) => Promise<any>;
  getNotesByType: (boardType: string) => Promise<any>;
  getPrivateNotes: () => Promise<any>;
  
  // Batch operations
  batchUpdateNotes: (notes: any[]) => Promise<any>;
  batchDeleteNotes: (noteIds: (string | number)[]) => Promise<any>;
  
  // Clear error
  clearError: () => void;
}

export const useDataService = (): UseDataServiceReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper for data service methods with loading and error handling
  const execute = useCallback(async (serviceMethod: ApiServiceMethod, ...args: any[]): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await serviceMethod(...args);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication methods
  const login = useCallback((credentials: { email: string; password: string }) => 
    execute(dataService.login, credentials), [execute]);
  const register = useCallback((userData: { email: string; password: string; username?: string }) => 
    execute(dataService.register, userData), [execute]);
  const logout = useCallback(() => execute(dataService.logout), [execute]);
  const refreshToken = useCallback(() => execute(dataService.refreshToken), [execute]);

  // User methods
  const getCurrentUser = useCallback(() => execute(dataService.getCurrentUser), [execute]);
  const updateUserProfile = useCallback((userData: any) => execute(dataService.updateUserProfile, userData), [execute]);

  // Board methods
  const getAllBoards = useCallback(() => execute(dataService.getAllBoards), [execute]);
  const createBoard = useCallback((boardData: any) => execute(dataService.createBoard, boardData), [execute]);
  const getBoardById = useCallback((id: string | number) => execute(dataService.getBoardById, id), [execute]);
  const updateBoard = useCallback((id: string | number, boardData: any) => execute(dataService.updateBoard, id, boardData), [execute]);
  const deleteBoard = useCallback((id: string | number) => execute(dataService.deleteBoard, id), [execute]);

  // Note methods
  const getAllNotes = useCallback(() => execute(dataService.getAllNotes), [execute]);
  const createNote = useCallback((noteData: any) => execute(dataService.createNote, noteData), [execute]);
  const getNoteById = useCallback((id: string | number) => execute(dataService.getNoteById, id), [execute]);
  const updateNote = useCallback((id: string | number, noteData: any) => execute(dataService.updateNote, id, noteData), [execute]);
  const deleteNote = useCallback((id: string | number) => execute(dataService.deleteNote, id), [execute]);
  const getNotesByBoard = useCallback((boardId: string | number) => execute(dataService.getNotesByBoard, boardId), [execute]);

  // Subscription methods
  const getSubscriptionTiers = useCallback(() => execute(dataService.getSubscriptionTiers), [execute]);
  const getSubscriptionTier = useCallback((id: string | number) => execute(dataService.getSubscriptionTier, id), [execute]);

  // Utility methods
  const healthCheck = useCallback(() => execute(dataService.healthCheck), [execute]);
  const searchNotes = useCallback((query: string) => execute(dataService.searchNotes, query), [execute]);
  const getNotesByType = useCallback((boardType: string) => execute(dataService.getNotesByType, boardType), [execute]);
  const getPrivateNotes = useCallback(() => execute(dataService.getPrivateNotes), [execute]);

  // Batch operations
  const batchUpdateNotes = useCallback((notes: any[]) => execute(dataService.batchUpdateNotes, notes), [execute]);
  const batchDeleteNotes = useCallback((noteIds: (string | number)[]) => execute(dataService.batchDeleteNotes, noteIds), [execute]);

  return {
    // State
    loading,
    error,
    
    // Authentication
    login,
    register,
    logout,
    refreshToken,
    
    // User operations
    getCurrentUser,
    updateUserProfile,
    
    // Board operations
    getAllBoards,
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    
    // Note operations
    getAllNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
    getNotesByBoard,
    
    // Subscription operations
    getSubscriptionTiers,
    getSubscriptionTier,
    
    // Utility operations
    healthCheck,
    searchNotes,
    getNotesByType,
    getPrivateNotes,
    
    // Batch operations
    batchUpdateNotes,
    batchDeleteNotes,
    
    // Clear error
    clearError: () => setError(null),
  };
};

export default useDataService;
