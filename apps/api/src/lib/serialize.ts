import { Prisma } from '@prisma/client';

/** Convert Prisma decimals to JSON numbers without altering dates or nulls. */
export function serialize<T>(value: T): T {
  if (value instanceof Prisma.Decimal) return value.toNumber() as T;
  if (Array.isArray(value)) return value.map(serialize) as T;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)])) as T;
  }
  return value;
}
