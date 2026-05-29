import { Router } from 'express';
import { handleCreateGrandstand, handleListGrandstands } from '../controllers/grandstandController';

export const grandstandRoutes = Router();

grandstandRoutes.post('/', handleCreateGrandstand);
grandstandRoutes.get('/', handleListGrandstands);
