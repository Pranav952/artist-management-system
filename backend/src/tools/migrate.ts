import fs from 'fs';
import path from 'path';
import pool from '../config/db';

async function ensureMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT name FROM migrations');
    const rows = res.rows as Array<{ name: string }>;
    return new Set(rows.map((r) => r.name));
  } finally {
    client.release();
  }
}

async function applyMigration(filePath: string, name: string) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`applied: ${name}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function run() {
  const migrationsDir = path.resolve(__dirname, '../../migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('No migrations directory found at', migrationsDir);
    process.exit(1);
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const filePath = path.join(migrationsDir, file);
    console.log('running migration', file);
    await applyMigration(filePath, file);
  }

  console.log('migrations complete');
  process.exit(0);
}

run().catch((err) => {
  console.error('migration failed:', err.message || err);
  process.exit(1);
});
