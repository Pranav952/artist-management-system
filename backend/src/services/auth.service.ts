import pool from '../config/db';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

/**
 * Register new user with JWT token
 * Uses transaction to ensure data consistency
 * @param first_name - User first name
 * @param last_name - User last name
 * @param email - Unique email for login
 * @param password - Plain password (will be hashed)
 * @param phone - Phone (optional)
 * @param dob - Date of birth (optional)
 * @param gender - Gender (m/f/o)
 * @param address - Address (optional)
 * @returns User object and JWT token valid for 7 days
 * @throws Error if email already registered
 */
export const registerUser = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  phone: string,
  dob: string,
  gender: string,
  address: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
  const client = await pool.connect();
  try {
    // Start transaction for atomicity
    await client.query('BEGIN');
    
    // Check if email already exists
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) {
      throw new Error('Email already in use');
    }

    // Hash password before storing
    const hashed = await hashPassword(password);
    
    // Insert user and return without password field
    const insert = await client.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, first_name, last_name, email, phone, dob, gender, address, role, created_at`,
      [first_name, last_name, email, hashed, phone, dob, gender, address]
    );

    const user = insert.rows[0] as Omit<User, 'password'>;
    
    // Create JWT token (valid for 7 days)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Commit transaction
    await client.query('COMMIT');
    return { user, token };
  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Login user and return JWT token
 * @param email - User email
 * @param password - Plain password (will be compared with hashed)
 * @returns User object and JWT token
 * @throws Error if credentials invalid
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> => {
  const client = await pool.connect();
  try {
    // Find user by email (exclude soft-deleted)
    const res = await client.query(
      'SELECT id, first_name, last_name, email, password, created_at FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    if (res.rowCount === 0) throw new Error('Invalid credentials');

    const row = res.rows[0];
    
    // Verify password
    const ok = await comparePassword(password, row.password);
    if (!ok) throw new Error('Invalid credentials');

    // Build user object without password
    const user: Omit<User, 'password'> = {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      created_at: row.created_at,
    };
    
    // Create JWT token (valid for 7 days)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
  } finally {
    client.release();
  }
};
