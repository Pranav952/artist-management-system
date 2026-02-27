import api from './api';
import { User, Artist, Song, PaginatedResponse } from '../types';

const API_BASE = '/api';


export const userService = {
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const res = await api.get(`${API_BASE}/users`, { params: { page, limit } });
    return res.data;
  },

  async getUserById(id: number): Promise<User> {
    const res = await api.get(`${API_BASE}/users/${id}`);
    return res.data;
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const res = await api.post(`${API_BASE}/users`, user);
    return res.data;
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const res = await api.put(`${API_BASE}/users/${id}`, user);
    return res.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`${API_BASE}/users/${id}`);
  },
};
