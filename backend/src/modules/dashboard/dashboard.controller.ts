import { Request, Response, NextFunction } from "express";
import * as dashboardService from "./dashboard.service.js";
import type { ApiResponse } from "../../shared/types.js";

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getDashboardStats();
    const response: ApiResponse = { success: true, data: stats };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
