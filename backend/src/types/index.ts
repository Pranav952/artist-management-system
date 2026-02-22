import { Request } from 'express';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  created_at?: string;
}


export interface RequestWithUser extends Request {
  userId?: number;
}
