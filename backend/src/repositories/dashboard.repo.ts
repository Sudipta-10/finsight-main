import { query } from '../db';

export class DashboardRepository {
  async getSummary(startDate?: string, endDate?: string) {
    const conditions = ['is_deleted = FALSE'];
    const params: unknown[] = [];
    let i = 1;
    if (startDate) { conditions.push(`date >= $${i++}`); params.push(startDate); }
    if (endDate) { conditions.push(`date <= $${i++}`); params.push(endDate); }
    
    const where = conditions.join(' AND ');
    const res = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(id) as transaction_count
      FROM financial_records 
      WHERE ${where}
    `, params);
    
    const { total_income, total_expense, transaction_count } = res.rows[0];
    const income = parseFloat(total_income);
    const expense = parseFloat(total_expense);
    const profitMargin = income > 0 ? ((income - expense) / income) * 100 : 0;
    
    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      transactionCount: parseInt(transaction_count, 10),
      profitMargin: parseFloat(profitMargin.toFixed(1))
    };
  }

  async getCategoryBreakdown(type: 'INCOME' | 'EXPENSE', startDate?: string, endDate?: string) {
    const conditions = ['is_deleted = FALSE', 'type = $1'];
    const params: unknown[] = [type];
    let i = 2;
    if (startDate) { conditions.push(`date >= $${i++}`); params.push(startDate); }
    if (endDate) { conditions.push(`date <= $${i++}`); params.push(endDate); }
    
    const where = conditions.join(' AND ');
    const res = await query(`
      SELECT category, SUM(amount) as total
      FROM financial_records
      WHERE ${where}
      GROUP BY category
      ORDER BY total DESC
    `, params);
    
    return res.rows.map(r => ({
      category: r.category,
      total: parseFloat(r.total)
    }));
  }

  async getTrend(startDate?: string, endDate?: string) {
    const conditions = ['is_deleted = FALSE'];
    const params: unknown[] = [];
    let i = 1;
    if (startDate) { conditions.push(`date >= $${i++}`); params.push(startDate); }
    if (endDate) { conditions.push(`date <= $${i++}`); params.push(endDate); }
    
    const where = conditions.join(' AND ');
    const res = await query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
      FROM financial_records
      WHERE ${where}
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `, params);

    return res.rows.map(r => ({
      month: r.month,
      income: parseFloat(r.income),
      expense: parseFloat(r.expense)
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
