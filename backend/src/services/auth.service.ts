import pool from '../config/db';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    if (exists.rowCount > 0) {
      throw new Error('Email already in use');
    }

    const hashed = await hashPassword(password);
    const insert = await client.query(
      'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email, created_at',
      [name, email, hashed]
    );

    const user = insert.rows[0] as Omit<User, 'password'>;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    await client.query('COMMIT');
    return { user, token };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT id, name, email, password, created_at FROM users WHERE email = $1',
      [email]
    );
    if (res.rowCount === 0) throw new Error('Invalid credentials');

    const row = res.rows[0];
    const ok = await comparePassword(password, row.password);
    if (!ok) throw new Error('Invalid credentials');

    const user: Omit<User, 'password'> = {
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: row.created_at,
    };
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
  } finally {
    client.release();
  }
};
