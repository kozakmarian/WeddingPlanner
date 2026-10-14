import type { Request, Response } from 'express';
import * as service from './auth.service.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json(await service.register(input.email, input.password));
}
export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  res.json(await service.login(input.email, input.password));
}
export async function me(req: AuthenticatedRequest, res: Response) { res.json({ user: await service.getMe(req.auth!.userId) }); }
