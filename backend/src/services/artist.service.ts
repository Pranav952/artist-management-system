import pool from '../config/db';
import { Artist } from '../types';
import { ApiError } from '../middleware/error.middleware';

export const listArtists = async (
  page = 1,
  limit = 10
): Promise<{ data: Artist[]; page: number; limit: number; total: number; pages: number }> => {
  const offset = (page - 1) * limit;
  const client = await pool.connect();
  try {
    const totalRes = await client.query('SELECT COUNT(*)::int AS total FROM artists WHERE deleted_at IS NULL');
    const total = totalRes.rows[0].total as number;
    const pages = Math.ceil(total / limit);

    const res = await client.query(
      `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
       FROM artists WHERE deleted_at IS NULL
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { data: res.rows, page, limit, total, pages };
  } finally {
    client.release();
  }
};

export const getArtistById = async (id: number) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
       FROM artists WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (res.rowCount === 0) throw new ApiError(404, 'Artist not found');
    return res.rows[0] as Artist;
  } finally {
    client.release();
  }
};

export const createArtist = async (
  name: string,
  dob?: string,
  gender?: string,
  address?: string,
  first_release_year?: number,
  no_of_albums_released?: number
) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())
       RETURNING id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at`,
      [name, dob || null, gender || null, address || null, first_release_year || null, no_of_albums_released || 0]
    );
    return res.rows[0] as Artist;
  } finally {
    client.release();
  }
};

export const updateArtist = async (
  id: number,
  name?: string,
  dob?: string | null,
  gender?: string | null,
  address?: string | null,
  first_release_year?: number | null,
  no_of_albums_released?: number | null
) => {
  const client = await pool.connect();
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (dob !== undefined) {
      updates.push(`dob = $${paramCount++}`);
      values.push(dob);
    }
    if (gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      values.push(gender);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (first_release_year !== undefined) {
      updates.push(`first_release_year = $${paramCount++}`);
      values.push(first_release_year);
    }
    if (no_of_albums_released !== undefined) {
      updates.push(`no_of_albums_released = $${paramCount++}`);
      values.push(no_of_albums_released);
    }

    if (updates.length === 0) {
      throw new ApiError(400, 'No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const res = await client.query(
      `UPDATE artists SET ${updates.join(', ')}
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at`,
      values
    );
    if (res.rowCount === 0) throw new ApiError(404, 'Artist not found');
    return res.rows[0] as Artist;
  } finally {
    client.release();
  }
};

export const deleteArtist = async (id: number) => {
  const client = await pool.connect();
  try {
    const res = await client.query('UPDATE artists SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id]);
    if (res.rowCount === 0) throw new ApiError(404, 'Artist not found');
    return;
  } finally {
    client.release();
  }
};
