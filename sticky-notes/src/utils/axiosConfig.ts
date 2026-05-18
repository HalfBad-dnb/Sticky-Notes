import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAuthHeaders } from './api';

// Configure default settings for Axios
const axiosInstance: AxiosInstance = axios.create({
  // 10 seconds timeout
  timeout: 10000,
  
  // Maximum content length of 5MB
  maxContentLength: 5 * 1024 * 1024,
  
  // Maximum body length of 1MB for requests
  maxBodyLength: 1024 * 1024,
  
  // Validate status
  validateStatus: function (status: number): boolean {
    return status >= 200 && status < 500; // Resolve only if the status code is less than 500
  }
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add auth token to headers if it exists
    const authHeaders = getAuthHeaders();
    if (authHeaders.Authorization) {
      config.headers.set('Authorization', authHeaders.Authorization);
    }
    
    // Ensure Content-Type is set for POST, PUT, PATCH requests
    if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase()) && !config.headers?.['Content-Type']) {
      config.headers.set('Content-Type', 'application/json');
    }
    
    return config;
  },
  (error: any): Promise<never> => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error: AxiosError): Promise<never> => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Please try again.');
      return Promise.reject({ message: 'Request timeout. Please try again.' });
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized
        console.error('Unauthorized access. Please log in again.');
        // Optionally redirect to login or refresh token
      } else if (status && status >= 500) {
        console.error('Server error. Please try again later.');
      }
      
      return Promise.reject(data || { message: 'An error occurred' });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server. Please check your connection.');
      return Promise.reject({ message: 'No response from server. Please check your connection.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return Promise.reject({ message: error.message || 'Unknown error' });
    }
  }
);

export default axiosInstance;
