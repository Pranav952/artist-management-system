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
  const envDir = process.env.MIGRATIONS_DIR;
  const defaultDirs = [path.resolve(__dirname, '../../migrations'), path.resolve(__dirname, '../../db/migrations')];
  let migrationsDir = envDir ? path.resolve(envDir) : defaultDirs.find((d) => fs.existsSync(d));

  if (!migrationsDir) {
    console.error('No migrations directory found. Searched:', defaultDirs.join(', '));
    process.exit(1);
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const schemaDir = path.resolve(__dirname, '../../db/schema');
  const dirsToScan: string[] = [];
  if (migrationsDir) dirsToScan.push(migrationsDir);
  if (fs.existsSync(schemaDir)) dirsToScan.push(schemaDir);

  for (const dir of dirsToScan) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(dir, file);
      const name = path.relative(process.cwd(), filePath);
      if (applied.has(name)) continue;
      console.log('running migration', name);
      await applyMigration(filePath, name);
    }
  }

  console.log('migrations complete');
  process.exit(0);
}

run().catch((err) => {
  console.error('migration failed:', err.message || err);
  process.exit(1);
});
