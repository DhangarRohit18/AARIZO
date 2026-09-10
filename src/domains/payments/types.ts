// Resident Payments & Dues Domain Types for CommunityOS

export type PaymentCategory =
  | 'maintenance'
  | 'electricity'
  | 'water'
  | 'parking'
  | 'amenity'
  | 'other';

export type PaymentStatus = 'DUE' | 'OVERDUE' | 'PAID' | 'PROCESSING' | 'FAILED';

export type PaymentMethod = 'upi' | 'card' | 'net_banking';

export interface PaymentReceipt {
  receiptNumber: string;
  transactionId: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  payerName: string;
  flatCode: string;
  tower: string;
  societyName: string;
  category: PaymentCategory;
  itemTitle: string;
  period: string;
}

export interface PaymentRecord {
  id: string;
  category: PaymentCategory;
  title: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  period: string;
  description: string;
  accountReference: string;
  penaltyAmount?: number;
  paymentDate?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  receipt?: PaymentReceipt;
  failureReason?: string;
}

export interface DueItem {
  id: string;
  category: PaymentCategory;
  title: string;
  amount: number;
  dueDate: string;
  status: 'DUE' | 'OVERDUE';
  period: string;
  description: string;
  accountReference: string;
  penaltyAmount?: number;
}
