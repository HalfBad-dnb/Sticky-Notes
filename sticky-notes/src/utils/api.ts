/**
 * API utility for Sticky Notes application
 * 
 * This file centralizes API URL configuration and provides utility functions
 * for making API requests with proper authentication.
 */

// For local development - using localhost
const LOCAL_API_URL = 'http://localhost:8081';

// Check if we're in production (on Cloud Run)
const isProduction = window.location.hostname.includes('run.app');

// Use environment variable if set, otherwise use local URL
export const API_URL: string = isProduction 
  ? 'https://sticky-notes-backend-oyj73tnptq-ew.a.run.app' 
  : LOCAL_API_URL;

console.log('API base URL:', API_URL);

/**
 * Get authentication headers with the current token
 * @returns {Record<string, string>} Headers object with Authorization if token exists
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Create a full API URL for a specific endpoint
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @returns {string} The complete API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove any leading slashes from the endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Check if the endpoint already includes 'api/'
  if (cleanEndpoint.startsWith('api/')) {
    return `${API_URL}/${cleanEndpoint}`;
  }
  
  return `${API_URL}/api/${cleanEndpoint}`;
};
