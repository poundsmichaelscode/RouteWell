"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { firstName: string; lastName: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: User }>("/auth/me");
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    refreshUser,
    login: async (email, password) => {
      const { data } = await api.post<{ data: { user: User } }>(
        "/auth/login",
        { email, password }
      );
      setUser(data.data.user);
    },
    register: async (payload) => {
      const { data } = await api.post<{ data: { user: User } }>(
        "/auth/register",
        payload
      );
      setUser(data.data.user);
    },
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        setUser(null);
      }
    },
    updateProfile: async (payload) => {
      const { data } = await api.patch<{ data: User }>("/auth/me", payload);
      setUser(data.data);
    }
  }), [refreshUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
