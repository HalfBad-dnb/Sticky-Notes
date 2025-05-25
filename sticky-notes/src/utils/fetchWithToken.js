export const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/login';
    throw new Error('No authentication token');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }
  
  return response;
};

export const fetchJsonWithToken = async (url, options = {}) => {
  const response = await fetchWithToken(url, options);
  return response.json();
};
