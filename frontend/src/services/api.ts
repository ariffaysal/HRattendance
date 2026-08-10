import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT to every request. The backend rejects requests without a
// valid token, so this is what keeps authenticated API calls working.
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally — expired or invalid tokens get cleaned up
// and the user is redirected to the public landing page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url || '';
      // Don't intercept auth endpoints themselves — they handle their own errors
      if (!url.startsWith('/auth/')) {
        authService.logout();
        window.location.href = '/skyview';
      }
    }
    return Promise.reject(error);
  },
);

export const unwrapResponse = <T>(response: { data: T }): T => response.data;
