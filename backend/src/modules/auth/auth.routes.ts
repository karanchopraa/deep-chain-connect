import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.schema.js";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(logoutSchema), authController.logout);

// Protected routes
router.get("/me", authenticate, authController.getMe);

export default router;
