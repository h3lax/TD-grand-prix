import { HttpError } from '../helpers/HttpError';
import { findGrandstandById } from '../repositories/grandstandRepository';
import { findSessionById } from '../repositories/sessionRepository';
import { findSpectatorById } from '../repositories/spectatorRepository';
import { calculatePrice, PriceDetail } from './PricingService';

export function getQuote(body: Record<string, unknown>): PriceDetail {
  const { grandstandId, sessionIds, seatCount, spectatorId } = body;

  if (typeof grandstandId !== 'number' || !Number.isInteger(grandstandId)) {
    throw new HttpError(400, 'grandstandId must be an integer');
  }
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
    throw new HttpError(400, 'sessionIds must be a non-empty array');
  }
  if (!sessionIds.every((id) => typeof id === 'number' && Number.isInteger(id))) {
    throw new HttpError(400, 'sessionIds must contain integers');
  }
  if (typeof seatCount !== 'number' || !Number.isInteger(seatCount) || seatCount < 1 || seatCount > 6) {
    throw new HttpError(400, 'seatCount must be an integer between 1 and 6');
  }

  const grandstand = findGrandstandById(grandstandId);
  if (!grandstand) throw new HttpError(404, `Grandstand ${grandstandId} not found`);

  const sessions = sessionIds.map((id: number) => {
    const session = findSessionById(id);
    if (!session) throw new HttpError(404, `Session ${id} not found`);
    return session;
  });

let spectator;

if (spectatorId !== undefined) {
  if (typeof spectatorId !== 'number' || !Number.isInteger(spectatorId)) {
    throw new HttpError(400, 'spectatorId must be an integer');
  }
  
  spectator = findSpectatorById(spectatorId);
  if (!spectator) {
    throw new HttpError(404, `Spectator ${spectatorId} not found`);
  }
}

  return calculatePrice(grandstand, sessions, seatCount, spectator);
}
