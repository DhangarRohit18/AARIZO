export type SocietyRequestCategory =
  | 'NOC'
  | 'TENANT_REGISTRATION'
  | 'OWNERSHIP_CHANGE'
  | 'RENOVATION_PERMISSION'
  | 'EVENT_PERMISSION'
  | 'VENDOR_ACCESS'
  | 'PARKING_REQUEST'
  | 'SOCIETY_CERTIFICATE'
  | 'OTHER_APPROVAL';

export type SocietyRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED';

export interface RequestDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  docType?: string;
}

export interface RequestAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  fromStatus?: SocietyRequestStatus;
  toStatus?: SocietyRequestStatus;
  notes?: string;
}

export interface SocietyRequest {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  title: string;
  category: SocietyRequestCategory;
  description: string;
  status: SocietyRequestStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedOfficerName?: string;
  requiresCommitteeApproval: boolean;
  committeeApproved?: boolean;
  slaHours: number;
  targetCompletionDate: string;
  isSlaBreached: boolean;
  documents: RequestDocument[];
  history: RequestAuditLog[];
  createdAt: string;
  updatedAt: string;
}
