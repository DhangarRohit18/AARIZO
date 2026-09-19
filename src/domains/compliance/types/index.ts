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

export type AssetCategory = 'LIFT' | 'GENERATOR' | 'PUMP' | 'CCTV' | 'FIRE_SYSTEM' | 'POOL' | 'GYM' | 'OTHER';
export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_ORDER';

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

// Legacy types used by assetComplianceService (localStorage-based)
export type ComplianceStatus = 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' | 'PENDING' | 'NON_COMPLIANT';

export interface AlertWindow {
  thirtyDay: boolean;
  fifteenDay: boolean;
  sevenDay: boolean;
  expired: boolean;
}

export interface InspectionRecord {
  id: string;
  assetId: string;
  date: string;
  inspector: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  notes?: string;
}

export interface RenewalRecord {
  id: string;
  contractId: string;
  renewedAt: string;
  renewedBy: string;
  previousContractEnd: string;
  newContractEnd: string;
}

export interface ComplianceAuditLog {
  id: string;
  assetId: string;
  societyId: string;
  action: string;
  performedBy: string;
  performedRole: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface ComplianceMetrics {
  totalAssets: number;
  compliant: number;
  expiringSoon: number;
  expired: number;
  pending: number;
}

export interface AssetItem {
  id: string;
  societyId?: string;
  assetCode: string;
  category: AssetCategory;
  name: string;
  location: string;
  vendor?: string;
  contractStart?: string;
  contractEnd?: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  status: AssetStatus;
  complianceStatus: ComplianceStatus;
  alertWindow: AlertWindow;
  inspections: InspectionRecord[];
  renewals: RenewalRecord[];
  auditLog: ComplianceAuditLog[];
  documents: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
