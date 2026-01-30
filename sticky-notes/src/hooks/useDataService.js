// React Hook for Data Service
// Provides a convenient way to use the data service in React components

import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

export const useDataService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wrapper for data service methods with loading and error handling
  const execute = useCallback(async (serviceMethod, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await serviceMethod(...args);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication methods
  const login = useCallback((credentials) => execute(dataService.login, credentials), [execute]);
  const register = useCallback((userData) => execute(dataService.register, userData), [execute]);
  const logout = useCallback(() => execute(dataService.logout), [execute]);
  const refreshToken = useCallback(() => execute(dataService.refreshToken), [execute]);

  // User methods
  const getCurrentUser = useCallback(() => execute(dataService.getCurrentUser), [execute]);
  const updateUserProfile = useCallback((userData) => execute(dataService.updateUserProfile, userData), [execute]);

  // Board methods
  const getAllBoards = useCallback(() => execute(dataService.getAllBoards), [execute]);
  const createBoard = useCallback((boardData) => execute(dataService.createBoard, boardData), [execute]);
  const getBoardById = useCallback((id) => execute(dataService.getBoardById, id), [execute]);
  const updateBoard = useCallback((id, boardData) => execute(dataService.updateBoard, id, boardData), [execute]);
  const deleteBoard = useCallback((id) => execute(dataService.deleteBoard, id), [execute]);

  // Note methods
  const getAllNotes = useCallback(() => execute(dataService.getAllNotes), [execute]);
  const createNote = useCallback((noteData) => execute(dataService.createNote, noteData), [execute]);
  const getNoteById = useCallback((id) => execute(dataService.getNoteById, id), [execute]);
  const updateNote = useCallback((id, noteData) => execute(dataService.updateNote, id, noteData), [execute]);
  const deleteNote = useCallback((id) => execute(dataService.deleteNote, id), [execute]);
  const getNotesByBoard = useCallback((boardId) => execute(dataService.getNotesByBoard, boardId), [execute]);

  // Subscription methods
  const getSubscriptionTiers = useCallback(() => execute(dataService.getSubscriptionTiers), [execute]);
  const getSubscriptionTier = useCallback((id) => execute(dataService.getSubscriptionTier, id), [execute]);

  // Utility methods
  const healthCheck = useCallback(() => execute(dataService.healthCheck), [execute]);
  const searchNotes = useCallback((query) => execute(dataService.searchNotes, query), [execute]);
  const getNotesByType = useCallback((boardType) => execute(dataService.getNotesByType, boardType), [execute]);
  const getPrivateNotes = useCallback(() => execute(dataService.getPrivateNotes), [execute]);

  // Batch operations
  const batchUpdateNotes = useCallback((notes) => execute(dataService.batchUpdateNotes, notes), [execute]);
  const batchDeleteNotes = useCallback((noteIds) => execute(dataService.batchDeleteNotes, noteIds), [execute]);

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
