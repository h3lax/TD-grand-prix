import { NextFunction, Request, Response } from 'express';
import { cancelReservationById, createReservation } from '../services/reservationService';

export function handleCreateReservation(req: Request, res: Response, next: NextFunction): void {
  try {
    res.status(201).json(createReservation(req.body as Record<string, unknown>));
  } catch (err) {
    next(err);
  }
}

export function handleCancelReservation(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'id must be an integer' });
      return;
    }
    res.json(cancelReservationById(id));
  } catch (err) {
    next(err);
  }
}
