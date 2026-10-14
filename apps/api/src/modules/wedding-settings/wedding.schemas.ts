import { z } from 'zod';
export const updateWeddingSchema = z.object({
  groomName: z.string().trim().min(1),
  brideName: z.string().trim().min(1),
  date: z.coerce.date(),
  budget: z.coerce.number().nonnegative(),
});
