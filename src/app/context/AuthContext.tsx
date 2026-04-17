import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { UserRole } from '../types/pos';

export interface User {
  name: string;
  role: UserRole;
  shift: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

// Demo credentials
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  barista: { password: 'barista123', user: { name: 'Sari Barista', role: 'barista', shift: 'Shift Pagi' } },
  admin: { password: 'admin123', user: { name: 'Admin Manager', role: 'admin', shift: 'Full Time' } },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((username: string, password: string) => {
    try {
      const entry = DEMO_USERS[username.toLowerCase()];
      if (!entry) {
        return { success: false, error: 'Username tidak ditemukan' };
      }
      if (entry.password !== password) {
        return { success: false, error: 'Password salah' };
      }
      setUser(entry.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Terjadi kesalahan saat login' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
