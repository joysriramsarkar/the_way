'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'Admin' | 'Moderator' | 'Editor' | 'Contributor' | 'Subscriber';
  bio?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('theway_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    fetch('/api/auth?action=me', {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('theway_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('theway_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('theway_token');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
