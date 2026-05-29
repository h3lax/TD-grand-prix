import { Router } from 'express';
import { handleCreateSession, handleListSessions } from '../controllers/sessionController';

export const sessionRoutes = Router();

sessionRoutes.post('/', handleCreateSession);
sessionRoutes.get('/', handleListSessions);
