import { z } from "zod";

export const listInventoryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["IN_TRANSIT", "IN_STORAGE", "PROCESSING", "PROCESSED", "DELIVERED"]).optional(),
  sku: z.string().optional(),
});

export type ListInventoryQuery = z.infer<typeof listInventoryQuerySchema>;
