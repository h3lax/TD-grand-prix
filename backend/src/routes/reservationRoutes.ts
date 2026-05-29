import { Router } from 'express';
import { handleGetQuote } from '../controllers/quoteController';

export const reservationRoutes = Router();

reservationRoutes.post('/quote', handleGetQuote);
