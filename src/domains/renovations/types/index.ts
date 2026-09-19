export type RenovationStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';

export interface RenovationContractor {
  companyName: string;
  contactPerson: string;
  phone: string;
}

export interface RenovationRules {
  allowedHoursStart: string; // e.g., "09:00"
  allowedHoursEnd: string; // e.g., "17:00"
  allowWeekends: boolean;
}

export interface RenovationRequest {
  id: string;
  societyId: string;
  residentId: string;
  flatCode: string;
  workDescription: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  contractor: RenovationContractor;
  workersExpected: number;
  vehicles: string[];
  materials: string[];
  documentsUrl?: string[]; // Firebase Storage Links
  status: RenovationStatus;
  gatepassId?: string; // The Master QR Token for the contractor
  rules: RenovationRules;
  createdAt: string;
  updatedAt: string;
}

export type MaterialGatepassType = 'INBOUND' | 'OUTBOUND';
export type MaterialGatepassStatus = 'PENDING' | 'VERIFIED';

export interface MaterialGatepass {
  id: string;
  societyId: string;
  renovationId: string;
  type: MaterialGatepassType;
  itemsDescription: string;
  vehicleNumber: string;
  status: MaterialGatepassStatus;
  verifiedAt?: string;
  verifiedByGuardId?: string;
  gatepassQrId: string; // Specific QR for this material run
  createdAt: string;
}
