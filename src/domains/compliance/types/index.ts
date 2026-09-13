export type AssetCategory =
  | 'LIFT'
  | 'GENERATOR'
  | 'PUMP'
  | 'CCTV'
  | 'FIRE_SYSTEM'
  | 'SWIMMING_POOL'
  | 'GYM_EQUIPMENT'
  | 'ELECTRICAL_EQUIPMENT'
  | 'WATER_SYSTEMS'
  | 'OTHER';

export type ComplianceStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NON_COMPLIANT';

export type AlertWindow = '30_DAYS' | '15_DAYS' | '7_DAYS' | 'EXPIRED' | 'HEALTHY';

export type InspectionResult = 'PASSED' | 'NEEDS_ATTENTION' | 'FAILED';

export interface InspectionRecord {
  id: string;
  assetId: string;
  inspectionDate: string;
  inspectorName: string;
  inspectorRole: 'FACILITY_MANAGER' | 'SOCIETY_ADMIN' | 'VENDOR' | 'AUDITOR';
  result: InspectionResult;
  notes: string;
  proofUrl?: string;
  createdAt: string;
}

export interface RenewalRecord {
  id: string;
  assetId: string;
  renewalType: 'AMC' | 'INSURANCE' | 'CERTIFICATE';
  previousExpiryDate: string;
  newExpiryDate: string;
  vendorName: string;
  cost?: number;
  documentUrl?: string;
  renewedBy: string;
  renewedAt: string;
  notes?: string;
}

export interface ComplianceAuditLog {
  id: string;
  assetId: string;
  action: 'ASSET_CREATED' | 'ASSET_UPDATED' | 'VENDOR_ASSIGNED' | 'AMC_RENEWED' | 'INSPECTION_RECORDED' | 'DOCUMENT_UPLOADED';
  performedBy: string;
  performedRole: string;
  timestamp: string;
  details: string;
}

export interface AssetItem {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  location: string;
  vendorId?: string;
  vendorName?: string;
  vendorContact?: string;
  
  amcStartDate: string;
  amcExpiryDate: string;
  insuranceExpiryDate: string;
  certificateExpiryDate: string;
  
  inspectionScheduleFrequencyDays: number;
  lastInspectionDate?: string;
  nextInspectionDueDate: string;
  
  status: ComplianceStatus;
  alertLevel: AlertWindow;
  
  documentUrls: string[];
  inspections: InspectionRecord[];
  renewals: RenewalRecord[];
  auditLogs: ComplianceAuditLog[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceMetrics {
  totalAssets: number;
  activeCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  nonCompliantCount: number;
  complianceScorePercent: number;
  expiringNext30Days: AssetItem[];
  expiredAssets: AssetItem[];
}
