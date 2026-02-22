import pool from '../config/db';
import { User } from '../types';

export const listUsers = async (
  page = 1,
  limit = 10
): Promise<{ users: Omit<User, 'password'>[]; total: number }> => {
  const offset = (page - 1) * limit;
  const client = await pool.connect();
  try {
    const totalRes = await client.query('SELECT COUNT(*)::int AS total FROM users');
    const total = totalRes.rows[0].total as number;
    const res = await client.query(
      'SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return { users: res.rows, total };
  } finally {
    client.release();
  }
};

export const createUser = async (name: string, email: string, password: string) => {
  const client = await pool.connect();
  try {
    const insert = await client.query(
      'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email, created_at',
      [name, email, password]
    );
    return insert.rows[0];
  } finally {
    client.release();
  }
};

export const updateUser = async (id: number, name: string, email: string) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at',
      [name, email, id]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
};

export const deleteUser = async (id: number) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    return;
  } finally {
    client.release();
  }
};
