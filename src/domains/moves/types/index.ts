export type MoveType = 'MOVE_IN' | 'MOVE_OUT';
export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type MoveStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MoveVendor {
  companyName: string;
  contactPerson: string;
  phone: string;
}

export interface MoveApproval {
  status: ApprovalStatus;
  approvedBy?: string; // UID of Secretary
  reason?: string;
  updatedAt: string; // ISO String
}

export interface MoveRequest {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  type: MoveType;
  date: string; // ISO String (Date part is most important)
  timeSlot: TimeSlot;
  liftSlotId: string; // The specific lift allocated
  vendor: MoveVendor;
  vehicleNumber: string;
  workersCount: number;
  status: MoveStatus;
  approval: MoveApproval;
  gatepassId?: string; // Maps to QR Tokens
  startedAt?: string; // ISO String
  completedAt?: string; // ISO String
  createdAt: string; // ISO String
}
