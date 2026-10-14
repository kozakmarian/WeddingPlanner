import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { idSchema, createGuestSchema, updateGuestSchema } from './guests.schemas.js';
import * as service from './guests.service.js';
export async function listGuests(req: AuthenticatedRequest, res: Response) {
  res.json(await service.list(req.auth!.userId));
}
export async function getGuest(req: AuthenticatedRequest, res: Response) {
  res.json(await service.get(idSchema.parse(req.params).id, req.auth!.userId));
}
export async function createGuest(req: AuthenticatedRequest, res: Response) {
  res.status(201).json(await service.create(req.auth!.userId, createGuestSchema.parse(req.body)));
}
export async function updateGuest(req: AuthenticatedRequest, res: Response) {
  res.json(
    await service.update(
      idSchema.parse(req.params).id,
      req.auth!.userId,
      updateGuestSchema.parse(req.body),
    ),
  );
}
export async function deleteGuest(req: AuthenticatedRequest, res: Response) {
  await service.remove(idSchema.parse(req.params).id, req.auth!.userId);
  res.status(204).send();
}
