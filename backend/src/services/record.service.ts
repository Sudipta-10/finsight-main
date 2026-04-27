import { recordRepository, RecordFilters } from '../repositories/record.repo';
import { AppError } from '../types/errors';
import { redis } from './redis.service';

const clearAnalyticsCache = async () => {
  try {
    const keys = await redis.keys('analytics:*');
    if (keys.length > 0) await redis.del(...keys);
  } catch (e) {
    console.error('Failed to clear cache', e);
  }
};

export class RecordService {
  async list(filters: RecordFilters) {
    return await recordRepository.findAll(filters);
  }

  async getById(id: string) {
    const record = await recordRepository.findById(id);
    if (!record) throw new AppError('Record not found', 404);
    return record;
  }

  async create(data: any, userId: string) {
    const res = await recordRepository.create(data, userId);
    clearAnalyticsCache().catch(console.error);
    return res;
  }

  async update(id: string, data: any) {
    const existing = await recordRepository.findById(id);
    if (!existing) throw new AppError('Record not found', 404);
    const res = await recordRepository.update(id, data);
    clearAnalyticsCache().catch(console.error);
    return res;
  }

  async delete(id: string) {
    const existing = await recordRepository.findById(id);
    if (!existing) throw new AppError('Record not found', 404);
    await recordRepository.softDelete(id);
    clearAnalyticsCache().catch(console.error);
  }
}

export const recordService = new RecordService();
