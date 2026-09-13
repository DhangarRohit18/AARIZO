export type CommonAreaCategory =
  | 'GARBAGE'
  | 'SWIMMING_POOL'
  | 'STAIRCASE'
  | 'LOBBY'
  | 'GARDEN'
  | 'GYM'
  | 'CLUBHOUSE'
  | 'PARKING'
  | 'CORRIDORS';

export type TaskStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'MISSED'
  | 'LATE'
  | 'VERIFIED';

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface HousekeepingTask {
  id: string;
  societyId: string;
  title: string;
  category: CommonAreaCategory;
  areaLocation: string;
  tower?: string;
  floor?: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  assignedStaffId: string;
  assignedStaffName: string;
  status: TaskStatus;
  checklist: ChecklistItem[];
  photoProofUrl?: string;
  completionTimestamp?: string;
  staffNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  missedReason?: string;
  createdAt: string;
}

export interface GarbagePickupLog {
  id: string;
  societyId: string;
  tower: string;
  floor: string;
  flatNumber: string;
  scheduledTime: string;
  status: 'COLLECTED' | 'MISSED' | 'PENDING';
  confirmedByResident: boolean;
  collectedAt?: string;
  staffNotes?: string;
}
