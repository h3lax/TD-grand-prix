import { getDb } from '../database';
import { LoyaltyTier, Spectator } from '../entities/Spectator';

type SpectatorRow = {
  id: number;
  name: string;
  email: string;
  birth_date: string;
  loyalty_tier: string;
  created_at: string;
};

function toSpectator(row: SpectatorRow): Spectator {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    birthDate: row.birth_date,
    loyaltyTier: row.loyalty_tier as LoyaltyTier,
    createdAt: row.created_at,
  };
}

export function insertSpectator(data: Omit<Spectator, 'id'>): Spectator {
  const result = getDb()
    .prepare('INSERT INTO spectators (name, email, birth_date, loyalty_tier, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(data.name, data.email, data.birthDate, data.loyaltyTier, data.createdAt);
  return { ...data, id: result.lastInsertRowid as number };
}

export function findAllSpectators(): Spectator[] {
  return (getDb().prepare('SELECT * FROM spectators').all() as SpectatorRow[]).map(toSpectator);
}

export function findSpectatorById(id: number): Spectator | undefined {
  const row = getDb().prepare('SELECT * FROM spectators WHERE id = ?').get(id) as SpectatorRow | undefined;
  return row ? toSpectator(row) : undefined;
}

export function findSpectatorByEmail(email: string): Spectator | undefined {
  const row = getDb().prepare('SELECT * FROM spectators WHERE email = ?').get(email) as SpectatorRow | undefined;
  return row ? toSpectator(row) : undefined;
}
