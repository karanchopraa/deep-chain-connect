import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import kybRoutes from "./modules/kyb/kyb.routes.js";
import eventsRoutes from "./modules/events/events.routes.js";

const app = express();

import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";

// ── Global Middleware ──────────────────────────────────────

app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    },
  });
});

// ── API Routes ─────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/kyb", kybRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);

// ── 404 Handler ────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint does not exist",
    },
  });
});

// ── Global Error Handler (must be last) ────────────────────

app.use(errorHandler);

export default app;
