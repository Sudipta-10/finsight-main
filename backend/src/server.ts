import app from './app';
import dotenv from 'dotenv';
import { pool } from './db';
import { redis } from './services/redis.service';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 4000;

const runMigrations = async () => {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
  for (const file of sqlFiles) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
    try {
      await pool.query(sql);
      console.log(`Migration OK: ${file}`);
    } catch (err: any) {
      if (err.code === '42710' || err.code === '42P07' || err.code === '42P06') {
        console.log(`Migration skipped (already exists): ${file}`);
      } else {
        throw err;
      }
    }
  }
};

const startServer = async () => {
  console.log("Starting server process...");
  try {
    console.log("Connecting to postgres...");
    await pool.query('SELECT 1');
    console.log("Postgres OK. Running migrations...");
    await runMigrations();
    console.log("Migrations OK. Connecting to Redis...");
    await redis.ping();
    console.log("Redis OK. Starting Express...");
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
