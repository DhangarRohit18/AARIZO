export type BillComponent =
  | 'MAINTENANCE'
  | 'WATER'
  | 'ELECTRICITY'
  | 'PARKING'
  | 'CLUBHOUSE'
  | 'PENALTY'
  | 'SPECIAL_CONTRIBUTION'
  | 'SERVICE_CHARGES'
  | 'OTHER';

export type InvoiceStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'ONLINE_GATEWAY'
  | 'CASH'
  | 'CHEQUE'
  | 'BANK_TRANSFER'
  | 'UPI';

export interface BillLineItem {
  id: string;
  component: BillComponent;
  description: string;
  amount: number;
}

export interface BillingCycle {
  id: string;
  societyId: string;
  cycleName: string; // e.g. "September 2026 Maintenance Bill"
  cycleMonth: string; // "2026-09"
  dueDate: string; // YYYY-MM-DD
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: string;
}

export interface SocietyInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-09-1204"
  societyId: string;
  flatId: string;
  flatCode: string;
  residentId: string;
  residentName: string;
  billingCycleId: string;
  cycleName: string;
  lineItems: BillLineItem[];
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  societyId: string;
  flatCode: string;
  residentName: string;
  transactionId: string; // e.g. "TXN-88192019"
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  gatewayReference?: string;
  gatewayResponseNotes?: string;
  paymentDate: string;
}

export interface BillingAnalytics {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  collectionPercentage: number;
}
