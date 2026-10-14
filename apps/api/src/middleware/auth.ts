import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';

export interface AuthenticatedRequest extends Request { auth?: { userId: string }; }

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError(500, 'JWT_SECRET is not configured.', 'CONFIGURATION_ERROR');
  return secret;
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, jwtSecret(), { expiresIn: '7d' });
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return next(new AppError(401, 'Authentication is required.', 'UNAUTHENTICATED'));
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('Missing subject');
    req.auth = { userId: payload.sub };
    return next();
  } catch {
    return next(new AppError(401, 'Authentication token is invalid or expired.', 'UNAUTHENTICATED'));
  }
}
