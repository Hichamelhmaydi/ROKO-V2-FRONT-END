export type PaymentStatus =
  | 'EN_ATTENTE'
  | 'REUSSI'
  | 'ECHOUE'
  | 'ANNULE'
  | 'REMBOURSE'
  | string;

export interface Payment {
  id: number;
  stripeSessionId?: string;
  amount: number;
  status: PaymentStatus;
  userId?: number;
  reservationId?: number;
  dateCreation?: string;
  datePaiement?: string;
}

export interface PaymentSessionResponse {
  sessionId: string;
  paymentId: string;
  sessionUrl?: string;
  checkoutUrl?: string;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}