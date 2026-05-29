export enum LoyaltyTier {
  NONE = 'NONE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export interface Spectator {
  id: number;
  name: string;
  email: string;
  birthDate: string;
  loyaltyTier: LoyaltyTier;
  createdAt: string;
}
