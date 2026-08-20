'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (employeeId: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function validateSession() {
      const storedUser = authService.getCurrentUser();
      const token = authService.getToken();

      // No stored session - nothing to validate.
      if (!token || !storedUser) {
        if (!cancelled) {
          setUser(storedUser);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Ask the backend whether the JWT is still valid and get the fresh
        // account record (role changes take effect immediately this way).
        const freshUser = await authService.getMe();
        authService.saveUser(freshUser);
        if (!cancelled) {
          setUser(freshUser);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Account deleted/deactivated, or the database was reset (the mock
          // DB is in-memory and wipes accounts on restart). Drop the stale
          // session so the middleware stops bouncing /login to the dashboard.
          authService.logout();
          if (!cancelled) {
            setUser(null);
          }
        } else {
          // Backend unreachable - keep the stored user instead of logging
          // someone out because the server happened to be down.
          if (!cancelled) {
            setUser(storedUser);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    validateSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (employeeId: string, password: string) => {
    try {
      const response = await authService.login({ employeeId, password });
      if (response.success && response.user) {
        setUser(response.user);
      }
      return { success: response.success, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/skyview';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        // Don't treat a stored user as authenticated while the session is
        // still being validated - otherwise the login page would redirect
        // away with a session that may already be stale.
        isAuthenticated: !!user && !isLoading,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
