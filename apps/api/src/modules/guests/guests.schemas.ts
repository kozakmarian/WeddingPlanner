import { z } from 'zod';
import { nonnegativeInteger } from '../../lib/validation.js';
export const idSchema = z.object({ id: z.string().cuid() });
const fields = {
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).nullable().optional(),
  attendance: z.enum(['PENDING', 'ATTENDING', 'DECLINED']).optional(),
  accompanyingGuests: nonnegativeInteger().optional(),
};
export const createGuestSchema = z.object(fields).strict();
export const updateGuestSchema = z
  .object(fields)
  .strict()
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
