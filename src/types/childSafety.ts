export type ChildStatus = 'SAFE' | 'OUT_OF_SOCIETY' | 'MISSING';
export type PickupPersonStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type QRPassStatus = 'ACTIVE' | 'EXPIRED' | 'USED' | 'REVOKED';
export type PickupLogStatus = 'ALLOWED' | 'DENIED' | 'MISSING_ALERT_FLAGGED';
export type SafetyAlertType = 'EMERGENCY' | 'MISSING_CHILD' | 'UNAUTHORIZED_PICKUP_ATTEMPT';

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface AuthorizedPickupPerson {
  id: string;
  childId: string;
  name: string;
  phone: string;
  relationship: string;
  idProofType: string;
  idProofNumber: string;
  photoUrl?: string;
  status: PickupPersonStatus;
  validUntil?: string;
  createdAt: string;
}

export interface ChildProfile {
  id: string;
  societyId: string;
  flatNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl?: string;
  medicalNotes?: string;
  status: ChildStatus;
  guardians: Guardian[];
  emergencyContacts: EmergencyContact[];
  authorizedPickups: AuthorizedPickupPerson[];
  createdAt: string;
  updatedAt: string;
}

export interface ChildPickupQR {
  id: string;
  qrCode: string;
  societyId: string;
  childId: string;
  childName: string;
  flatNumber: string;
  pickupPersonId: string;
  pickupPersonName: string;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  status: QRPassStatus;
  createdAt: string;
}

export interface PickupLog {
  id: string;
  societyId: string;
  childId: string;
  childName: string;
  flatNumber: string;
  pickupPersonName: string;
  pickupPersonPhone: string;
  timestamp: string;
  gateId: string;
  securityGuardId: string;
  status: PickupLogStatus;
  notes?: string;
}

export interface ChildSafetyAlert {
  id: string;
  societyId: string;
  childId: string;
  childName: string;
  flatNumber: string;
  alertType: SafetyAlertType;
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
