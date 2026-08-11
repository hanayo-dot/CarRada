import { Pool } from 'pg';
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
