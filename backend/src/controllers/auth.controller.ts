import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const result = await authService.registerUser(name, email, password);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};
