import { z } from 'zod';
export const budgetItemSchema = z.object({ name: z.string().min(1), category: z.string().min(1), estimatedCost: z.coerce.number().nonnegative(), actualCost: z.coerce.number().nonnegative().nullable().optional() });

