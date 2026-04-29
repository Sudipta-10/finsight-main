import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../types/errors';

export const validate = (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const zodErrors = (result.error as any).issues || (result.error as any).errors;
      const errors = zodErrors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      next(new ValidationError('Validation failed', errors));
      return;
    }
    Object.defineProperty(req, target, { value: result.data, enumerable: true, writable: true });
    next();
  };
