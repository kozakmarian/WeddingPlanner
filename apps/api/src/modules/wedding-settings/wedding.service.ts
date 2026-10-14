import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/errors.js';
import type { z } from 'zod';
import type { updateWeddingSchema } from './wedding.schemas.js';
type UpdateWedding = z.infer<typeof updateWeddingSchema>;
async function ownedWedding(userId: string) {
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) throw new AppError(404, 'Wedding not found.', 'NOT_FOUND');
  return wedding;
}
export async function getWedding(userId: string) {
  return ownedWedding(userId);
}
export async function updateWedding(userId: string, data: UpdateWedding) {
  const wedding = await ownedWedding(userId);
  return prisma.wedding.update({ where: { id: wedding.id }, data });
}
