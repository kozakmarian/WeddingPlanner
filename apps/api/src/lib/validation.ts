import { z } from 'zod';

const numericString = /^\d+(?:\.\d+)?$/;
const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Accept JSON numbers and form-style decimal strings, but no JavaScript coercions. */
export function finiteNumber() {
  return z
    .union([
      z.number().finite(),
      z.string().trim().regex(numericString, 'Expected a finite numeric value.').transform(Number),
    ])
    .pipe(z.number().finite());
}

export function nonnegativeNumber() {
  return finiteNumber().pipe(z.number().nonnegative());
}

export function nonnegativeInteger() {
  return finiteNumber().pipe(z.number().int().nonnegative());
}

/** Parse date-only form input at UTC midnight, avoiding local-timezone date shifts. */
export const dateOnlySchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    const match = dateOnly.exec(value);
    if (!match) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expected a valid YYYY-MM-DD date.',
      });
      return;
    }
    const [, year, month, day] = match;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getUTCFullYear() !== Number(year) ||
      parsed.getUTCMonth() + 1 !== Number(month) ||
      parsed.getUTCDate() !== Number(day)
    ) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Expected a real calendar date.' });
    }
  })
  .transform((value) => new Date(`${value}T00:00:00.000Z`));
