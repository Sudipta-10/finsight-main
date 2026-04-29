import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../types/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError || err.name === 'AppError' || err.name === 'ValidationError') {
    const errorDetails = err as any;
    return res.status(errorDetails.statusCode || 400).json({
      statusCode: errorDetails.statusCode || 400,
      message: err.message,
      errors: err.name === 'ValidationError' ? errorDetails.errors : undefined,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
  
  console.error(err);
  require('fs').appendFileSync('/tmp/finsight-error.log', err.stack + '\n');
  return res.status(500).json({
    statusCode: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};
