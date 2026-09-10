import type { Gate } from '../../domains/guard/types';

export const MOCK_GATES: Gate[] = [
  {
    id: 'gate-01',
    name: 'Gate #1 Main Entrance',
    location: 'North Perimeter Road',
    status: 'open',
    gateOfficer: 'Officer R. Singh',
  },
  {
    id: 'gate-02',
    name: 'Gate #2 Service Entrance',
    location: 'South Utility Way',
    status: 'open',
    gateOfficer: 'Officer M. Patil',
  },
];
