import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RequestWithUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export const requireAuth = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
      return res.status(401).json({ message: 'Unauthorized' });

    const token = parts[1];
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
