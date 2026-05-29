import { NextFunction, Request, Response } from 'express';
import { createSpectator, listSpectators } from '../services/spectatorService';

export function handleCreateSpectator(req: Request, res: Response, next: NextFunction): void {
  try {
    const spectator = createSpectator(req.body as Record<string, unknown>);
    res.status(201).json(spectator);
  } catch (err) {
    next(err);
  }
}

export function handleListSpectators(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(listSpectators());
  } catch (err) {
    next(err);
  }
}
