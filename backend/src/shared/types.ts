import type { OrgRole } from "@prisma/client";

// ── JWT Payload ────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  orgId: string;
  orgRole: OrgRole;
  email: string;
}

// ── Express Request Extension ──────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ── API Response Wrapper ───────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ── Pagination ─────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: { page?: string; limit?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  return { page, limit, skip: (page - 1) * limit };
}
