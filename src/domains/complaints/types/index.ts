export type ComplaintCategory =
  | 'SECURITY'
  | 'LIFT'
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HOUSEKEEPING'
  | 'PARKING'
  | 'OTHER';

export type ComplaintStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'RESOLVED'
  | 'VERIFICATION_REQUIRED'
  | 'CLOSED'
  | 'ESCALATED';

export type EscalationLevel =
  | 'STAFF'
  | 'FACILITY_MANAGER'
  | 'SOCIETY_ADMIN'
  | 'COMMITTEE';

export interface SLAPolicy {
  id: string;
  societyId: string;
  category: ComplaintCategory;
  slaMinutes: number;
  updatedBy: string;
}

export interface ResolutionAttempt {
  attemptIndex: number;
  resolvedBy: string;
  resolutionNotes: string;
  timestamp: string;
  isVerifiedByResident?: boolean;
  residentFeedbackNotes?: string;
}

export interface Complaint {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  location: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  photoUrl?: string;
  videoUrl?: string;
  status: ComplaintStatus;
  escalationLevel: EscalationLevel;
  assignedToName?: string;
  assignedToRole?: string;
  slaMinutes: number;
  createdAt: string;
  dueAt: string;
  resolvedAt?: string;
  closedAt?: string;
  isWarningState: boolean;
  isBreached: boolean;
  reopenCount: number;
  resolutionHistory: ResolutionAttempt[];
}

export interface SLAAnalytics {
  totalComplaints: number;
  resolvedCount: number;
  breachedCount: number;
  slaComplianceRate: number;
  avgResolutionTimeHours: number;
  categoryBreakdown: { category: string; count: number; complianceRate: number }[];
}
