import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().positive().multipleOf(0.01).max(999_999_999_999.99),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  description: z.string().max(500).optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive().multipleOf(0.01).max(999_999_999_999.99).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  description: z.string().max(500).optional(),
});

export const recordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(['date', 'amount', 'category', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});
