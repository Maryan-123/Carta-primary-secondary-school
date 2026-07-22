import { z } from "zod";
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_PAGE_LIMIT } from "../config/constants";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_LIMIT).default(DEFAULT_LIMIT),
  search: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc")
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export const buildPagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1)
});
