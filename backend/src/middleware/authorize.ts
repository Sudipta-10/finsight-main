import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import { Role } from '../types';

export const authorize = (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403));
      return;
    }
    next();
  };
