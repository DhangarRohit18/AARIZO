export type WorkerType =
  | 'MAID'
  | 'COOK'
  | 'DRIVER'
  | 'NANNY'
  | 'CLEANER'
  | 'GARDENER'
  | 'OTHER';

export type WorkerStatus =
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'ABSENT'
  | 'SUSPENDED';

export type WorkerVerificationStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'REJECTED';

export interface DomesticWorker {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  workerType: WorkerType;
  passCode: string;
  qrCode: string;
  verificationStatus: WorkerVerificationStatus;
  overallStatus: WorkerStatus;
  avatarUrl?: string;
  policeVerificationDocMasked?: boolean;
}

export interface HouseholdAssignment {
  id: string;
  workerId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  consentGiven: boolean;
  accessRevoked: boolean;
  linkedAt: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerType: WorkerType;
  societyId: string;
  residentId?: string;
  flatCode?: string;
  gateName: string;
  entryTime: string;
  exitTime?: string;
  status: WorkerStatus;
  checkedInByGuard: string;
}

export interface WorkerAccessAudit {
  id: string;
  timestamp: string;
  workerId: string;
  residentId?: string;
  action: string;
  performedBy: string;
}
