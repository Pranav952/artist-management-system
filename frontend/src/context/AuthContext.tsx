import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

interface AuthState {
  token: string | null;
  user: { id: number; first_name?: string; last_name?: string; email: string } | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone?: string,
    dob?: string,
    gender?: string,
    address?: string
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthState['user']>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const register = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone?: string,
    dob?: string,
    gender?: string,
    address?: string
  ) => {
    const res = await api.post('/api/auth/register', { first_name, last_name, email, password, phone, dob, gender, address });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
