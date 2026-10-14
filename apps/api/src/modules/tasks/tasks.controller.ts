import type { Response } from 'express'; import type { AuthenticatedRequest } from '../../middleware/auth.js'; import { idSchema, createTaskSchema, updateTaskSchema } from './tasks.schemas.js'; import * as service from './tasks.service.js';
export async function listTasks(req: AuthenticatedRequest, res: Response) { res.json(await service.list(req.auth!.userId)); }
export async function getTask(req: AuthenticatedRequest, res: Response) { res.json(await service.get(idSchema.parse(req.params).id, req.auth!.userId)); }
export async function createTask(req: AuthenticatedRequest, res: Response) { res.status(201).json(await service.create(req.auth!.userId, createTaskSchema.parse(req.body))); }
export async function updateTask(req: AuthenticatedRequest, res: Response) { res.json(await service.update(idSchema.parse(req.params).id, req.auth!.userId, updateTaskSchema.parse(req.body))); }
export async function deleteTask(req: AuthenticatedRequest, res: Response) { await service.remove(idSchema.parse(req.params).id, req.auth!.userId); res.status(204).send(); }
