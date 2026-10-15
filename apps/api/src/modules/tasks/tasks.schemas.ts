import { z } from 'zod';
import { dateOnlySchema } from '../../lib/validation.js';
export const idSchema = z.object({ id: z.string().cuid() });
const fields = {
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2_000).nullable().optional(),
  dueDate: dateOnlySchema.nullable().optional(),
  completed: z.boolean().optional(),
};
export const createTaskSchema = z.object(fields).strict();
export const updateTaskSchema = z
  .object(fields)
  .strict()
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
