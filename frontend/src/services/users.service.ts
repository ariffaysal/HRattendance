import { api } from './api';
import type { UserRole } from './auth.service';

export interface AuthUser {
  id: number;
  employeeId: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface CreateUserData {
  employeeId: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserData {
  role?: UserRole;
  isActive?: boolean;
}

interface ApiMessage {
  success: boolean;
  message: string;
}

// Admin-only account management (backend enforces the 'admin' role).
export const usersService = {
  async getAll(): Promise<AuthUser[]> {
    const response = await api.get('/auth/users');
    return response.data;
  },

  async create(data: CreateUserData): Promise<ApiMessage> {
    const response = await api.post('/auth/users', data);
    return response.data;
  },

  async update(id: number, data: UpdateUserData): Promise<ApiMessage> {
    const response = await api.patch(`/auth/users/${id}`, data);
    return response.data;
  },

  async resetPassword(id: number, newPassword: string): Promise<ApiMessage> {
    const response = await api.post(`/auth/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
};
