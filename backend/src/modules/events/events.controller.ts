import { Request, Response, NextFunction } from "express";
import * as eventsService from "./events.service.js";
import type { ApiResponse } from "../../shared/types.js";

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventsService.createEvent(
      req.user!.orgId,
      req.user!.userId,
      req.body,
    );
    const response: ApiResponse = { success: true, data: result };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventsService.listEvents(req.query as any);
    const response: ApiResponse = {
      success: true,
      data: result.events,
      meta: result.meta,
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function getEventById(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await eventsService.getEventById(eventId);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
