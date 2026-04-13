import { Request, Response, NextFunction } from "express";
import * as inventoryService from "./inventory.service.js";
import type { ApiResponse } from "../../shared/types.js";

export async function listInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.listInventory(req.query as any);
    const response: ApiResponse = {
      success: true,
      data: result.items,
      meta: result.meta,
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getTraceability(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await inventoryService.getTraceability(req.params.sku);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
