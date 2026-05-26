import app from './app';
import { initDb } from './database';

const { PORT, DATABASE_PATH } = process.env;

if (!PORT) throw new Error('Missing required environment variable: PORT');
if (!DATABASE_PATH) throw new Error('Missing required environment variable: DATABASE_PATH');

initDb(DATABASE_PATH);

app.listen(Number(PORT));
