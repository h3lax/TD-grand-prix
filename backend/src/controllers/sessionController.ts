import { NextFunction, Request, Response } from 'express';
import { createSession, listSessions } from '../services/sessionService';

export function handleCreateSession(req: Request, res: Response, next: NextFunction): void {
  try {
    const session = createSession(req.body as Record<string, unknown>);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export function handleListSessions(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(listSessions());
  } catch (err) {
    next(err);
  }
}
