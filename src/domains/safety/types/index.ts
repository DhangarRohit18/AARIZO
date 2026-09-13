export type EmergencyCategory =
  | 'MEDICAL'
  | 'FIRE'
  | 'SECURITY'
  | 'CHILD_SAFETY'
  | 'LIFT'
  | 'ELECTRICAL'
  | 'WATER';

export type IncidentStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | 'CLOSED';

export interface TimelineLog {
  id: string;
  status: IncidentStatus;
  timestamp: string;
  performedBy: string;
  note: string;
}

export interface EmergencyIncidentItem {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  phone: string;
  
  category: EmergencyCategory;
  title: string;
  description: string;
  location: string;
  status: IncidentStatus;
  
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  responderName?: string;
  responderRole?: string;
  resolvedAt?: string;
  
  timeline: TimelineLog[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthorizedPickupPerson {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  idProofType: string;
  idProofNumber: string;
  photoUrl?: string;
  isApproved: boolean;
}

export interface ChildProfileItem {
  id: string;
  societyId: string;
  childName: string;
  flatCode: string;
  guardianName: string;
  guardianPhone: string;
  authorizedPickups: AuthorizedPickupPerson[];
  qrPassCode?: string;
  createdAt: string;
}

export interface PickupRecord {
  id: string;
  childId: string;
  childName: string;
  flatCode: string;
  pickupPersonName: string;
  pickupPersonPhone: string;
  verifiedByGuard: string;
  timestamp: string;
  status: 'GATE_CLEARED' | 'DENIED';
}
