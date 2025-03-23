/**
 * API utility for Sticky Notes application
 * 
 * This file centralizes API URL configuration and provides utility functions
 * for making API requests with proper authentication.
 */

// Get the API URL from environment variables with fallback to Cloud Run URL
let apiUrl = import.meta.env.VITE_API_URL || 'https://sticky-notes-backend-oyj73tnptq-ew.a.run.app';

// Ensure we're using HTTPS in production environment
if (apiUrl.startsWith('http://') && apiUrl.includes('.run.app')) {
  apiUrl = apiUrl.replace('http://', 'https://');
}

export const API_URL = apiUrl;

/**
 * Get authentication headers with the current token
 * @returns {Object} Headers object with Authorization if token exists
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Create a full API URL for a specific endpoint
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @returns {string} The complete API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_URL}/api/${endpoint}`;
};
