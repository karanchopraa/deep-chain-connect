import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../shared/errors.js";
import { env } from "../config/env.js";
import type { ApiResponse } from "../shared/types.js";

/**
 * Global error handler middleware.
 * Catches all errors and returns consistent JSON responses.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log the error in development
  if (env.isDev) {
    console.error("─── Error ───────────────────────────────");
    console.error(err);
    console.error("──────────────────────────────────────────");
  }

  // Handle our custom AppError subclasses
  if (err instanceof ValidationError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        errors: err.errors,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma known errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    if (prismaErr.code === "P2002") {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "CONFLICT",
          message: `A record with that ${prismaErr.meta?.target?.join(", ") || "field"} already exists`,
        },
      };
      res.status(409).json(response);
      return;
    }
  }

  // Fallback for unexpected errors
  const response: ApiResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.isDev ? err.message : "An unexpected error occurred",
    },
  };
  res.status(500).json(response);
}
