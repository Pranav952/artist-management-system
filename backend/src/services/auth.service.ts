import pool from '../config/db';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import { User } from '../types';
import crypto from 'crypto';
import { ApiError } from '../middleware/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (client: any, userId: number, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
  await client.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, refreshToken, expiresAt]
  );
};

export const registerUser = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  phone: string,
  dob: string,
  gender: string,
  address: string
): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const exists = await client.query('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (exists.rowCount && exists.rowCount > 0) {
      throw new Error('Email already in use');
    }

    const hashed = await hashPassword(password);
    
    const insert = await client.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, first_name, last_name, email, phone, dob, gender, address, role, created_at`,
      [first_name, last_name, email, hashed, phone, dob, gender, address]
    );

    const user = insert.rows[0] as Omit<User, 'password'>;
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(client, user.id, refreshToken);
    
    await client.query('COMMIT');
    return { user, accessToken, refreshToken };
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
): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const res = await client.query(
      'SELECT id, first_name, last_name, email, password, created_at FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    if (res.rowCount === 0) throw new Error('Invalid credentials');

    const row = res.rows[0];
    const ok = await comparePassword(password, row.password);
    if (!ok) throw new Error('Invalid credentials');

    const user: Omit<User, 'password'> = {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      created_at: row.created_at,
    };
    
    // Delete old refresh tokens for this user
    await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]);
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(client, user.id, refreshToken);
    
    await client.query('COMMIT');
    return { user, accessToken, refreshToken };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const res = await client.query(
      `SELECT user_id, expires_at FROM refresh_tokens 
       WHERE token = $1`,
      [refreshToken]
    );
    
    if (res.rowCount === 0) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    
    const { user_id, expires_at } = res.rows[0];
    
    if (new Date(expires_at) < new Date()) {
      await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      throw new ApiError(401, 'Refresh token expired');
    }
    
    // Delete old refresh token
    await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    
    // Generate new tokens (token rotation)
    const tokens = generateTokens(user_id);
    await storeRefreshToken(client, user_id, tokens.refreshToken);
    
    await client.query('COMMIT');
    return tokens;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  } finally {
    client.release();
  }
};
