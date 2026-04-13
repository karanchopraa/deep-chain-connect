import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import type { ApiResponse } from "../../shared/types.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    const response: ApiResponse = { success: true, data: result };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body.refreshToken);
    const response: ApiResponse = { success: true, data: { message: "Logged out successfully" } };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.getMe(req.user!.userId);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
