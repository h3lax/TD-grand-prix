import { Router } from 'express';
import { handleCreateReservation } from '../controllers/reservationController';
import { handleGetQuote } from '../controllers/quoteController';

export const reservationRoutes = Router();

reservationRoutes.post('/quote', handleGetQuote);
reservationRoutes.post('/', handleCreateReservation);
