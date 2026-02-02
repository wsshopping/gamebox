
// Shared API utilities

// Toggle this to FALSE when your backend is ready
export const USE_MOCK = true;

// Simulate network latency (ms) for mock mode
export const DELAY = 500;
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.yourgamebox.com/v1';

// HTTP Client Wrapper
interface RequestConfig extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  // 1. Get Token from Storage
  const userSession = localStorage.getItem('gamebox_current_user');
  const token = userSession ? JSON.parse(userSession).token : '';

  // 2. Prepare Headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...config.headers,
  };

  // 3. Make Request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...config,
    headers,
  });

  // 4. Handle Response
  const data = await response.json();

  if (!response.ok) {
    // Handle 401 Unauthorized (Logout user, redirect to login, etc.)
    if (response.status === 401) {
      // localStorage.removeItem('gamebox_current_user');
      // window.location.href = '/#/login';
      throw new Error('Unauthorized');
    }
    throw new Error(data.message || 'Network response was not ok');
  }

  return data as T;
}

export const client = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
