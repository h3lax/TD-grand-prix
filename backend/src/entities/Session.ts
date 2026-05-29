export enum Day {
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum SessionType {
  PRACTICE = 'PRACTICE',
  QUALIFYING = 'QUALIFYING',
  SPRINT = 'SPRINT',
  RACE = 'RACE',
}

export const DEFAULT_MULTIPLIERS: Record<SessionType, number> = {
  [SessionType.PRACTICE]: 0.5,
  [SessionType.QUALIFYING]: 1,
  [SessionType.SPRINT]: 1.2,
  [SessionType.RACE]: 1.8,
};

export interface Session {
  id: number;
  day: Day;
  type: SessionType;
  date: string;
  priceMultiplier: number;
}
