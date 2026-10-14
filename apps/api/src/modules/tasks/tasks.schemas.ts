import { z } from 'zod';
export const idSchema = z.object({ id: z.string().cuid() });
const fields = { title: z.string().trim().min(1), description: z.string().trim().nullable().optional(), dueDate: z.coerce.date().nullable().optional(), completed: z.boolean().optional() };
export const createTaskSchema = z.object(fields);
export const updateTaskSchema = z.object(fields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
