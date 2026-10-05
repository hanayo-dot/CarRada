import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { DATABASE_URL } from './config';

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

export async function runMigrations(): Promise<void> {
  const candidateDirs = [
    path.resolve(process.cwd(), 'db/migrations'),
    path.resolve(process.cwd(), '../db/migrations'),
    path.resolve(__dirname, '../../db/migrations'),
    path.resolve(__dirname, '../../../db/migrations'),
  ];

  const migrationsDir = candidateDirs.find((dir) => fs.existsSync(dir));
  if (!migrationsDir) {
    console.warn('[DB] Migrations directory not found in candidate paths. Skipping auto-migrations.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const appliedRes = await client.query('SELECT name FROM schema_migrations');
    const appliedSet = new Set(appliedRes.rows.map((row: { name: string }) => row.name));

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (!appliedSet.has(file)) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`[DB] Applying migration: ${file}`);
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[DB] Successfully applied migration: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[DB] Failed to apply migration ${file}:`, err);
          throw err;
        }
      }
    }
  } finally {
    client.release();
  }
}
