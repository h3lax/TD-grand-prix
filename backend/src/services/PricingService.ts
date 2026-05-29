import { Grandstand } from '../entities/Grandstand';
import { Day, Session } from '../entities/Session';
import { LoyaltyTier, Spectator } from '../entities/Spectator';
import { calculateAge } from '../helpers/ageCalculator';

export interface LineItem {
  sessionId: number;
  sessionLabel: string;
  unitPrice: number;
  subtotal: number;
}

export interface PriceDetail {
  lineItems: LineItem[];
  baseTotal: number;
  isWeekendPass: boolean;
  weekendDiscount: number;
  loyaltyTier: LoyaltyTier;
  loyaltyDiscount: number;
  youthDiscount: number;
  total: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function computeWeekendDiscount(baseTotal: number, sessions: Session[]): { isWeekendPass: boolean; discount: number } {
  const days = new Set(sessions.map((s) => s.day));
  const isWeekendPass = days.has(Day.FRIDAY) && days.has(Day.SATURDAY) && days.has(Day.SUNDAY);
  return { isWeekendPass, discount: isWeekendPass ? round2(baseTotal * 0.2) : 0 };
}

function loyaltyRate(tier: LoyaltyTier): number {
  if (tier === LoyaltyTier.GOLD) return 0.1;
  if (tier === LoyaltyTier.SILVER) return 0.05;
  return 0;
}

export function calculatePrice(
  grandstand: Grandstand,
  sessions: Session[],
  seatCount: number,
  spectator?: Spectator,
): PriceDetail {
  const lineItems: LineItem[] = sessions.map((session) => {
    const unitPrice = round2(grandstand.basePrice * session.priceMultiplier);
    return {
      sessionId: session.id,
      sessionLabel: `${session.day} — ${session.type}`,
      unitPrice,
      subtotal: round2(unitPrice * seatCount),
    };
  });

  const baseTotal = round2(lineItems.reduce((sum, item) => sum + item.subtotal, 0));

  const { isWeekendPass, discount: weekendDiscount } = computeWeekendDiscount(baseTotal, sessions);
  const afterWeekend = round2(baseTotal - weekendDiscount);

  const tier = spectator?.loyaltyTier ?? LoyaltyTier.NONE;
  const loyaltyDiscount = round2(afterWeekend * loyaltyRate(tier));
  const afterLoyalty = round2(afterWeekend - loyaltyDiscount);

  const age = spectator ? calculateAge(new Date(spectator.birthDate), new Date()) : Infinity;
  const youthDiscount = age < 16 ? round2(afterLoyalty * 0.5) : 0;
  const total = round2(afterLoyalty - youthDiscount);

  return {
    lineItems,
    baseTotal,
    isWeekendPass,
    weekendDiscount,
    loyaltyTier: tier,
    loyaltyDiscount,
    youthDiscount,
    total,
  };
}
