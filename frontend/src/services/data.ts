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

export const artistService = {
  async getArtists(page = 1, limit = 10): Promise<PaginatedResponse<Artist>> {
    const res = await api.get(`${API_BASE}/artists`, { params: { page, limit } });
    return res.data;
  },

  async getArtistById(id: number): Promise<Artist> {
    const res = await api.get(`${API_BASE}/artists/${id}`);
    return res.data;
  },

  async createArtist(payload: Omit<Artist, 'id' | 'created_at' | 'updated_at'>): Promise<Artist> {
    const res = await api.post(`${API_BASE}/artists`, payload);
    return res.data;
  },

  async updateArtist(id: number, payload: Partial<Artist>): Promise<Artist> {
    const res = await api.put(`${API_BASE}/artists/${id}`, payload);
    return res.data;
  },

  async deleteArtist(id: number): Promise<void> {
    await api.delete(`${API_BASE}/artists/${id}`);
  },
};

