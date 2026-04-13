import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import * as eventsController from "./events.controller.js";
import { createEventSchema } from "./events.schema.js";

const router = Router();

// All event routes require authentication
router.use(authenticate);

// Create a new supply chain event
// Roles: ADMIN, SUPPLIER, PROCESSOR, LOGISTICS
router.post(
  "/",
  requireRole("ADMIN", "SUPPLIER", "PROCESSOR", "LOGISTICS"),
  validate(createEventSchema),
  eventsController.createEvent,
);

// List events (all authenticated users can view)
router.get("/", eventsController.listEvents);

// Get event detail by ID
router.get("/:id", eventsController.getEventById);

export default router;
