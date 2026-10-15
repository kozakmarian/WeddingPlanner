import { z } from 'zod';
export const registerSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(128),
  })
  .strict();
export const loginSchema = registerSchema;
