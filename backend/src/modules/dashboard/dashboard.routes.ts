import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

// Dashboard routes require auth + ADMIN role
router.use(authenticate, requireRole("ADMIN"));

router.get("/stats", dashboardController.getStats);

export default router;
