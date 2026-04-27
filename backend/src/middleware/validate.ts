import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../types/errors';

export const validate = (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = (result.error as any).errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      next(new ValidationError('Validation failed', errors));
      return;
    }
    req[target] = result.data;
    next();
  };
