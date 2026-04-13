import { Router, Request } from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as kybController from "./kyb.controller.js";
import { reviewKybSchema } from "./kyb.schema.js";
import { env } from "../../config/env.js";

// ── Multer config ──────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, env.uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `kyb-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, and PNG files are allowed"));
    }
  },
});

// ── Routes ─────────────────────────────────────────────────

const router = Router();

// All KYB routes require authentication
router.use(authenticate);

// Get KYB status for current user's org
router.get("/status", kybController.getStatus);

// Upload a KYB document
router.post("/documents", upload.single("document"), kybController.uploadDocument);

// Admin: review an org's KYB submission
router.put(
  "/:orgId/review",
  requireRole("ADMIN"),
  validate(reviewKybSchema),
  kybController.reviewOrg,
);

export default router;
