import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;");
    console.log("Avatar column successfully added!");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
