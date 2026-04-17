import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { UserRole } from "../types/pos";
import { supabase } from "../../lib/supabase";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  shift: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("kopi_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback(async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc("verify_login", {
        p_username: username.toLowerCase(),
        p_password: password,
      });

      if (error || !data || data.length === 0) {
        return { success: false, error: "Username atau password salah" };
      }

      const userRecord = data[0];

      const userData = {
        id: userRecord.id,
        name: userRecord.name,
        role: userRecord.role as UserRole,
        shift: userRecord.shift,
      };

      setUser(userData);
      localStorage.setItem("kopi_user", JSON.stringify(userData));

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: "Terjadi kesalahan saat login" };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("kopi_user");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
