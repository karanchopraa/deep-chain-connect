import { Request, Response, NextFunction } from "express";
import * as kybService from "./kyb.service.js";
import type { ApiResponse } from "../../shared/types.js";
import { BadRequestError } from "../../shared/errors.js";

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await kybService.getStatus(req.user!.orgId);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new BadRequestError("No file uploaded. Send a file with field name 'document'.");
    }

    const result = await kybService.uploadDocument(req.user!.orgId, {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
      size: req.file.size,
    });

    const response: ApiResponse = { success: true, data: result };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function reviewOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const result = await kybService.reviewOrg(orgId, req.user!.userId, req.body);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
