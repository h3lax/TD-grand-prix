export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface Reservation {
  id: number;
  spectatorId: number;
  grandstandId: number;
  sessionIds: number[];
  seatCount: number;
  totalPrice: number;
  status: ReservationStatus;
  bookedAt: string;
  cancelledAt: string | null;
  refundedAmount: number;
}
