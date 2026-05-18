const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  status?: number;
  message?: string;
  [key: string]: unknown;
}

export interface ApiEndpoints {
  AUTH: {
    LOGIN: string;
    REGISTER: string;
    REFRESH: string;
    LOGOUT: string;
  };
  USERS: {
    ME: string;
    PROFILE: string;
    UPDATE: string;
  };
  BOARDS: {
    ALL: string;
    CREATE: string;
    BY_ID: (id: string | number) => string;
    UPDATE: (id: string | number) => string;
    DELETE: (id: string | number) => string;
  };
  NOTES: {
    ALL: string;
    CREATE: string;
    BY_ID: (id: string | number) => string;
    UPDATE: (id: string | number) => string;
    DELETE: (id: string | number) => string;
    BY_BOARD: (boardId: string | number) => string;
  };
  SUBSCRIPTIONS: {
    ALL: string;
    BY_ID: (id: string | number) => string;
  };
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export const API_ENDPOINTS: ApiEndpoints = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  USERS: {
    ME: `${API_BASE_URL}/users/me`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE: `${API_BASE_URL}/users/update`,
  },
  BOARDS: {
    ALL: `${API_BASE_URL}/boards`,
    CREATE: `${API_BASE_URL}/boards`,
    BY_ID: (id) => `${API_BASE_URL}/boards/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/boards/${id}`,
    DELETE: (id) => `${API_BASE_URL}/boards/${id}`,
  },
  NOTES: {
    ALL: `${API_BASE_URL}/notes`,
    CREATE: `${API_BASE_URL}/notes`,
    BY_ID: (id) => `${API_BASE_URL}/notes/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/notes/${id}`,
    DELETE: (id) => `${API_BASE_URL}/notes/${id}`,
    BY_BOARD: (boardId) => `${API_BASE_URL}/notes/board/${boardId}`,
  },
  SUBSCRIPTIONS: {
    ALL: `${API_BASE_URL}/subscriptions`,
    BY_ID: (id) => `${API_BASE_URL}/subscriptions/${id}`,
  },
};

export const API_CONFIG: ApiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getAuthHeaders = (): { Authorization?: string } => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const config = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

export default {
  API_ENDPOINTS,
  API_CONFIG,
  getAuthToken,
  getAuthHeaders,
  apiRequest,
};
