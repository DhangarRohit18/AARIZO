export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethodType =
  | 'UPI'
  | 'CARD'
  | 'NET_BANKING'
  | 'WALLET'
  | 'RAZORPAY'
  | 'OFFLINE_NEFT'
  | 'CASH'
  | 'CHEQUE';

export interface Payment {
  id: string;
  societyId: string;
  userId: string;
  residentId: string;
  residentName?: string;
  flatCode?: string;
  invoiceId: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignatureVerified?: boolean;
  paymentMethod?: PaymentMethodType;
  failureReason?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface CreateRazorpayOrderRequest {
  invoiceId: string;
  amount?: number; // Ignored by server; server reads invoice doc
  currency?: string;
  societyId?: string;
}

export interface CreateRazorpayOrderResponse {
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  invoiceId: string;
}

export interface VerifyRazorpayPaymentRequest {
  invoiceId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyRazorpayPaymentResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  transactionId?: string;
  invoiceNumber?: string;
  status?: PaymentStatus;
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount?: number;
  reason: string;
}

export interface RefundPaymentResponse {
  success: boolean;
  refundId: string;
  message: string;
  refundAmount: number;
}
