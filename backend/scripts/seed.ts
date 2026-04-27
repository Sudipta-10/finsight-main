import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();

    const adminHash = await bcrypt.hash('Admin123!', 12);
    const analystHash = await bcrypt.hash('Analyst123!', 12);
    const viewerHash = await bcrypt.hash('Viewer123!', 12);

    const usersRes = await client.query(`
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES 
        ('admin@finsight.com', $1, 'Admin', 'User', 'ADMIN'),
        ('analyst@finsight.com', $2, 'Analyst', 'User', 'ANALYST'),
        ('viewer@finsight.com', $3, 'Viewer', 'User', 'VIEWER')
      RETURNING id, role
    `, [adminHash, analystHash, viewerHash]);

    const adminId = usersRes.rows.find(r => r.role === 'ADMIN').id;
    const analystId = usersRes.rows.find(r => r.role === 'ANALYST').id;

    const records = [];
    const categories = ['Sales', 'Services', 'Rent', 'Salaries', 'Software & Subscriptions', 'Office Supplies'];
    const types = ['INCOME', 'INCOME', 'EXPENSE', 'EXPENSE', 'EXPENSE', 'EXPENSE'];

    for (let i = 0; i < 50; i++) {
        const typeIdx = i % categories.length;
        const amount = (Math.random() * 500000 + 10000).toFixed(2);
        const date = new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0];
        records.push(`(${amount}, '${types[typeIdx]}', '${categories[typeIdx]}', '${date}', 'Sample seeded record', '${i % 2 === 0 ? adminId : analystId}')`);
    }

    if (records.length > 0) {
      await client.query(`
        INSERT INTO financial_records (amount, type, category, date, description, created_by_id)
        VALUES ${records.join(', ')}
      `);
    }

  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
