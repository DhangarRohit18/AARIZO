import type { GuardProfile } from '../../domains/guard/types';

export const MOCK_GUARD_PROFILE: GuardProfile = {
  id: 'guard-officer-01',
  name: 'Officer R. Singh',
  phone: '+91 91234 56789',
  role: 'guard',
  title: 'Senior Security Officer',
  gateId: 'gate-01',
  gateName: 'Gate #1 Main Entrance',
  shift: 'Morning Shift (06:00 AM – 02:00 PM)',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  status: 'on_duty',
};
