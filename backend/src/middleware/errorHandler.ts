import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import type { ApiError } from '../types/index.js';

interface CustomError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // Use statusCode from error if available
  const statusCode = err.statusCode || 500;

  // Default error response
  const apiError: ApiError = {
    error: statusCode === 401 ? 'Unauthorized' :
           statusCode === 404 ? 'Not Found' :
           'Internal Server Error',
    message: config.nodeEnv === 'development' 
      ? err.message 
      : statusCode >= 500 ? 'An unexpected error occurred' : err.message,
    statusCode,
  };

  res.status(statusCode).json(apiError);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
}
