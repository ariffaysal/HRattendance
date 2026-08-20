export interface LoginData {
  employeeId: string;
  password: string;
}

export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: number;
  employeeId: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: User;
}
