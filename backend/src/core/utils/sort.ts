import { z } from 'zod';

export const sortOrderSchema = z.enum(['asc', 'desc']).optional().default('desc');

export function resolveSort<T extends string>(
  sortBy: T | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
  allowed: readonly T[],
  defaultField: T,
): Record<string, 'asc' | 'desc'> {
  const order = sortOrder ?? 'desc';
  const field = sortBy && allowed.includes(sortBy) ? sortBy : defaultField;
  return { [field]: order };
}
