const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    // If we are not on login page, redirect
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (response.status >= 500) {
    console.error(`Server Error: ${response.status}`);
    // Simple fallback for now
    alert("A server error occurred. Please try again later.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'An error occurred during the request');
  }

  return response;
}
