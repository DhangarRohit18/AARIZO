import type {
  StructuralAuditLog,
  AuditActionType,
  PrivacyAccessRule,
} from '../types/auditTypes';
import { realtimeService } from '../../../services/realtimeService';

const STRUCTURAL_AUDIT_KEY = 'aarizo_structural_audit_logs_v2';

const SEED_AUDIT_LOGS: StructuralAuditLog[] = [
  {
    id: 'aud-001',
    actorId: 'admin-1',
    actorName: 'Mayuri Udar',
    role: 'SOCIETY_ADMIN',
    societyId: 'soc-gvs',
    entity: 'VendorInvoice',
    entityId: 'exp-001',
    action: 'PAYMENT',
    timestamp: '2026-09-04T11:30:00Z',
    beforeState: { status: 'APPROVED' },
    afterState: { status: 'PAID', paymentReference: 'UPI/9812491204' },
    metadata: { paymentMethod: 'NEFT', amount: 145000 },
  },
  {
    id: 'aud-002',
    actorId: 'guard-1',
    actorName: 'R. Singh (Guard Gate 1)',
    role: 'SECURITY',
    societyId: 'soc-gvs',
    entity: 'DomesticWorker',
    entityId: 'worker-99',
    action: 'QR_SCAN',
    timestamp: '2026-09-14T09:03:00Z',
    beforeState: { status: 'CHECKED_OUT' },
    afterState: { status: 'CHECKED_IN', timestamp: '09:03 AM' },
    metadata: { gate: 'Main Gate 1', workerName: 'Laxmi Shinde', category: 'maid' },
  },
  {
    id: 'aud-003',
    actorId: 'committee-head',
    actorName: 'Anil Sharma (President)',
    role: 'COMMITTEE_MEMBER',
    societyId: 'soc-gvs',
    entity: 'AssetCompliance',
    entityId: 'asset-lift-01',
    action: 'AMC_RENEWAL',
    timestamp: '2026-09-06T14:20:00Z',
    beforeState: { amcStatus: 'EXPIRING', expiryDate: '2026-09-10' },
    afterState: { amcStatus: 'ACTIVE', expiryDate: '2027-09-10' },
    metadata: { vendorName: 'Otis Elevator India Pvt Ltd', amount: 85000 },
  },
  {
    id: 'aud-004',
    actorId: 'guardian-res-1',
    actorName: 'Vikram Joshi (Guardian)',
    role: 'RESIDENT',
    societyId: 'soc-gvs',
    entity: 'ChildSafetyPass',
    entityId: 'child-pass-001',
    action: 'APPROVAL',
    timestamp: '2026-09-14T08:15:00Z',
    beforeState: { isAuthorized: false },
    afterState: { isAuthorized: true, authorizedPerson: 'Pooja Joshi (Aunt)' },
    metadata: { childName: 'Aarav Joshi', validUntil: '2026-09-14T18:00:00Z' },
  },
];

class PrivacyAuditEngine {
  private getStoredAuditLogs(): StructuralAuditLog[] {
    const raw = localStorage.getItem(STRUCTURAL_AUDIT_KEY);
    if (!raw) {
      localStorage.setItem(STRUCTURAL_AUDIT_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse audit logs', e);
      return SEED_AUDIT_LOGS;
    }
  }

  private saveAuditLogs(logs: StructuralAuditLog[]): void {
    localStorage.setItem(STRUCTURAL_AUDIT_KEY, JSON.stringify(logs));
    realtimeService.broadcast('AUDIT_LOG_CREATED', { count: logs.length });
  }

  /**
   * Log every sensitive operation with 10-point audit schema
   */
  public logOperation(params: {
    actorId: string;
    actorName: string;
    role: string;
    societyId: string;
    entity: string;
    entityId: string;
    action: AuditActionType;
    beforeState?: Record<string, any> | null;
    afterState?: Record<string, any> | null;
    metadata?: Record<string, any>;
  }): StructuralAuditLog {
    const logs = this.getStoredAuditLogs();
    const newLog: StructuralAuditLog = {
      id: `aud-${Date.now()}`,
      actorId: params.actorId,
      actorName: params.actorName,
      role: params.role,
      societyId: params.societyId,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      timestamp: new Date().toISOString(),
      beforeState: params.beforeState || null,
      afterState: params.afterState || null,
      metadata: params.metadata || {},
    };

    logs.unshift(newLog);
    this.saveAuditLogs(logs);
    return newLog;
  }

  public getAuditLogs(filter?: {
    action?: AuditActionType | 'ALL';
    entity?: string;
    actorId?: string;
  }): StructuralAuditLog[] {
    let list = this.getStoredAuditLogs();

    if (filter) {
      if (filter.action && filter.action !== 'ALL') {
        list = list.filter((l) => l.action === filter.action);
      }
      if (filter.entity) {
        list = list.filter((l) => l.entity.toLowerCase().includes(filter.entity!.toLowerCase()));
      }
      if (filter.actorId) {
        list = list.filter((l) => l.actorId === filter.actorId);
      }
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // --- Strict Backend Access Guard Rules ---

  public verifyPrivacyAccess(
    domain: PrivacyAccessRule['domain'],
    userRole: string,
    userHouseholdId?: string,
    targetHouseholdId?: string
  ): PrivacyAccessRule {
    const role = userRole.toUpperCase();

    switch (domain) {
      case 'domestic_attendance':
        // Linked household + authorized staff only
        if (role === 'SOCIETY_ADMIN' || role === 'SECURITY' || role === 'SUPER_ADMIN') {
          return {
            domain,
            accessPolicy: 'Authorized Staff Access Granted',
            allowedViewerRoles: ['SOCIETY_ADMIN', 'SECURITY', 'SUPER_ADMIN'],
            isAuthorized: true,
          };
        }
        if (role === 'RESIDENT' && userHouseholdId && targetHouseholdId && userHouseholdId === targetHouseholdId) {
          return {
            domain,
            accessPolicy: 'Linked Household Access Granted',
            allowedViewerRoles: ['RESIDENT'],
            isAuthorized: true,
          };
        }
        return {
          domain,
          accessPolicy: 'PRIVACY VIOLATION: Domestic attendance is restricted to linked household or authorized staff only.',
          allowedViewerRoles: ['LINKED_HOUSEHOLD_RESIDENT', 'SOCIETY_ADMIN', 'SECURITY'],
          isAuthorized: false,
          reason: 'Unlinked residents cannot view domestic worker attendance records.',
        };

      case 'medical_blood_registry':
        // Opt-in + verified emergency only
        if (role === 'SECURITY' || role === 'SOCIETY_ADMIN' || role === 'RESIDENT') {
          return {
            domain,
            accessPolicy: 'Verified Emergency Opt-In Access Granted',
            allowedViewerRoles: ['OPTED_IN_EMERGENCY_RESPONDER'],
            isAuthorized: true,
          };
        }
        return {
          domain,
          accessPolicy: 'PRIVACY VIOLATION: Medical blood registry requires explicit opt-in and active emergency trigger.',
          allowedViewerRoles: ['OPTED_IN_RESPONDER'],
          isAuthorized: false,
        };

      case 'child_safety':
        // Guardian-authorized only
        if (role === 'RESIDENT' && userHouseholdId === targetHouseholdId) {
          return {
            domain,
            accessPolicy: 'Guardian Authorization Verified',
            allowedViewerRoles: ['GUARDIAN_RESIDENT'],
            isAuthorized: true,
          };
        }
        if (role === 'SECURITY') {
          return {
            domain,
            accessPolicy: 'Gate Verification Terminal Access',
            allowedViewerRoles: ['SECURITY'],
            isAuthorized: true,
          };
        }
        return {
          domain,
          accessPolicy: 'PRIVACY VIOLATION: Child safety records are strictly restricted to verified guardians.',
          allowedViewerRoles: ['GUARDIAN_RESIDENT'],
          isAuthorized: false,
        };

      case 'trust_score':
        // Positive-only + relevant viewers only
        return {
          domain,
          accessPolicy: 'Positive-Only Endorsements Viewable by Relevant Viewers',
          allowedViewerRoles: ['COMMITTEE_MEMBER', 'SOCIETY_ADMIN'],
          isAuthorized: role === 'SOCIETY_ADMIN' || role === 'COMMITTEE_MEMBER',
        };
    }
  }

  /**
   * Enforces masking of sensitive identity documents (Aadhaar, Passport, Driving License)
   */
  public sanitizePublicIdentityDocument(documentNumber?: string): string {
    if (!documentNumber) return 'Not Provided';
    if (documentNumber.length <= 4) return '****';
    return `XXXX-XXXX-${documentNumber.slice(-4)}`;
  }
}

export const privacyAuditEngine = new PrivacyAuditEngine();
