import pool from '../config/db';
import { User } from '../types';
import { ApiError } from '../middleware/error.middleware';

/**
 * List all non-deleted users with pagination
 * @param page - Page number (1-indexed)
 * @param limit - Results per page
 * @returns Paginated users without password field
 */
export const listUsers = async (
  page = 1,
  limit = 10
): Promise<{ data: Omit<User, 'password'>[]; page: number; limit: number; total: number; pages: number }> => {
  const offset = (page - 1) * limit;
  const client = await pool.connect();
  try {
    // Get total count of non-deleted users
    const totalRes = await client.query("SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL");
    const total = totalRes.rows[0].total as number;
    const pages = Math.ceil(total / limit);
    
    // Fetch paginated results, ordered by newest first
    const res = await client.query(
      `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
       FROM users WHERE deleted_at IS NULL
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { 
      data: res.rows, 
      page, 
      limit, 
      total, 
      pages 
    };
  } finally {
    client.release();
  }
};

/**
 * Get single user by ID (excludes deleted users)
 * @param id - User ID
 * @returns User object without password
 * @throws ApiError if not found
 */
export const getUserById = async (id: number) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at, updated_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (res.rowCount === 0) throw new ApiError(404, 'User not found');
    return res.rows[0];
  } finally {
    client.release();
  }
};

/**
 * Create new user with hashed password
 * @param first_name - User first name
 * @param last_name - User last name
 * @param email - Unique email
 * @param password - Already hashed password from controller
 * @param phone - Phone number (optional)
 * @param dob - Date of birth (optional)
 * @param gender - Gender (m/f/o)
 * @param address - Address (optional)
 * @returns Created user object
 * @throws ApiError if email already exists
 */
export const createUser = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  phone: string,
  dob: string,
  gender: string,
  address: string
) => {
  const client = await pool.connect();
  try {
    // Check if email already exists
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) throw new ApiError(409, 'Email already in use');

    // Insert new user and return without password
    const insert = await client.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, dob, gender, address, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       RETURNING id, first_name, last_name, email, phone, dob, gender, address, role, created_at`,
      [first_name, last_name, email, password, phone, dob, gender, address]
    );
    return insert.rows[0];
  } finally {
    client.release();
  }
};

/**
 * Update user (partial update - only provided fields are updated)
 * @param id - User ID to update
 * @param fields - User fields to update
 * @returns Updated user object
 * @throws ApiError if user not found
 */
export const updateUser = async (
  id: number,
  first_name?: string,
  last_name?: string,
  email?: string,
  phone?: string,
  dob?: string,
  gender?: string,
  address?: string
) => {
  const client = await pool.connect();
  try {
    // Use COALESCE to keep existing values if not provided
    const res = await client.query(
      `UPDATE users SET first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        dob = COALESCE($5, dob),
        gender = COALESCE($6, gender),
        address = COALESCE($7, address),
        updated_at = NOW()
       WHERE id = $8 AND deleted_at IS NULL
       RETURNING id, first_name, last_name, email, phone, dob, gender, address, created_at, updated_at`,
      [first_name, last_name, email, phone, dob, gender, address, id]
    );
    if (res.rowCount === 0) throw new ApiError(404, 'User not found');
    return res.rows[0];
  } finally {
    client.release();
  }
};

/**
 * Soft delete user (marks as deleted without removing from DB)
 * @param id - User ID to delete
 * @throws ApiError if user not found
 */
export const deleteUser = async (id: number) => {
  const client = await pool.connect();
  try {
    // Soft delete: set deleted_at timestamp
    const res = await client.query(
      'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );
    if (res.rowCount === 0) throw new ApiError(404, 'User not found');
    return;
  } finally {
    client.release();
  }
};

