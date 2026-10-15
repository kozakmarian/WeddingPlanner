import { z } from 'zod';
import { nonnegativeNumber } from '../../lib/validation.js';
export const idSchema = z.object({ id: z.string().cuid() });
const fields = {
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  // The legacy column is retained, but new UI flows no longer ask for an estimate.
  estimatedCost: nonnegativeNumber().optional().default(0),
  actualCost: nonnegativeNumber().nullable().optional(),
};
export const createBudgetItemSchema = z.object(fields).strict();
export const updateBudgetItemSchema = z
  .object(fields)
  .strict()
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
