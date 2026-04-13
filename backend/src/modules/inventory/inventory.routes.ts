import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as inventoryController from "./inventory.controller.js";

const router = Router();

// All inventory routes require auth
router.use(authenticate);

// Global inventory
router.get("/", inventoryController.listInventory);

// Traceability lookup
router.get("/:sku/traceability", inventoryController.getTraceability);

export default router;
