import type { EmergencyContact, SafetyInstruction } from '../../domains/safety';

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'cont-1',
    name: 'Main Security Control Room',
    role: '24/7 Gate & Security Intercom',
    phone: '+91 98765 00001',
    availableHours: '24/7 Operational',
    iconType: 'security',
  },
  {
    id: 'cont-2',
    name: 'Estate Management Desk',
    role: 'Property Manager (Mr. V. Verma)',
    phone: '+91 98765 00002',
    availableHours: '09:00 AM – 07:00 PM',
    iconType: 'facility',
  },
  {
    id: 'cont-3',
    name: 'On-call Society Electrician',
    role: 'Technician Ramesh Kumar',
    phone: '+91 98765 00003',
    availableHours: '08:00 AM – 09:00 PM',
    iconType: 'facility',
  },
  {
    id: 'cont-4',
    name: 'Nearest Hospital Emergency',
    role: 'City General Hospital (2.5 km)',
    phone: '+91 98765 00999',
    availableHours: '24/7 Ambulance & Trauma',
    iconType: 'medical',
  },
];

export const mockSafetyInstructions: SafetyInstruction[] = [
  {
    id: 'safe-1',
    category: 'fire',
    title: 'Fire Emergency & Alarm Evacuation',
    detail: 'Use staircases only. Do NOT use elevators during fire alarms. Proceed directly to Assembly Point A (Central Lawn).',
  },
  {
    id: 'safe-2',
    category: 'lift',
    title: 'Elevator Intercom & Power Backup',
    detail: 'In case of power failure, automatic rescue device (ARD) brings lift to nearest floor within 60 seconds. Press yellow bell for Intercom.',
  },
  {
    id: 'safe-3',
    category: 'gate',
    title: 'Visitor & Delivery Pass Verification',
    detail: 'All walk-in visitors and service agents must present a 4-digit passcode or Resident Intercom clearance at Main Gate.',
  },
  {
    id: 'safe-4',
    category: 'assembly',
    title: 'Designated Assembly Point',
    detail: 'Primary Assembly Point A is located at the Central Clubhouse Lawn. Secondary Point B is at North Gate Parking.',
  },
];
