// Typed Visitor Domain Model for CommunityOS (Phase 2B)

export type VisitorType = 'guest' | 'cab' | 'delivery' | 'service';

export type VisitorPassStatus =
  | 'draft'
  | 'active'
  | 'arrived'
  | 'approval_required'
  | 'approved'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'expired'
  | 'rejected';

export interface Visitor {
  id: string;
  name: string;
  phone?: string;
  avatarInitials?: string;
  vehicleNumber?: string;
  companyName?: string;
  isFrequent?: boolean;
  categoryLabel?: string; // e.g. Maid, Driver, Plumber
}

export interface VisitorPass {
  id: string;
  passcode: string;
  visitorType: VisitorType;
  visitorName: string;
  visitorPhone?: string;
  vehicleNumber?: string;
  companyName?: string;
  serviceCategory?: string;
  flatCode: string;
  tower: string;
  societyName: string;
  expectedDate: string;
  expectedTimeSlot: string;
  status: VisitorPassStatus;
  createdAt: string;
  arrivedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  validUntil: string;
  gateName: string;
  notes?: string;
}

export interface VisitLog {
  id: string;
  visitorPassId: string;
  visitorName: string;
  visitorType: VisitorType;
  date: string;
  entryTime: string;
  exitTime?: string;
  status: VisitorPassStatus;
  flatCode: string;
  gateOfficer: string;
}
