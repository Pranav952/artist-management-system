import pool from '../config/db';
import { Music } from '../types';
import { ApiError } from '../middleware/error.middleware';

export const listMusicByArtist = async (
  artistId: number,
  page = 1,
  limit = 10
): Promise<{ data: Music[]; page: number; limit: number; total: number; pages: number }> => {
  const offset = (page - 1) * limit;
  const client = await pool.connect();
  try {
    const totalRes = await client.query(
      'SELECT COUNT(*)::int AS total FROM music WHERE artist_id = $1',
      [artistId]
    );
    const total = totalRes.rows[0].total as number;
    const pages = Math.ceil(total / limit);

    const res = await client.query(
      `SELECT m.id, m.artist_id, m.title, m.album_name, m.genre, 
              m.created_at, m.updated_at, a.name as artist_name
       FROM music m
       INNER JOIN artists a ON m.artist_id = a.id
       WHERE m.artist_id = $1
       ORDER BY m.created_at DESC LIMIT $2 OFFSET $3`,
      [artistId, limit, offset]
    );
    return { data: res.rows, page, limit, total, pages };
  } finally {
    client.release();
  }
};

export const getMusicById = async (id: number) => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT m.id, m.artist_id, m.title, m.album_name, m.genre, 
              m.created_at, m.updated_at, a.name as artist_name
       FROM music m
       INNER JOIN artists a ON m.artist_id = a.id
       WHERE m.id = $1`,
      [id]
    );
    if (res.rowCount === 0) throw new ApiError(404, 'Music not found');
    return res.rows[0] as Music;
  } finally {
    client.release();
  }
};

export const createMusic = async (
  artist_id: number,
  title: string,
  album_name?: string | null,
  genre?: string | null
) => {
  const client = await pool.connect();
  try {
    const artistCheck = await client.query(
      'SELECT id FROM artists WHERE id = $1 AND deleted_at IS NULL',
      [artist_id]
    );
    if (artistCheck.rowCount === 0) {
      throw new ApiError(404, 'Artist not found');
    }

    const res = await client.query(
      `INSERT INTO music (artist_id, title, album_name, genre, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, artist_id, title, album_name, genre, created_at, updated_at,
                 (SELECT name FROM artists WHERE id = $1) as artist_name`,
      [artist_id, title, album_name || null, genre || null]
    );
    return res.rows[0] as Music;
  } finally {
    client.release();
  }
};

export const updateMusic = async (
  id: number,
  title?: string,
  album_name?: string | null,
  genre?: string | null
) => {
  const client = await pool.connect();
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (album_name !== undefined) {
      updates.push(`album_name = $${paramCount++}`);
      values.push(album_name);
    }
    if (genre !== undefined) {
      updates.push(`genre = $${paramCount++}`);
      values.push(genre);
    }

    if (updates.length === 0) {
      throw new ApiError(400, 'No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const res = await client.query(
      `UPDATE music SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, artist_id, title, album_name, genre, created_at, updated_at,
                 (SELECT name FROM artists WHERE artists.id = music.artist_id) as artist_name`,
      values
    );
    if (res.rowCount === 0) throw new ApiError(404, 'Music not found');
    return res.rows[0] as Music;
  } finally {
    client.release();
  }
};

export const deleteMusic = async (id: number) => {
  const client = await pool.connect();
  try {
    const res = await client.query('DELETE FROM music WHERE id = $1 RETURNING id', [id]);
    if (res.rowCount === 0) throw new ApiError(404, 'Music not found');
    return;
  } finally {
    client.release();
  }
};
