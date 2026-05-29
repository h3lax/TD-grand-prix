import { Reservation, ReservationStatus } from '../entities/Reservation';
import { HttpError } from '../helpers/HttpError';
import { countConfirmedSeats, insertReservation } from '../repositories/reservationRepository';
import { findGrandstandById } from '../repositories/grandstandRepository';
import { findSessionById } from '../repositories/sessionRepository';
import { findSpectatorById } from '../repositories/spectatorRepository';
import { calculatePrice } from './PricingService';

export function createReservation(body: Record<string, unknown>): Reservation {
  const { spectatorId, grandstandId, sessionIds, seatCount } = body;

  if (typeof spectatorId !== 'number' || !Number.isInteger(spectatorId)) {
    throw new HttpError(400, 'spectatorId must be an integer');
  }
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

  const sessions = (sessionIds as number[]).map((id) => {
    const session = findSessionById(id);
    if (!session) throw new HttpError(404, `Session ${id} not found`);
    return session;
  });

  const spectator = findSpectatorById(spectatorId);
  if (!spectator) throw new HttpError(404, `Spectator ${spectatorId} not found`);

  for (const session of sessions) {
    const booked = countConfirmedSeats(grandstandId, session.id);
    if (grandstand.capacity - booked < seatCount) {
      throw new HttpError(409, `Not enough available seats for session ${session.id}`);
    }
  }

  const { total } = calculatePrice(grandstand, sessions, seatCount, spectator);

  return insertReservation({
    spectatorId,
    grandstandId,
    sessionIds: sessions.map((s) => s.id),
    seatCount,
    totalPrice: total,
    status: ReservationStatus.CONFIRMED,
    bookedAt: new Date().toISOString(),
    cancelledAt: null,
    refundedAmount: 0,
  });
}
