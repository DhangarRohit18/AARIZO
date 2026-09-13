export type AuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'QR_SCAN'
  | 'VISITOR_ENTRY'
  | 'VISITOR_EXIT'
  | 'PAYMENT'
  | 'MAINTENANCE_REASSIGNMENT'
  | 'WORKER_VERIFICATION'
  | 'EMERGENCY_ACTION';

export interface AuditLogEntry {
  id: string;
  actor: string;
  role: string;
  society: string;
  action: AuditEventType | string;
  entity: string;
  entityId: string;
  timestamp: string;
  metadata: Record<string, any>;
  ipAddress: string;
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
  societyId: string;
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
  lastActiveAt: string;
  isExpired: boolean;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export interface PayloadValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPayload?: any;
}
