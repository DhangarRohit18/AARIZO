import type { GuardAlert } from '../../domains/guard/types';

export const INITIAL_GUARD_ALERTS: GuardAlert[] = [
  {
    id: 'alert-sos-01',
    title: 'EMERGENCY PANIC SOS BROADCAST',
    category: 'emergency_sos',
    severity: 'critical',
    residentName: 'Sarvesh Kulkarni',
    flatCode: 'Tower B · Flat 1204',
    description: 'Resident triggered emergency SOS panic alert from mobile app. Security gate team dispatch required.',
    timestamp: '10:21 AM',
    isAcknowledged: false,
  },
  {
    id: 'alert-app-02',
    title: 'Delivery Gate Approval Needed',
    category: 'visitor_approval',
    severity: 'warning',
    residentName: 'Sarvesh Kulkarni',
    flatCode: 'Tower B · Flat 1204',
    description: 'Zomato delivery agent waiting at Gate #1 for entry approval.',
    timestamp: '05:58 PM',
    isAcknowledged: false,
  },
  {
    id: 'alert-warn-03',
    title: 'Overnight Visitor Vehicle Overstay',
    category: 'pass_warning',
    severity: 'info',
    residentName: 'Rajesh Verma',
    flatCode: 'Block A · Flat 304',
    description: 'Guest vehicle MH 02 EF 9081 has exceeded expected 4-hour visit duration.',
    timestamp: 'Yesterday',
    isAcknowledged: true,
  },
];
