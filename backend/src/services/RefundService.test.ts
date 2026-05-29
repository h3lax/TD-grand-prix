import { calculateRefund } from './RefundService';

const reference = new Date('2025-06-01T00:00:00Z');

describe('RefundService — rule 8', () => {
  it('returns rate 1 and full refund when more than 7 days before first session', () => {
    const firstSession = new Date('2025-06-09T00:00:00Z');
    const result = calculateRefund(firstSession, 500, reference);

    expect(result.rate).toBe(1);
    expect(result.refundedAmount).toBe(500);
    expect(result.daysUntilFirstSession).toBe(8);
  });

  it('returns rate 0 and no refund when exactly 7 days before first session', () => {
    const firstSession = new Date('2025-06-08T00:00:00Z');
    const result = calculateRefund(firstSession, 500, reference);

    expect(result.rate).toBe(0);
    expect(result.refundedAmount).toBe(0);
    expect(result.daysUntilFirstSession).toBe(7);
  });

  it('returns rate 0 and no refund when fewer than 7 days before first session', () => {
    const firstSession = new Date('2025-06-04T00:00:00Z');
    const result = calculateRefund(firstSession, 500, reference);

    expect(result.rate).toBe(0);
    expect(result.refundedAmount).toBe(0);
  });

  it('returns rate 0 when session date is in the past', () => {
    const firstSession = new Date('2025-05-01T00:00:00Z');
    const result = calculateRefund(firstSession, 500, reference);

    expect(result.rate).toBe(0);
    expect(result.refundedAmount).toBe(0);
  });
});
