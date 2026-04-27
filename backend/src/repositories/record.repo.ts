import { query } from '../db';

export interface RecordFilters {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

export class RecordRepository {
  async findAll(filters: RecordFilters) {
    const conditions: string[] = ['is_deleted = FALSE'];
    const params: unknown[] = [];
    let i = 1;

    if (filters.type)     { conditions.push(`type = $${i++}`);               params.push(filters.type); }
    if (filters.category) { conditions.push(`category ILIKE $${i++}`);        params.push(filters.category); }
    if (filters.dateFrom) { conditions.push(`date >= $${i++}`);               params.push(filters.dateFrom); }
    if (filters.dateTo)   { conditions.push(`date <= $${i++}`);               params.push(filters.dateTo); }
    if (filters.search)   { conditions.push(`description ILIKE $${i++}`);     params.push(`%${filters.search}%`); }

    const where = conditions.join(' AND ');
    const allowedSort = ['date', 'amount', 'category', 'created_at'];
    const sortBy = allowedSort.includes(filters.sortBy ?? '') ? filters.sortBy : 'date';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const limit = Math.min(filters.limit ?? 20, 100);
    const offset = ((filters.page ?? 1) - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      query(`
        SELECT r.*, u.first_name, u.last_name
        FROM financial_records r
        JOIN users u ON r.created_by_id = u.id
        WHERE ${where}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${i++} OFFSET $${i}
      `, [...params, limit, offset]),
      query(`
        SELECT COUNT(*) FROM financial_records WHERE ${where}
      `, params),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: filters.page ?? 1,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
    };
  }

  async findById(id: string) {
    const res = await query('SELECT * FROM financial_records WHERE id = $1 AND is_deleted = FALSE', [id]);
    return res.rows[0];
  }

  async create(data: any, userId: string) {
    const res = await query(
      `INSERT INTO financial_records (amount, type, category, date, description, created_by_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.amount, data.type, data.category, data.date, data.description, userId]
    );
    return res.rows[0];
  }

  async update(id: string, data: any) {
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
      `UPDATE financial_records SET ${fields.join(', ')} WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      params
    );
    return res.rows[0];
  }

  async softDelete(id: string) {
    await query(
      `UPDATE financial_records SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [id]
    );
  }
}

export const recordRepository = new RecordRepository();
