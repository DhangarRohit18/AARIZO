// Domain state helpers & utilities for Resident Payments

import type { PaymentStatus, PaymentCategory, PaymentMethod } from './types';

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case 'DUE':
      return 'Due';
    case 'OVERDUE':
      return 'Overdue';
    case 'PAID':
      return 'Paid';
    case 'PROCESSING':
      return 'Processing';
    case 'FAILED':
      return 'Failed';
    default:
      return status;
  }
};

export const getPaymentStatusBadgeVariant = (
  status: PaymentStatus
): 'warning' | 'danger' | 'success' | 'info' => {
  switch (status) {
    case 'DUE':
      return 'warning';
    case 'OVERDUE':
      return 'danger';
    case 'PAID':
      return 'success';
    case 'PROCESSING':
      return 'info';
    case 'FAILED':
      return 'danger';
    default:
      return 'info';
  }
};

export const getPaymentCategoryLabel = (category: PaymentCategory): string => {
  switch (category) {
    case 'maintenance':
      return 'Society Maintenance';
    case 'electricity':
      return 'Electricity Utility';
    case 'water':
      return 'Water Charges';
    case 'parking':
      return 'Parking Fee';
    case 'amenity':
      return 'Amenity Booking';
    case 'other':
      return 'Other Dues';
    default:
      return category;
  }
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case 'upi':
      return 'Instant UPI';
    case 'card':
      return 'Credit / Debit Card';
    case 'net_banking':
      return 'Net Banking';
    default:
      return method;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const isPaymentOverdue = (dueDateStr: string): boolean => {
  const due = new Date(dueDateStr);
  const now = new Date();
  return due < now;
};
