import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../shared/errors.js";

/**
 * Express middleware factory that validates request body against a Zod schema.
 * On failure, throws a structured ValidationError with per-field messages.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const path = issue.path.join(".") || "_root";
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        next(new ValidationError(errors));
      } else {
        next(err);
      }
    }
  };
}
