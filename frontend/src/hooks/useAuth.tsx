import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (email: string, senha: string) => Promise<{ aguardando_aprovacao?: boolean } | undefined>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('thaya_token');
    const savedUser = localStorage.getItem('thaya_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login.');
    localStorage.setItem('thaya_token', data.token);
    localStorage.setItem('thaya_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, senha: string): Promise<{ aguardando_aprovacao?: boolean } | undefined> => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar.');
    // If user is waiting for approval, don't set token
    if (data.aguardando_aprovacao) {
      return { aguardando_aprovacao: true };
    }
    localStorage.setItem('thaya_token', data.token);
    localStorage.setItem('thaya_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return undefined;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('thaya_token');
    localStorage.removeItem('thaya_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useApi() {
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      return data;
    },
    [token, API_BASE],
  );

  return apiFetch;
}
