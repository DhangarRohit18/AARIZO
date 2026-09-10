// Guard Domain Contracts for CommunityOS Phase 3B

export type VisitorVerificationStatus =
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'cancelled'
  | 'approval_required';

export type GateDecision = 'approved' | 'rejected' | 'pending';

export type GateEntryStatus =
  | 'expected'
  | 'at_gate'
  | 'verifying'
  | 'approval_required'
  | 'approved'
  | 'checked_in'
  | 'checked_out'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export type GuardAlertSeverity = 'info' | 'warning' | 'critical';

export interface GuardProfile {
  id: string;
  name: string;
  phone: string;
  role: 'guard';
  title: string;
  gateId: string;
  gateName: string;
  shift: string;
  avatarUrl: string;
  status: 'on_duty' | 'off_duty';
}

export interface Gate {
  id: string;
  name: string;
  location: string;
  status: 'open' | 'closed' | 'restricted';
  gateOfficer: string;
}

export interface GuardVisitor {
  id: string;
  passcode: string;
  name: string;
  phone?: string;
  visitorType: 'guest' | 'cab' | 'delivery' | 'service';
  visitorTypeLabel: string;
  residentName: string;
  flatCode: string;
  tower: string;
  societyName: string;
  vehicleNumber?: string;
  companyName?: string;
  serviceCategory?: string;
  expectedDate: string;
  expectedTimeSlot: string;
  status: GateEntryStatus;
  verificationStatus?: VisitorVerificationStatus;
  createdAt: string;
  arrivedAt?: string;
  approvedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  gateName: string;
  gateOfficer: string;
  notes?: string;
  rejectionReason?: string;
}

export interface GatePassVerification {
  passcode: string;
  verificationStatus: VisitorVerificationStatus;
  visitor?: GuardVisitor;
  message: string;
}

export interface GateHistoryRecord {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorType: 'guest' | 'cab' | 'delivery' | 'service';
  residentName: string;
  flatCode: string;
  action: 'entry_approved' | 'checked_in' | 'checked_out' | 'entry_rejected';
  actionLabel: string;
  timestamp: string;
  gateName: string;
  gateOfficer: string;
  notes?: string;
  rejectionReason?: string;
}

export interface GuardAlert {
  id: string;
  title: string;
  category: 'visitor_approval' | 'emergency_sos' | 'security_notice' | 'pass_warning';
  severity: GuardAlertSeverity;
  residentName?: string;
  flatCode?: string;
  description: string;
  timestamp: string;
  isAcknowledged: boolean;
}

export interface GuardDashboardStats {
  expectedToday: number;
  atGate: number;
  inside: number;
  pendingApproval: number;
}
