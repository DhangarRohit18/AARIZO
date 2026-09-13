export type WorkerType =
  | 'MAID'
  | 'COOK'
  | 'NANNY'
  | 'DRIVER'
  | 'CLEANER'
  | 'GARDENER'
  | 'ELECTRICIAN'
  | 'PLUMBER'
  | 'TECHNICIAN'
  | 'SECURITY'
  | 'OTHER';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AccessStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'BLACK_LISTED';
export type AttendanceStatus = 'IN' | 'OUT' | 'LATE' | 'ABSENT' | 'SUSPENDED';

export interface StaffDocument {
  id: string;
  name: string;
  documentType: 'ID_PROOF' | 'POLICE_VERIFICATION' | 'ADDRESS_PROOF';
  url: string;
  isVerified: boolean;
}

export interface StaffIncidentReport {
  id: string;
  societyId: string;
  workerId: string;
  workerName: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

export interface DomesticWorkerProfile {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  photoUrl?: string;
  workerType: WorkerType;
  emergencyContactName: string;
  emergencyContactPhone: string;
  passCode: string; // 4-digit code e.g. "PASS-8821"
  qrDataString: string;
  assignedFlatIds: string[];
  assignedFlatCodes: string[];
  verificationStatus: VerificationStatus;
  accessStatus: AccessStatus;
  attendanceStatus: AttendanceStatus;
  documents: StaffDocument[];
  lastEntryTime?: string;
  lastExitTime?: string;
  createdAt: string;
}

export interface StaffAttendanceLog {
  id: string;
  societyId: string;
  workerId: string;
  workerName: string;
  workerType: WorkerType;
  action: 'IN' | 'OUT';
  timestamp: string;
  scannedBy: string;
}
