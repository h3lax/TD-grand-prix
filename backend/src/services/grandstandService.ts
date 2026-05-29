import { Category, Grandstand } from '../entities/Grandstand';
import { HttpError } from '../helpers/HttpError';
import { findAllGrandstands, insertGrandstand } from '../repositories/grandstandRepository';

export function createGrandstand(body: Record<string, unknown>): Grandstand {
  const { name, location, category, capacity, basePrice, covered } = body;

  if (!name || typeof name !== 'string') throw new HttpError(400, 'name is required');
  if (!location || typeof location !== 'string') throw new HttpError(400, 'location is required');
  const normalizedCategory = typeof category === 'string' ? category.toUpperCase() : category;
  if (!normalizedCategory || !Object.values(Category).includes(normalizedCategory as Category)) {
    throw new HttpError(400, 'category must be one of BRONZE, SILVER, GOLD, PLATINUM');
  }
  if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity < 1) {
    throw new HttpError(400, 'capacity must be a positive integer');
  }
  if (typeof basePrice !== 'number' || basePrice <= 0) {
    throw new HttpError(400, 'basePrice must be a positive number');
  }

  return insertGrandstand({
    name,
    location,
    category: normalizedCategory as Category,
    capacity,
    basePrice,
    covered: typeof covered === 'boolean' ? covered : false,
  });
}

export function listGrandstands(category?: string, covered?: string): Grandstand[] {
  const normalizedCategory = category?.toUpperCase();
  if (normalizedCategory !== undefined && !Object.values(Category).includes(normalizedCategory as Category)) {
    throw new HttpError(400, 'category must be one of BRONZE, SILVER, GOLD, PLATINUM');
  }
  if (covered !== undefined && covered !== 'true' && covered !== 'false') {
    throw new HttpError(400, 'covered must be true or false');
  }

  const coveredFilter = covered === undefined ? undefined : covered === 'true';
  return findAllGrandstands(normalizedCategory as Category | undefined, coveredFilter);
}

export {findGrandstandById} from '../repositories/grandstandRepository';
