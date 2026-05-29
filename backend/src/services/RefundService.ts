export interface RefundDetail {
  rate: 0 | 1;
  refundedAmount: number;
  daysUntilFirstSession: number;
}

export function calculateRefund(firstSessionDate: Date, totalPrice: number, referenceDate = new Date()): RefundDetail {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilFirstSession = Math.floor((firstSessionDate.getTime() - referenceDate.getTime()) / msPerDay);
  const rate: 0 | 1 = daysUntilFirstSession > 7 ? 1 : 0;
  return {
    rate,
    refundedAmount: Math.round(totalPrice * rate * 100) / 100,
    daysUntilFirstSession,
  };
}
