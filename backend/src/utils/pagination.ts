import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional()
});

export function paginationMeta(total: number, page: number, limit: number) {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}
