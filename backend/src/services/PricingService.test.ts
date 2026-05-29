import { Category, Grandstand } from '../entities/Grandstand';
import { Day, Session, SessionType } from '../entities/Session';
import { LoyaltyTier, Spectator } from '../entities/Spectator';
import { calculatePrice } from './PricingService';

const grandstand: Grandstand = {
  id: 1,
  name: 'Tribune Test',
  location: 'Virage 1',
  category: Category.GOLD,
  capacity: 500,
  basePrice: 100,
  covered: false,
};

function makeSession(id: number, day: Day, type: SessionType, multiplier: number): Session {
  return { id, day, type, date: '2025-06-01', priceMultiplier: multiplier };
}

function makeSpectator(birthDate: string, tier: LoyaltyTier): Spectator {
  return { id: 1, name: 'Test', email: 'test@test.com', birthDate, loyaltyTier: tier, createdAt: '' };
}

describe('PricingService — base price (rule 1)', () => {
  it('computes unitPrice = basePrice × multiplier and subtotal × seatCount', () => {
    const sessions = [makeSession(1, Day.SUNDAY, SessionType.RACE, 1.8)];
    const result = calculatePrice(grandstand, sessions, 2);

    expect(result.lineItems[0].unitPrice).toBe(180);
    expect(result.lineItems[0].subtotal).toBe(360);
    expect(result.baseTotal).toBe(360);
    expect(result.total).toBe(360);
  });

  it('sums across multiple sessions', () => {
    const sessions = [
      makeSession(1, Day.SATURDAY, SessionType.QUALIFYING, 1.0),
      makeSession(2, Day.SUNDAY, SessionType.RACE, 1.8),
    ];
    const result = calculatePrice(grandstand, sessions, 1);

    expect(result.baseTotal).toBe(280);
  });
});

describe('PricingService — weekend pass (rule 2)', () => {
  it('applies 20% discount when all 3 days are present', () => {
    const sessions = [
      makeSession(1, Day.FRIDAY, SessionType.PRACTICE, 0.5),
      makeSession(2, Day.SATURDAY, SessionType.QUALIFYING, 1.0),
      makeSession(3, Day.SUNDAY, SessionType.RACE, 1.8),
    ];
    const result = calculatePrice(grandstand, sessions, 1);

    expect(result.isWeekendPass).toBe(true);
    expect(result.weekendDiscount).toBe(66);
    expect(result.total).toBe(264);
  });

  it('does not apply discount when only 2 days are present', () => {
    const sessions = [
      makeSession(1, Day.SATURDAY, SessionType.QUALIFYING, 1.0),
      makeSession(2, Day.SUNDAY, SessionType.RACE, 1.8),
    ];
    const result = calculatePrice(grandstand, sessions, 1);

    expect(result.isWeekendPass).toBe(false);
    expect(result.weekendDiscount).toBe(0);
  });
});

describe('PricingService — loyalty discount (rule 3)', () => {
  it('applies 5% for SILVER after weekend discount', () => {
    const sessions = [makeSession(1, Day.SUNDAY, SessionType.RACE, 1.8)];
    const spectator = makeSpectator('1990-01-01', LoyaltyTier.SILVER);
    const result = calculatePrice(grandstand, sessions, 1, spectator);

    expect(result.loyaltyDiscount).toBe(9);
    expect(result.total).toBe(171);
  });

  it('applies 10% for GOLD after weekend discount', () => {
    const sessions = [makeSession(1, Day.SUNDAY, SessionType.RACE, 1.8)];
    const spectator = makeSpectator('1990-01-01', LoyaltyTier.GOLD);
    const result = calculatePrice(grandstand, sessions, 1, spectator);

    expect(result.loyaltyDiscount).toBe(18);
    expect(result.total).toBe(162);
  });

  it('applies no discount for NONE', () => {
    const sessions = [makeSession(1, Day.SUNDAY, SessionType.RACE, 1.8)];
    const spectator = makeSpectator('1990-01-01', LoyaltyTier.NONE);
    const result = calculatePrice(grandstand, sessions, 1, spectator);

    expect(result.loyaltyDiscount).toBe(0);
  });
});

describe('PricingService — youth discount (rule 4)', () => {
  it('applies 50% for spectator under 16', () => {
    const sessions = [makeSession(1, Day.SUNDAY, SessionType.RACE, 1.8)];
    const youngBirthDate = new Date();
    youngBirthDate.setFullYear(youngBirthDate.getFullYear() - 10);
    const spectator = makeSpectator(youngBirthDate.toISOString().split('T')[0], LoyaltyTier.NONE);
    const result = calculatePrice(grandstand, sessions, 1, spectator);

    expect(result.youthDiscount).toBe(90);
    expect(result.total).toBe(90);
  });

  it('does not apply for spectator aged 16 or above', () => {
    const sessions = [makeSession(1, Day.SUNDAY, SessionType.RACE, 1.8)];
    const spectator = makeSpectator('1990-01-01', LoyaltyTier.NONE);
    const result = calculatePrice(grandstand, sessions, 1, spectator);

    expect(result.youthDiscount).toBe(0);
  });

  it('does not apply when no spectator is provided', () => {
    const sessions = [makeSession(1, Day.SUNDAY, SessionType.RACE, 1.8)];
    const result = calculatePrice(grandstand, sessions, 1);

    expect(result.youthDiscount).toBe(0);
  });
});

describe('PricingService — combined discounts', () => {
  it('chains weekend → GOLD loyalty → youth correctly', () => {
    const sessions = [
      makeSession(1, Day.FRIDAY, SessionType.PRACTICE, 0.5),
      makeSession(2, Day.SATURDAY, SessionType.QUALIFYING, 1.0),
      makeSession(3, Day.SUNDAY, SessionType.RACE, 1.8),
    ];
    const youngBirthDate = new Date();
    youngBirthDate.setFullYear(youngBirthDate.getFullYear() - 10);
    const spectator = makeSpectator(youngBirthDate.toISOString().split('T')[0], LoyaltyTier.GOLD);
    const result = calculatePrice(grandstand, sessions, 1, spectator);

    expect(result.isWeekendPass).toBe(true);
    const afterWeekend = 330 - 66;
    const afterLoyalty = afterWeekend - Math.round(afterWeekend * 0.1 * 100) / 100;
    const expected = Math.round(afterLoyalty * 0.5 * 100) / 100;
    expect(result.total).toBe(expected);
  });
});
