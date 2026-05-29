import { calculateAge } from './ageCalculator';

describe('calculateAge', () => {
  it('returns the correct age when the birthday has already passed this year', () => {
    expect(calculateAge(new Date('1990-01-15'), new Date('2026-05-29'))).toBe(36);
  });

  it('returns one year less when the birthday has not occurred yet this year', () => {
    expect(calculateAge(new Date('1990-12-31'), new Date('2026-05-29'))).toBe(35);
  });

  it('counts a birthday today as a completed year', () => {
    expect(calculateAge(new Date('2010-05-29'), new Date('2026-05-29'))).toBe(16);
  });

  it('does not count a birthday tomorrow as a completed year', () => {
    expect(calculateAge(new Date('2010-05-30'), new Date('2026-05-29'))).toBe(15);
  });

  it('handles a Feb 29 birthday checked after the date in a non-leap year', () => {
    expect(calculateAge(new Date('2000-02-29'), new Date('2026-03-01'))).toBe(26);
  });

  it('handles a Feb 29 birthday checked before the date in a non-leap year', () => {
    expect(calculateAge(new Date('2000-02-29'), new Date('2026-02-28'))).toBe(25);
  });
});
