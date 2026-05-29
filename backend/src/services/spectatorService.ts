import { LoyaltyTier, Spectator } from '../entities/Spectator';
import { HttpError } from '../helpers/HttpError';
import { isValidEmail } from '../helpers/emailValidator';
import { findAllSpectators, findSpectatorByEmail, insertSpectator } from '../repositories/spectatorRepository';

export function createSpectator(body: Record<string, unknown>): Spectator {
  const { name, email, birthDate, loyaltyTier } = body;

  if (!name || typeof name !== 'string') throw new HttpError(400, 'name is required');
  if (!email || typeof email !== 'string') throw new HttpError(400, 'email is required');
  if (!isValidEmail(email)) throw new HttpError(400, 'email format is invalid');
  if (!birthDate || typeof birthDate !== 'string') throw new HttpError(400, 'birthDate is required');

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) throw new HttpError(400, 'birthDate is not a valid date');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (birth >= todayStart) throw new HttpError(400, 'birthDate must be in the past');

  const normalizedTier = typeof loyaltyTier === 'string' ? loyaltyTier.toUpperCase() : loyaltyTier;
  if (normalizedTier !== undefined && !Object.values(LoyaltyTier).includes(normalizedTier as LoyaltyTier)) {
    throw new HttpError(400, 'loyaltyTier must be one of NONE, SILVER, GOLD');
  }
  if (findSpectatorByEmail(email)) throw new HttpError(409, 'email already in use');

  return insertSpectator({
    name,
    email,
    birthDate,
    loyaltyTier: (normalizedTier ?? LoyaltyTier.NONE) as LoyaltyTier,
    createdAt: new Date().toISOString(),
  });
}

export function listSpectators(): Spectator[] {
  return findAllSpectators();
}

export { findSpectatorById } from '../repositories/spectatorRepository';;
