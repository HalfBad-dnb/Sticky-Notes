// API Configuration for Frontend
// This file centralizes all API endpoint configurations

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  
  // Users
  USERS: {
    ME: `${API_BASE_URL}/users/me`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE: `${API_BASE_URL}/users/update`,
  },
  
  // Boards
  BOARDS: {
    ALL: `${API_BASE_URL}/boards`,
    CREATE: `${API_BASE_URL}/boards`,
    BY_ID: (id) => `${API_BASE_URL}/boards/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/boards/${id}`,
    DELETE: (id) => `${API_BASE_URL}/boards/${id}`,
  },
  
  // Notes
  NOTES: {
    ALL: `${API_BASE_URL}/notes`,
    CREATE: `${API_BASE_URL}/notes`,
    BY_ID: (id) => `${API_BASE_URL}/notes/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/notes/${id}`,
    DELETE: (id) => `${API_BASE_URL}/notes/${id}`,
    BY_BOARD: (boardId) => `${API_BASE_URL}/notes/board/${boardId}`,
  },
  
  // Subscription Tiers
  SUBSCRIPTIONS: {
    ALL: `${API_BASE_URL}/subscriptions`,
    BY_ID: (id) => `${API_BASE_URL}/subscriptions/${id}`,
  },
};

// Default API configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request helper
export const apiRequest = async (endpoint, options = {}) => {
  const config = {
    ...API_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export default {
  API_ENDPOINTS,
  API_CONFIG,
  getAuthToken,
  getAuthHeaders,
  apiRequest,
};
