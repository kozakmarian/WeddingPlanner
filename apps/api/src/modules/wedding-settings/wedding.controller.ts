import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { updateWeddingSchema } from './wedding.schemas.js';
import * as service from './wedding.service.js';
import { serialize } from '../../lib/serialize.js';
export async function getWedding(req: AuthenticatedRequest, res: Response) {
  res.json(serialize(await service.getWedding(req.auth!.userId)));
}
export async function updateWedding(req: AuthenticatedRequest, res: Response) {
  res.json(
    serialize(await service.updateWedding(req.auth!.userId, updateWeddingSchema.parse(req.body))),
  );
}
