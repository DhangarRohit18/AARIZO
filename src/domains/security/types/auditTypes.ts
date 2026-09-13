export type AuditActionType =
  | 'LOGIN'
  | 'APPROVAL'
  | 'REJECTION'
  | 'QR_SCAN'
  | 'ENTRY'
  | 'EXIT'
  | 'ATTENDANCE'
  | 'PAYMENT'
  | 'SLA_ESCALATION'
  | 'AMC_RENEWAL'
  | 'NOC_ACTION'
  | 'EMERGENCY_ACTION'
  | 'VENDOR_CHANGE'
  | 'SECURITY_ACCESS';

export interface StructuralAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  role: string;
  societyId: string;
  entity: string; // e.g. "DomesticWorker", "Visitor", "VendorInvoice", "EmergencyIncident"
  entityId: string;
  action: AuditActionType;
  timestamp: string;
  beforeState: Record<string, any> | null;
  afterState: Record<string, any> | null;
  metadata: Record<string, any>;
}

export interface PrivacyAccessRule {
  domain: 'domestic_attendance' | 'medical_blood_registry' | 'child_safety' | 'trust_score';
  accessPolicy: string;
  allowedViewerRoles: string[];
  isAuthorized: boolean;
  reason?: string;
}

export interface TrustScoreViewerRecord {
  residentId: string;
  trustScore: number;
  positiveEndorsementsCount: number; // Positive-only
  positiveBadges: string[];
  visibleTo: string[]; // Relevant viewers only
}
