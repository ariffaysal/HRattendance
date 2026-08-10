import { api } from './api';

export interface LoginData {
  employeeId: string;
  password: string;
}

export interface RegisterData {
  employeeId: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface User {
  id: number;
  employeeId: string;
  email: string;
  mobileNumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: User;
}

const STORAGE_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';
const COOKIE_KEY = 'auth_user';

// Helper to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// Helper to remove cookie
function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    if (response.data.success && response.data.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data.user));
      // Store the JWT so axios can send it as a Bearer token
      if (response.data.accessToken) {
        localStorage.setItem(TOKEN_KEY, response.data.accessToken);
      }
      // Also set a cookie for middleware detection (route gating only -
      // real authorization is enforced by the backend JWT guard)
      setCookie(COOKIE_KEY, response.data.user.employeeId);
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    removeCookie(COOKIE_KEY);
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};
