import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import type { ApiError } from '../types/index.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`);
  
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // Default error response
  const apiError: ApiError = {
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    statusCode: 500,
  };

  // Handle specific error types
  if (err.message.includes('Unauthorized')) {
    apiError.error = 'Unauthorized';
    apiError.statusCode = 401;
    apiError.message = err.message;
  } else if (err.message.includes('Rate limit')) {
    apiError.error = 'Too Many Requests';
    apiError.statusCode = 429;
    apiError.message = err.message;
  } else if (err.message.includes('not found') || err.message.includes('404')) {
    apiError.error = 'Not Found';
    apiError.statusCode = 404;
    apiError.message = err.message;
  }

  res.status(apiError.statusCode).json(apiError);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
}
