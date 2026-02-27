export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: 'm' | 'f' | 'o';
  address?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Artist {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Song {
  id: number;
  title: string;
  artist_id: number;
  release_date?: string;
  duration?: number;
  genre?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiError {
  message: string;
  status: number;
}
