import { Request } from 'express';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role?: 'admin';
  phone?: string | null;
  dob?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Artist {
  id: number;
  name: string;
  dob?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  first_release_year?: number | null;
  no_of_albums_released?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface RequestWithUser extends Request {
  userId?: number;
}
