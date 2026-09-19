export type QREntityType = 
  | 'VISITOR' 
  | 'GATEPASS' 
  | 'PARCEL' 
  | 'ATTENDANCE' 
  | 'PATROL' 
  | 'EVENT' 
  | 'MOVE' 
  | 'AMENITY'
  | 'RENOVATION'
  | 'MATERIAL';

export type QRStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'USED';

export type QRUsagePolicy = 'ONE_TIME' | 'REUSABLE' | 'DAILY_LIMIT' | 'TIME_WINDOW';

export interface QRTokenPayload {
  t: string;      // Cryptographically secure token
  e: QREntityType; // Entity Type
  id: string;     // Entity ID
  s: string;      // Society ID
}

export interface QRTokenRecord {
  id: string; // Document ID (usually matches token 't')
  societyId: string;
  entityType: QREntityType;
  entityId: string;
  issuedAt: string | Date;
  expiresAt: string | Date;
  status: QRStatus;
  usagePolicy: QRUsagePolicy;
  issuedBy: string; // User ID who generated it
  usageCount: number;
}

export type QRValidationResultCode = 
  | 'VALID'
  | 'EXPIRED'
  | 'REVOKED'
  | 'ALREADY_USED'
  | 'UNAUTHORIZED'
  | 'WRONG_SOCIETY'
  | 'INVALID';

export interface QRValidationResult {
  code: QRValidationResultCode;
  message: string;
  entityId?: string;
  entityType?: QREntityType;
  actionRequired?: boolean; // If true, UI needs to prompt for extra auth (like Parcel recipient OTP)
}

export interface QRAuditEvent {
  id: string;
  societyId: string;
  tokenId: string;
  actorId: string; // The guard/staff who scanned it
  timestamp: string | Date;
  location?: string;
  entityType: QREntityType;
  entityId: string;
  action: string;
  resultCode: QRValidationResultCode;
}
