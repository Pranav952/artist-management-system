import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as userService from '../services/user.service';
import { hashPassword } from '../utils/hash';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);
    const data = await userService.listUsers(page, limit);
    return res.json(data);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { first_name, last_name, email, password, phone, dob, gender, address } = req.body;
    const hashed = await hashPassword(password);
    const user = await userService.createUser(first_name, last_name, email, hashed, phone, dob, gender, address);
    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = Number(req.params.id);
    const { first_name, last_name, email, phone, dob, gender, address } = req.body;
    const user = await userService.updateUser(id, first_name, last_name, email, phone, dob, gender, address);
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
