export type VisitorCategory =
  | 'GUEST'
  | 'DELIVERY'
  | 'CAB'
  | 'DOMESTIC_WORKER'
  | 'SERVICE_PROVIDER'
  | 'EVENT_GROUP';

export type PassLifecycleType = 'ONE_TIME' | 'REUSABLE' | 'SCHEDULED';

export type PassStatus =
  | 'EXPECTED'
  | 'AT_GATE'
  | 'APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'OVERSTAYED';

export type VisitorLifecycleState =
  | 'EXPECTED'
  | 'ARRIVED'
  | 'INSIDE'
  | 'EXITED'
  | 'OVERSTAYED'
  | 'NO_SHOW'
  | 'CANCELLED';

export interface SmartVisitorPass {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  towerName: string;
  visitorName: string;
  visitorPhone: string;
  category: VisitorCategory;
  passLifecycle: PassLifecycleType;
  passCode: string; // e.g. "GVS-8402"
  qrDataString: string;
  validFrom: string;
  validUntil: string;
  usageCount: number;
  maxUsages: number;
  vehicleNumber?: string;
  companyName?: string;
  purpose?: string;
  groupCount?: number;
  status: PassStatus;
  lifecycleState?: VisitorLifecycleState;
  
  // Delivery & Overstay Intelligence
  deliveryVendor?: string; // e.g. "Amazon", "Swiggy", "Zomato", "Blinkit", "Courier"
  packageReferenceNumber?: string;
  pickupTimestamp?: string;
  maxAllowedDurationMinutes?: number;
  isOverdue?: boolean;

  gateName?: string;
  gateOfficerName?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface BlacklistEntry {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  reason: string;
  blacklistedBy: string;
  addedAt: string;
}

export interface SecurityLockdownState {
  societyId: string;
  isLockdownActive: boolean;
  activatedBy: string;
  activatedAt?: string;
  reason?: string;
}

export interface PassValidationResult {
  isValid: boolean;
  reason?: string;
  pass?: SmartVisitorPass;
  blacklistMatch?: BlacklistEntry;
  isLockdownActive?: boolean;
}

export interface VisitorAnalyticsData {
  peakVisitingHours: { hourLabel: string; count: number }[];
  repeatVisitors: { visitorName: string; phone: string; visitsCount: number; lastVisit: string }[];
  averageStayDurationMinutes: number;
  deliveryVolumeByVendor: { vendorName: string; count: number }[];
  dailyVisitorTrend: { dayLabel: string; count: number }[];
}
