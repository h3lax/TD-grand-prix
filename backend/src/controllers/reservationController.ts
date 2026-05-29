import { NextFunction, Request, Response } from 'express';
import { createReservation } from '../services/reservationService';

export function handleCreateReservation(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(201).json(createReservation(req.body as Record<string, unknown>));
  } catch (err) {
    next(err);
  }
}
