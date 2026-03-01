import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
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
  setAccessToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthState['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const at = localStorage.getItem('accessToken');
      const rt = localStorage.getItem('refreshToken');
      const u = localStorage.getItem('user');
      
      if (at && rt && u) {
        setAccessToken(at);
        setRefreshToken(rt);
        setUser(JSON.parse(u));
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { accessToken: at, refreshToken: rt, user: u } = res.data;
    setAccessToken(at);
    setRefreshToken(rt);
    setUser(u);
    localStorage.setItem('accessToken', at);
    localStorage.setItem('refreshToken', rt);
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
    const { accessToken: at, refreshToken: rt, user: u } = res.data;
    setAccessToken(at);
    setRefreshToken(rt);
    setUser(u);
    localStorage.setItem('accessToken', at);
    localStorage.setItem('refreshToken', rt);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const updateAccessToken = (token: string) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      refreshToken, 
      user, 
      login, 
      register, 
      logout,
      setAccessToken: updateAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
