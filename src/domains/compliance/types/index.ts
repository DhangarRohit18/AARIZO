export type AMCStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWED';
export type AMCType = 'AMC' | 'INSURANCE' | 'STAFF_VERIFICATION' | 'VENDOR_AGREEMENT' | 'CERTIFICATE';

export interface AMCContract {
  id: string;
  societyId: string;
  assetId?: string;
  vendorId?: string;
  type: AMCType;
  title: string;
  contractStart: string;
  contractEnd: string;
  nextRenewalDate?: string;
  status: AMCStatus;
  documentUrl: string;
  responsiblePerson: string;
  isPublicToResidents: boolean;
  renewalHistory: string[];
  remindersSent: {
    thirtyDay: boolean;
    fifteenDay: boolean;
    sevenDay: boolean;
    expired: boolean;
  };
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

export type AssetCategory =
  | 'LIFT'
  | 'GENERATOR'
  | 'PUMP'
  | 'CCTV'
  | 'FIRE_SYSTEM'
  | 'POOL'
  | 'GYM'
  | 'SWIMMING_POOL'
  | 'GYM_EQUIPMENT'
  | 'ELECTRICAL_EQUIPMENT'
  | 'WATER_SYSTEMS'
  | 'OTHER';

export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'EXPIRING_SOON' | 'EXPIRED' | 'NON_COMPLIANT';

export interface SocietyAsset {
  id: string;
  societyId: string;
  category: AssetCategory;
  name: string;
  location: string;
  installationDate: string;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

export type ComplianceStatus = 'ACTIVE' | 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' | 'PENDING' | 'NON_COMPLIANT';

export type AlertWindow = 'NONE' | '30_DAYS' | '15_DAYS' | '7_DAYS' | 'EXPIRED' | 'HEALTHY';

export interface InspectionRecord {
  id: string;
  assetId: string;
  inspectionDate?: string;
  date?: string;
  inspectorName?: string;
  inspectorRole?: string;
  inspector?: string;
  result?: 'PASSED' | 'FAILED' | 'NEEDS_ATTENTION';
  status?: 'PASS' | 'FAIL' | 'PENDING';
  notes?: string;
  proofUrl?: string;
  createdAt?: string;
}

export interface RenewalRecord {
  id: string;
  assetId?: string;
  contractId?: string;
  renewalType?: 'AMC' | 'INSURANCE' | 'CERTIFICATE';
  renewalDate?: string;
  newExpiryDate?: string;
  previousExpiryDate?: string;
  vendorName?: string;
  cost?: number;
  renewedBy: string;
  renewedRole?: string;
  documentUrl?: string;
  notes?: string;
  renewedAt?: string;
  previousContractEnd?: string;
  newContractEnd?: string;
}

export interface ComplianceAuditLog {
  id: string;
  assetId: string;
  societyId?: string;
  action: string;
  performedBy: string;
  performedRole: string;
  timestamp: string;
  details: string | Record<string, any>;
}

export interface ComplianceMetrics {
  totalAssets: number;
  activeCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  nonCompliantCount: number;
  complianceScorePercent: number;
  expiringNext30Days?: number | AssetItem[];
  expiredAssets?: AssetItem[];
  compliant?: number;
  expiringSoon?: number;
  expired?: number;
  pending?: number;
}

export interface AssetItem {
  id: string;
  societyId?: string;
  assetCode: string;
  category: AssetCategory;
  name: string;
  location: string;
  vendorId?: string;
  vendorName?: string;
  vendorContact?: string;
  vendor?: string;
  amcStartDate?: string;
  amcExpiryDate?: string;
  insuranceExpiryDate?: string;
  certificateExpiryDate?: string;
  contractStart?: string;
  contractEnd?: string;
  inspectionScheduleFrequencyDays?: number;
  lastInspectionDate?: string;
  nextInspectionDueDate?: string;
  nextInspectionDate?: string;
  status: ComplianceStatus | AssetStatus;
  complianceStatus?: ComplianceStatus;
  alertLevel?: AlertWindow;
  alertWindow?: AlertWindow | Record<string, boolean>;
  documentUrls?: string[];
  documents?: string[];
  inspections: InspectionRecord[];
  renewals: RenewalRecord[];
  auditLogs: ComplianceAuditLog[];
  auditLog?: ComplianceAuditLog[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
