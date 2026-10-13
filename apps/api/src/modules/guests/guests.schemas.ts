import { z } from 'zod';
export const guestSchema = z.object({ name: z.string().min(1), email: z.string().email().optional(), attendance: z.enum(['PENDING', 'ATTENDING', 'DECLINED']).optional(), accompanyingGuests: z.coerce.number().int().min(0).optional() });

