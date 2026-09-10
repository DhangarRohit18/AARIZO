import type { ResidentNotification } from '../../domains/notifications';

export const initialMockNotifications: ResidentNotification[] = [
  {
    id: 'notif-1',
    category: 'visitor',
    title: 'Food Delivery Agent at Gate',
    message: 'Security Officer R. Singh requested entry approval at Main Gate #1.',
    timestamp: '5 mins ago',
    isRead: false,
    actionRoute: 'visitors',
    actionLabel: 'Review Request',
  },
  {
    id: 'notif-2',
    category: 'maintenance',
    title: 'Helpdesk Ticket Updated',
    message: 'Ticket TK-4029 (AC Outlet) assigned to Technician Ramesh Kumar.',
    timestamp: '1 hour ago',
    isRead: false,
    actionRoute: 'support',
    actionLabel: 'View Ticket',
  },
  {
    id: 'notif-3',
    category: 'payment',
    title: 'September Maintenance Invoice Generated',
    message: 'Invoice #INV-2026-09 for ₹4,250 is due on 15 Sep 2026.',
    timestamp: 'Yesterday',
    isRead: true,
    actionRoute: 'payments',
    actionLabel: 'Pay Dues',
  },
  {
    id: 'notif-4',
    category: 'announcement',
    title: 'Water Tank Cleaning Notice',
    message: 'Water supply to Tower B will be paused tomorrow between 10 AM and 2 PM.',
    timestamp: '2 days ago',
    isRead: true,
  },
];
