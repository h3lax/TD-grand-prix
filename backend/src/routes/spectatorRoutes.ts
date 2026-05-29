import { Router } from 'express';
import { handleCreateSpectator, handleListSpectators } from '../controllers/spectatorController';

export const spectatorRoutes = Router();

spectatorRoutes.post('/', handleCreateSpectator);
spectatorRoutes.get('/', handleListSpectators);
