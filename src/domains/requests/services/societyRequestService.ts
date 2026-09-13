import type { SocietyRequest, SocietyRequestStatus, RequestDocument, RequestAuditLog } from '../types';
import { realtimeService } from '../../../services/realtimeService';
import { filterBySociety } from '../../../utils/societyIsolation';

const STORAGE_KEY = 'aarizo_society_requests_v1';

const SEED_REQUESTS: SocietyRequest[] = [
  {
    id: 'REQ-2026-101',
    societyId: 'soc-gvs',
    residentId: 'res-1',
    residentName: 'Vikram Joshi',
    flatCode: 'Tower B · B-1204',
    title: 'Balcony Grill Expansion & Interior Renovation Permission',
    category: 'RENOVATION_PERMISSION',
    description: 'Requesting permission to install safety balcony mesh and internal wall painting from 20 Sep to 05 Oct 2026.',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    assignedOfficerName: 'Facility Manager Suresh',
    requiresCommitteeApproval: true,
    committeeApproved: false,
    slaHours: 48,
    targetCompletionDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    isSlaBreached: false,
    documents: [
      { id: 'doc-1', fileName: 'Architect_Layout_Plan.pdf', fileUrl: '/docs/plan.pdf', uploadedBy: 'Vikram Joshi', uploadedAt: '2026-09-12 10:30' },
      { id: 'doc-2', fileName: 'Contractor_ID_Proof.pdf', fileUrl: '/docs/id.pdf', uploadedBy: 'Vikram Joshi', uploadedAt: '2026-09-12 10:31' }
    ],
    history: [
      { id: 'h-1', timestamp: '2026-09-12 10:30', actorId: 'res-1', actorName: 'Vikram Joshi', actorRole: 'RESIDENT', action: 'Request Submitted', toStatus: 'SUBMITTED', notes: 'Initial submission' },
      { id: 'h-2', timestamp: '2026-09-13 09:15', actorId: 'admin-1', actorName: 'Secretary Mayuri', actorRole: 'SOCIETY_ADMIN', action: 'Moved to Under Review', fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', notes: 'Forwarded to Committee for architectural structural check' }
    ],
    createdAt: '2026-09-12T10:30:00.000Z',
    updatedAt: '2026-09-13T09:15:00.000Z',
  },
  {
    id: 'REQ-2026-102',
    societyId: 'soc-gvs',
    residentId: 'res-2',
    residentName: 'Ananya Roy',
    flatCode: 'Tower A · A-402',
    title: 'Tenant Registration & Gate Pass NOC',
    category: 'TENANT_REGISTRATION',
    description: 'Tenant onboarding for Mr. Rahul Sharma entering on 1st October. Rental agreement attached.',
    status: 'APPROVED',
    priority: 'MEDIUM',
    assignedOfficerName: 'Secretary Mayuri',
    requiresCommitteeApproval: false,
    committeeApproved: true,
    slaHours: 24,
    targetCompletionDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    isSlaBreached: false,
    documents: [
      { id: 'doc-3', fileName: 'Registered_Rent_Agreement.pdf', fileUrl: '/docs/rent.pdf', uploadedBy: 'Ananya Roy', uploadedAt: '2026-09-10 14:00' },
      { id: 'doc-4', fileName: 'Police_Verification_Certificate.pdf', fileUrl: '/docs/police.pdf', uploadedBy: 'Ananya Roy', uploadedAt: '2026-09-10 14:02' }
    ],
    history: [
      { id: 'h-3', timestamp: '2026-09-10 14:00', actorId: 'res-2', actorName: 'Ananya Roy', actorRole: 'RESIDENT', action: 'Request Submitted', toStatus: 'SUBMITTED' },
      { id: 'h-4', timestamp: '2026-09-11 11:00', actorId: 'admin-1', actorName: 'Secretary Mayuri', actorRole: 'SOCIETY_ADMIN', action: 'Request Approved', fromStatus: 'UNDER_REVIEW', toStatus: 'APPROVED', notes: 'Documents verified. Tenant NOC issued.' }
    ],
    createdAt: '2026-09-10T14:00:00.000Z',
    updatedAt: '2026-09-11T11:00:00.000Z',
  },
  {
    id: 'REQ-2026-103',
    societyId: 'soc-gvs',
    residentId: 'res-3',
    residentName: 'Mayuri Udar',
    flatCode: 'Tower C · C-301',
    title: 'Clubhouse Main Lawn Private Birthday Event Permission',
    category: 'EVENT_PERMISSION',
    description: 'Booking Main Lawn for family birthday gathering on 25 Sep from 06:00 PM to 10:00 PM (80 guests).',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignedOfficerName: 'Facility Manager Suresh',
    requiresCommitteeApproval: true,
    committeeApproved: true,
    slaHours: 48,
    targetCompletionDate: new Date(Date.now() + 86400000).toISOString(),
    isSlaBreached: false,
    documents: [
      { id: 'doc-5', fileName: 'Event_Lawn_Deposit_Receipt.pdf', fileUrl: '/docs/deposit.pdf', uploadedBy: 'Mayuri Udar', uploadedAt: '2026-09-13 16:20' }
    ],
    history: [
      { id: 'h-5', timestamp: '2026-09-13 16:20', actorId: 'res-3', actorName: 'Mayuri Udar', actorRole: 'RESIDENT', action: 'Request Submitted', toStatus: 'SUBMITTED' },
      { id: 'h-6', timestamp: '2026-09-14 08:30', actorId: 'fm-1', actorName: 'Facility Manager Suresh', actorRole: 'FACILITY_MANAGER', action: 'Moved to In Progress', fromStatus: 'APPROVED', toStatus: 'IN_PROGRESS', notes: 'Deposit received. Lawn reservation confirmed.' }
    ],
    createdAt: '2026-09-13T16:20:00.000Z',
    updatedAt: '2026-09-14T08:30:00.000Z',
  }
];

class SocietyRequestService {
  private getStorage(): SocietyRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : SEED_REQUESTS;
    } catch {
      return SEED_REQUESTS;
    }
  }

  private setStorage(items: SocietyRequest[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save requests storage', e);
    }
  }

  public getAllRequests(societyId = 'soc-gvs'): SocietyRequest[] {
    const list = this.getStorage();
    return filterBySociety(list, societyId);
  }

  public createRequest(
    data: Omit<SocietyRequest, 'id' | 'status' | 'isSlaBreached' | 'history' | 'createdAt' | 'updatedAt'>,
    actorName: string,
    actorRole: string
  ): SocietyRequest {
    const list = this.getStorage();
    const nowIso = new Date().toISOString();
    const id = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newReq: SocietyRequest = {
      ...data,
      id,
      status: 'SUBMITTED',
      isSlaBreached: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          actorId: data.residentId,
          actorName,
          actorRole,
          action: 'Request Submitted',
          toStatus: 'SUBMITTED',
          notes: 'New society request filed',
        },
      ],
    };

    const updated = [newReq, ...list];
    this.setStorage(updated);

    realtimeService.publish('NOTIFICATIONS', {
      type: 'REQUEST_SUBMITTED',
      request: newReq,
    }, data.societyId, actorRole, actorName);

    return newReq;
  }

  public updateRequestStatus(
    requestId: string,
    toStatus: SocietyRequestStatus,
    actorId: string,
    actorName: string,
    actorRole: string,
    notes?: string,
    assignedOfficerName?: string,
    newDocument?: RequestDocument
  ): SocietyRequest | null {
    const list = this.getStorage();
    const index = list.findIndex((r) => r.id === requestId);
    if (index === -1) return null;

    const req = list[index];
    const fromStatus = req.status;
    const nowIso = new Date().toISOString();

    const historyEntry: RequestAuditLog = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actorId,
      actorName,
      actorRole,
      action: `Status changed to ${toStatus}`,
      fromStatus,
      toStatus,
      notes,
    };

    const updatedDocs = newDocument ? [...req.documents, newDocument] : req.documents;
    const committeeApproved = toStatus === 'APPROVED' ? true : req.committeeApproved;

    const updatedReq: SocietyRequest = {
      ...req,
      status: toStatus,
      assignedOfficerName: assignedOfficerName || req.assignedOfficerName,
      committeeApproved,
      documents: updatedDocs,
      history: [historyEntry, ...req.history],
      updatedAt: nowIso,
    };

    list[index] = updatedReq;
    this.setStorage(list);

    realtimeService.publish('NOTIFICATIONS', {
      type: 'REQUEST_STATUS_UPDATED',
      request: updatedReq,
    }, req.societyId, actorRole, actorName);

    return updatedReq;
  }
}

export const societyRequestService = new SocietyRequestService();
