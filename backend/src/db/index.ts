import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production') 
    ? { rejectUnauthorized: false } 
    : undefined
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
