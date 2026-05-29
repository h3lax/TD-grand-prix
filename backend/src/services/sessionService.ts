import { Day, DEFAULT_MULTIPLIERS, Session, SessionType } from '../entities/Session';
import { HttpError } from '../helpers/HttpError';
import { findAllSessions, insertSession } from '../repositories/sessionRepository';

export function createSession(body: Record<string, unknown>): Session {
  const { date, priceMultiplier } = body;
  const day = typeof body.day === 'string' ? body.day.toUpperCase() : body.day;
  const type = typeof body.type === 'string' ? body.type.toUpperCase() : body.type;

  if (!day || !Object.values(Day).includes(day as Day)) {
    throw new HttpError(400, 'day must be one of FRIDAY, SATURDAY, SUNDAY');
  }
  if (!type || !Object.values(SessionType).includes(type as SessionType)) {
    throw new HttpError(400, 'type must be one of PRACTICE, QUALIFYING, SPRINT, RACE');
  }
  if (!date || typeof date !== 'string') {
    throw new HttpError(400, 'date is required');
  }

  const multiplier = priceMultiplier ?? DEFAULT_MULTIPLIERS[type as SessionType];

  if (typeof multiplier !== 'number' || multiplier <= 0) {
    throw new HttpError(400, 'priceMultiplier must be a positive number');
  }

  return insertSession({
    day: day as Day,
    type: type as SessionType,
    date,
    priceMultiplier: multiplier,
  });
}

export function listSessions(): Session[] {
  return findAllSessions();
}

export { findSessionById } from '../repositories/sessionRepository';
