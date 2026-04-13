import { z } from "zod";

// ── Register ───────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().max(100).optional(),
  organizationName: z.string().min(1, "Organization name is required").max(255),
  organizationRole: z.enum(["ADMIN", "SUPPLIER", "PROCESSOR", "LOGISTICS", "BUYER", "FINANCIER"], {
    errorMap: () => ({ message: "Invalid organization role" }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Login ──────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Refresh Token ──────────────────────────────────────────

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

// ── Logout ─────────────────────────────────────────────────

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type LogoutInput = z.infer<typeof logoutSchema>;
