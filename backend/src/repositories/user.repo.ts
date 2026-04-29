import { query } from '../db';
import { Role } from '../types';

export interface UserRow {
  id: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: Role;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const res = await query<UserRow>('SELECT id, email, password, first_name, last_name, role, approval_status, is_active, created_at, updated_at FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const res = await query<UserRow>('SELECT id, email, password, first_name, last_name, role, approval_status, is_active, created_at, updated_at FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async create(data: Omit<UserRow, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'role' | 'approval_status'> & { role?: Role; is_active?: boolean, approval_status?: string }): Promise<Omit<UserRow, 'password'>> {
    const res = await query<UserRow>(
      `INSERT INTO users (email, password, first_name, last_name, role, approval_status, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name, role, approval_status, is_active, created_at, updated_at`,
      [data.email, data.password, data.first_name, data.last_name, data.role || 'VIEWER', data.approval_status || 'APPROVED', data.is_active ?? true]
    );
    return res.rows[0];
  }

  async findAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      query(`SELECT id, email, first_name, last_name, role, approval_status, is_active, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
      query(`SELECT COUNT(*) FROM users`)
    ]);
    return {
      data: dataResult.rows,
      meta: {
        total: parseInt(countResult.rows[0].count, 10),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
      }
    };
  }

  async update(id: string, data: Partial<UserRow>) {
    const fields = [];
    const params: unknown[] = [id];
    let i = 2;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${i++}`);
        params.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    fields.push(`updated_at = NOW()`);
    const res = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING id, email, first_name, last_name, role, approval_status, is_active, created_at, updated_at`,
      params
    );
    return res.rows[0];
  }
}

export const userRepository = new UserRepository();
