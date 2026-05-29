import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from './helpers/HttpError';
import { grandstandRoutes } from './routes/grandstandRoutes';
import { sessionRoutes } from './routes/sessionRoutes';
import { spectatorRoutes } from './routes/spectatorRoutes';

const app = express();

app.use(express.json());
app.use('/grandstands', grandstandRoutes);
app.use('/sessions', sessionRoutes);
app.use('/spectators', spectatorRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
