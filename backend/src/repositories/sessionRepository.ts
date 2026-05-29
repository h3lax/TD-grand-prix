import { getDb } from '../database';
import { Day, Session, SessionType } from '../entities/Session';

type SessionRow = {
  id: number;
  day: string;
  type: string;
  date: string;
  price_multiplier: number;
};

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    day: row.day as Day,
    type: row.type as SessionType,
    date: row.date,
    priceMultiplier: row.price_multiplier,
  };
}

export function insertSession(data: Omit<Session, 'id'>): Session {
  const result = getDb()
    .prepare('INSERT INTO sessions (day, type, date, price_multiplier) VALUES (?, ?, ?, ?)')
    .run(data.day, data.type, data.date, data.priceMultiplier);
  return { ...data, id: result.lastInsertRowid as number };
}

export function findAllSessions(): Session[] {
  return (getDb().prepare('SELECT * FROM sessions').all() as SessionRow[]).map(toSession);
}

export function findSessionById(id: number): Session | undefined {
  const row = getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined;
  return row ? toSession(row) : undefined;
}

export function findSessionsByIds(ids: number[]): Session[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(', ');
  return (getDb().prepare(`SELECT * FROM sessions WHERE id IN (${placeholders})`).all(...ids) as SessionRow[]).map(toSession);
}
