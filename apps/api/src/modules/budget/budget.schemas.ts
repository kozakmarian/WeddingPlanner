import { z } from 'zod';
export const idSchema = z.object({ id: z.string().cuid() });
const fields = { name: z.string().trim().min(1), category: z.string().trim().min(1), estimatedCost: z.coerce.number().nonnegative(), actualCost: z.coerce.number().nonnegative().nullable().optional() };
export const createBudgetItemSchema = z.object(fields);
export const updateBudgetItemSchema = z.object(fields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
