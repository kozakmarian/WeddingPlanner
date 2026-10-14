import { prisma } from '../../lib/prisma.js'; import { AppError } from '../../lib/errors.js'; import type { z } from 'zod'; import type { createBudgetItemSchema, updateBudgetItemSchema } from './budget.schemas.js';
type CreateInput = z.infer<typeof createBudgetItemSchema>; type UpdateInput = z.infer<typeof updateBudgetItemSchema>;
async function weddingId(userId: string) { const wedding = await prisma.wedding.findUnique({ where: { userId }, select: { id: true } }); if (!wedding) throw new AppError(404, 'Wedding not found.', 'NOT_FOUND'); return wedding.id; }
async function owned(id: string, userId: string) { const item = await prisma.budgetItem.findFirst({ where: { id, weddingId: await weddingId(userId) } }); if (!item) throw new AppError(404, 'Budget item not found.', 'NOT_FOUND'); return item; }
export async function list(userId: string) { return prisma.budgetItem.findMany({ where: { weddingId: await weddingId(userId) }, orderBy: { createdAt: 'desc' } }); }
export async function get(id: string, userId: string) { return owned(id, userId); }
export async function create(userId: string, data: CreateInput) { return prisma.budgetItem.create({ data: { ...data, weddingId: await weddingId(userId) } }); }
export async function update(id: string, userId: string, data: UpdateInput) { await owned(id, userId); return prisma.budgetItem.update({ where: { id }, data }); }
export async function remove(id: string, userId: string) { await owned(id, userId); await prisma.budgetItem.delete({ where: { id } }); }
