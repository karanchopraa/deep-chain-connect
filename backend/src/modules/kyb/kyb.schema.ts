import { z } from "zod";

// ── Review KYB (Admin action) ──────────────────────────────

export const reviewKybSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    errorMap: () => ({ message: "Status must be APPROVED or REJECTED" }),
  }),
  reviewNote: z.string().max(1000).optional(),
});

export type ReviewKybInput = z.infer<typeof reviewKybSchema>;
