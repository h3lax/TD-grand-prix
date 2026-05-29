import { NextFunction, Request, Response } from 'express';
import { getQuote } from '../services/quoteService';

export function handleGetQuote(req: Request, res: Response, next: NextFunction): void {
  try {
    res.json(getQuote(req.body as Record<string, unknown>));
  } catch (err) {
    next(err);
  }
}
