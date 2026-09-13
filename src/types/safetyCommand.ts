export type EmergencyType =
  | 'MEDICAL'
  | 'FIRE'
  | 'SECURITY_THREAT'
  | 'SUSPICIOUS_PERSON'
  | 'CHILD_SAFETY'
  | 'LIFT_EMERGENCY'
  | 'ELECTRICAL'
  | 'WATER_LEAKAGE'
  | 'OTHER';

export type IncidentStatus =
  | 'TRIGGERED'
  | 'ACKNOWLEDGED'
  | 'RESPONDING'
  | 'RESOLVED'
  | 'CLOSED';

export interface IncidentTimelineEvent {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  actorName: string;
  actorRole: string;
  timestamp: string;
  note?: string;
}

export interface EmergencyIncident {
  id: string;
  societyId: string;
  incidentNumber: string;
  type: EmergencyType;
  status: IncidentStatus;
  flatNumber: string;
  tower: string;
  locationDetails: string;
  reportedByUserId: string;
  reportedByName: string;
  reportedByPhone: string;
  assignedResponderId?: string;
  assignedResponderName?: string;
  description?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  respondingAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  timeline: IncidentTimelineEvent[];
  resolutionNotes?: string;
}

export interface SocietyEmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  isExternal: boolean;
}
