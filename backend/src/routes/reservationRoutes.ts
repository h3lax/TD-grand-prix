import { Router } from 'express';
import { handleCancelReservation, handleCreateReservation } from '../controllers/reservationController';
import { handleGetQuote } from '../controllers/quoteController';

export const reservationRoutes = Router();

reservationRoutes.post('/quote', handleGetQuote);
reservationRoutes.post('/', handleCreateReservation);
reservationRoutes.post('/:id/cancel', handleCancelReservation);
