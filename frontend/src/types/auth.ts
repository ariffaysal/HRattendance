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
