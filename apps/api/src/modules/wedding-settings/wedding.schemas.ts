import { z } from 'zod';
export const updateWeddingSchema = z.object({ name: z.string().min(1), date: z.coerce.date(), location: z.string().min(1), budget: z.coerce.number().nonnegative() });

