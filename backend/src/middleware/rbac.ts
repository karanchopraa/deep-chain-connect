import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../shared/errors.js";
import type { OrgRole } from "@prisma/client";

/**
 * Role-based access control middleware factory.
 * Restricts access to users whose org role is in the allowed set.
 * Must be used AFTER the authenticate middleware.
 */
export function requireRole(...allowedRoles: OrgRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError("Authentication required before role check"));
      return;
    }

    if (!allowedRoles.includes(req.user.orgRole)) {
      next(
        new ForbiddenError(
          `Role '${req.user.orgRole}' does not have access to this resource. Required: ${allowedRoles.join(", ")}`,
        ),
      );
      return;
    }

    next();
  };
}
