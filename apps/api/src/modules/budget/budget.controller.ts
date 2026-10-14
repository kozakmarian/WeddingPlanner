import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { idSchema, createBudgetItemSchema, updateBudgetItemSchema } from './budget.schemas.js';
import * as service from './budget.service.js';
import { serialize } from '../../lib/serialize.js';
export async function listBudgetItems(req: AuthenticatedRequest, res: Response) {
  res.json(serialize(await service.list(req.auth!.userId)));
}
export async function getBudgetItem(req: AuthenticatedRequest, res: Response) {
  res.json(serialize(await service.get(idSchema.parse(req.params).id, req.auth!.userId)));
}
export async function createBudgetItem(req: AuthenticatedRequest, res: Response) {
  res
    .status(201)
    .json(
      serialize(await service.create(req.auth!.userId, createBudgetItemSchema.parse(req.body))),
    );
}
export async function updateBudgetItem(req: AuthenticatedRequest, res: Response) {
  res.json(
    serialize(
      await service.update(
        idSchema.parse(req.params).id,
        req.auth!.userId,
        updateBudgetItemSchema.parse(req.body),
      ),
    ),
  );
}
export async function deleteBudgetItem(req: AuthenticatedRequest, res: Response) {
  await service.remove(idSchema.parse(req.params).id, req.auth!.userId);
  res.status(204).send();
}
