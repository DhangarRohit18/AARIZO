import type { PaymentRecord } from '../../domains/payments';

export const mockDues: PaymentRecord[] = [
  {
    id: 'PAY-101',
    category: 'maintenance',
    title: 'September 2026 Maintenance Dues',
    amount: 4250,
    dueDate: '2026-09-15',
    status: 'DUE',
    period: 'Sep 2026',
    description:
      'Monthly society maintenance fee covering 24/7 gate security, common area housekeeping, lift AMC, water pump operations, and garden landscaping.',
    accountReference: 'LVR-1204-MNT-SEP26',
  },
  {
    id: 'PAY-102',
    category: 'parking',
    title: 'Q3 Parking & EV Socket Charge',
    amount: 1200,
    dueDate: '2026-09-01',
    status: 'OVERDUE',
    period: 'Q3 2026 (Jul - Sep)',
    description:
      'Quarterly basement parking slot B-12 maintenance fee and dedicated EV socket access.',
    accountReference: 'LVR-1204-PRK-Q3',
    penaltyAmount: 100,
  },
];
