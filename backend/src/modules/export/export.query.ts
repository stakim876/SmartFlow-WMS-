import { z } from 'zod';

export const exportDateQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export function parseExportDateRange(query: z.infer<typeof exportDateQuerySchema>) {
  const from = query.from ? new Date(query.from) : undefined;
  const to = query.to ? new Date(`${query.to}T23:59:59.999`) : undefined;
  return { from, to };
}

export function buildCreatedAtFilter(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: from } : {}),
    ...(to ? { lte: to } : {}),
  };
}
