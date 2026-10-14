import { z } from 'zod';
export const idSchema = z.object({ id: z.string().cuid() });
const fields = { name: z.string().trim().min(1), email: z.string().email().nullable().optional(), attendance: z.enum(['PENDING', 'ATTENDING', 'DECLINED']).optional(), accompanyingGuests: z.coerce.number().int().min(0).optional() };
export const createGuestSchema = z.object(fields);
export const updateGuestSchema = z.object(fields).partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
