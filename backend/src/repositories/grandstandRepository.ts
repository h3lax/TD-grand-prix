import { getDb } from '../database';
import { Category, Grandstand } from '../entities/Grandstand';

type GrandstandRow = {
  id: number;
  name: string;
  location: string;
  category: string;
  capacity: number;
  base_price: number;
  covered: number;
};

function toGrandstand(row: GrandstandRow): Grandstand {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    category: row.category as Category,
    capacity: row.capacity,
    basePrice: row.base_price,
    covered: row.covered === 1,
  };
}

export function insertGrandstand(data: Omit<Grandstand, 'id'>): Grandstand {
  const result = getDb()
    .prepare('INSERT INTO grandstands (name, location, category, capacity, base_price, covered) VALUES (?, ?, ?, ?, ?, ?)')
    .run(data.name, data.location, data.category, data.capacity, data.basePrice, data.covered ? 1 : 0);
  return { ...data, id: result.lastInsertRowid as number };
}

export function findAllGrandstands(category?: Category): Grandstand[] {
  if (category) {
    return (getDb().prepare('SELECT * FROM grandstands WHERE category = ?').all(category) as GrandstandRow[]).map(toGrandstand);
  }
  return (getDb().prepare('SELECT * FROM grandstands').all() as GrandstandRow[]).map(toGrandstand);
}

export function findGrandstandById(id: number): Grandstand | undefined {
  const row = getDb().prepare('SELECT * FROM grandstands WHERE id = ?').get(id) as GrandstandRow | undefined;
  return row ? toGrandstand(row) : undefined;
}
