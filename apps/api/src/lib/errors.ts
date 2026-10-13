import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error { constructor(public status: number, message: string) { super(message); } }
export function notImplemented(_req: Request, _res: Response, next: NextFunction) { next(new AppError(501, 'This endpoint is part of the initial project foundation and is not implemented yet.')); }
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) return res.status(error.status).json({ error: { message: error.message } });
  console.error(error);
  return res.status(500).json({ error: { message: 'An unexpected error occurred.' } });
}

