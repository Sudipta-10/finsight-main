import { dashboardRepository } from '../repositories/dashboard.repo';
import { redis } from './redis.service';

export class DashboardService {
  async getAnalytics(startDate?: string, endDate?: string) {
    const cacheKey = `analytics:${startDate || 'all'}:${endDate || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [summary, incomeBreakdown, expenseBreakdown, trend] = await Promise.all([
      dashboardRepository.getSummary(startDate, endDate),
      dashboardRepository.getCategoryBreakdown('INCOME', startDate, endDate),
      dashboardRepository.getCategoryBreakdown('EXPENSE', startDate, endDate),
      dashboardRepository.getTrend(startDate, endDate)
    ]);

    const result = {
      summary,
      breakdown: {
        income: incomeBreakdown,
        expense: expenseBreakdown
      },
      trend
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    return result;
  }
}

export const dashboardService = new DashboardService();
