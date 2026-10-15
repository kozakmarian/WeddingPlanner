import { z } from 'zod';
import { dateOnlySchema, nonnegativeNumber } from '../../lib/validation.js';

const personName = z.string().trim().min(1).max(100);

export const updateWeddingSchema = z
  .object({
    groomName: personName,
    brideName: personName,
    date: dateOnlySchema,
    budget: nonnegativeNumber(),
  })
  .strict();
