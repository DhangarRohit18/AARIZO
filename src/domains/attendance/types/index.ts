export type WorkerType = 'maid' | 'cook' | 'driver' | 'cleaner' | 'nanny' | 'other';

export interface LinkedHousehold {
  residentId: string;
  flatCode: string;
  consentGiven: boolean; // Must be true for guard to allow entry
}

export interface StaffProfile {
  id: string;
  societyId: string;
  type: WorkerType;
  name: string;
  phone: string;
  photoUrl?: string;
  linkedHouseholds: LinkedHousehold[];
  qrTokenId?: string; // Persistent, daily-limit QR token 't' value
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceLog {
  id: string;
  societyId: string;
  workerId: string;
  householdIds: string[]; // For filtering visibility dynamically via array-contains
  checkIn: string; // ISO string mapped from Timestamp
  checkOut?: string; // ISO string mapped from Timestamp (Null if currently active)
  checkpoint: string; // e.g., 'Main Gate'
  method: 'QR' | 'MANUAL' | 'AUTHORIZED_GUARD_ENTRY';
  createdBy: string; // Guard ID
}

export interface AttendanceSummary {
  id: string; // e.g. "worker123_2026_09"
  societyId: string;
  workerId: string;
  month: string; // e.g. "2026-09"
  totalDaysPresent: number;
  totalHoursWorked: number;
}
