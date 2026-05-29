import { NextFunction, Request, Response } from 'express';
import { createGrandstand, listGrandstands } from '../services/grandstandService';

export function handleCreateGrandstand(req: Request, res: Response, next: NextFunction): void {
  try {
    const grandstand = createGrandstand(req.body as Record<string, unknown>);
    res.status(201).json(grandstand);
  } catch (err) {
    next(err);
  }
}

export function handleListGrandstands(req: Request, res: Response, next: NextFunction): void {
  try {
    const { category } = req.query;
    res.json(listGrandstands(typeof category === 'string' ? category : undefined));
  } catch (err) {
    next(err);
  }
}
