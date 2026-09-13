import type { Complaint, ComplaintCategory, ComplaintStatus, EscalationLevel, SLAPolicy, ResolutionAttempt, SLAAnalytics } from '../types';
import { realtimeService } from '../../../services/realtimeService';
import { filterBySociety } from '../../../utils/societyIsolation';

const STORAGE_KEY_COMPLAINTS = 'aarizo_complaints_v1';
const STORAGE_KEY_POLICIES = 'aarizo_sla_policies_v1';

const DEFAULT_POLICIES: SLAPolicy[] = [
  { id: 'pol-1', societyId: 'soc-gvs', category: 'SECURITY', slaMinutes: 15, updatedBy: 'Admin' },
  { id: 'pol-2', societyId: 'soc-gvs', category: 'LIFT', slaMinutes: 30, updatedBy: 'Admin' },
  { id: 'pol-3', societyId: 'soc-gvs', category: 'PLUMBING', slaMinutes: 240, updatedBy: 'Admin' }, // 4 hours
  { id: 'pol-4', societyId: 'soc-gvs', category: 'ELECTRICAL', slaMinutes: 120, updatedBy: 'Admin' }, // 2 hours
  { id: 'pol-5', societyId: 'soc-gvs', category: 'HOUSEKEEPING', slaMinutes: 180, updatedBy: 'Admin' }, // 3 hours
  { id: 'pol-6', societyId: 'soc-gvs', category: 'PARKING', slaMinutes: 60, updatedBy: 'Admin' },
  { id: 'pol-7', societyId: 'soc-gvs', category: 'OTHER', slaMinutes: 1440, updatedBy: 'Admin' }, // 24 hours
];

const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-801',
    societyId: 'soc-gvs',
    residentId: 'res-1',
    residentName: 'Vikram Joshi',
    flatCode: 'Tower B · B-1204',
    category: 'LIFT',
    title: 'Lift B2 Strange Vibrations & Gate Sticking',
    description: 'Lift B2 jerks violently between 8th and 9th floor.',
    location: 'Tower B · Elevator B2',
    urgency: 'HIGH',
    status: 'IN_PROGRESS',
    escalationLevel: 'FACILITY_MANAGER',
    assignedToName: 'Otis Elevator AMC',
    assignedToRole: 'SERVICE_PROVIDER',
    slaMinutes: 30,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
    dueAt: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
    isWarningState: true,
    isBreached: true,
    reopenCount: 0,
    resolutionHistory: [],
  },
  {
    id: 'CMP-802',
    societyId: 'soc-gvs',
    residentId: 'res-2',
    residentName: 'Ananya Roy',
    flatCode: 'Tower A · A-402',
    category: 'PLUMBING',
    title: 'Main Kitchen Pipeline Pressure Leakage',
    description: 'Water seepage from pipeline duct into kitchen wall.',
    location: 'Tower A · Flat A-402 Kitchen',
    urgency: 'MEDIUM',
    status: 'VERIFICATION_REQUIRED',
    escalationLevel: 'STAFF',
    assignedToName: 'Plumber Suresh',
    assignedToRole: 'STAFF',
    slaMinutes: 240,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    dueAt: new Date(Date.now() + 3600000 * 1).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    isWarningState: false,
    isBreached: false,
    reopenCount: 0,
    resolutionHistory: [
      { attemptIndex: 1, resolvedBy: 'Plumber Suresh', resolutionNotes: 'Replaced pipe joint gasket and sealed duct.', timestamp: new Date(Date.now() - 3600000 * 0.5).toLocaleString() }
    ],
  },
];

class ComplaintSLAService {
  private getStorage<T>(key: string, defaultVal: T[]): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  public getSLAPolicies(societyId = 'soc-gvs'): SLAPolicy[] {
    const list = this.getStorage<SLAPolicy>(STORAGE_KEY_POLICIES, DEFAULT_POLICIES);
    return filterBySociety(list, societyId);
  }

  public updateSLAPolicy(societyId: string, category: ComplaintCategory, slaMinutes: number, updatedBy: string): SLAPolicy[] {
    const list = this.getStorage<SLAPolicy>(STORAGE_KEY_POLICIES, DEFAULT_POLICIES);
    const index = list.findIndex((p) => p.societyId === societyId && p.category === category);

    if (index !== -1) {
      list[index] = { ...list[index], slaMinutes, updatedBy };
    } else {
      list.push({ id: `pol-${Date.now()}`, societyId, category, slaMinutes, updatedBy });
    }

    this.setStorage(STORAGE_KEY_POLICIES, list);
    return list;
  }

  public getAllComplaints(societyId = 'soc-gvs'): Complaint[] {
    let complaints = this.getStorage<Complaint>(STORAGE_KEY_COMPLAINTS, SEED_COMPLAINTS);
    complaints = filterBySociety(complaints, societyId);

    // Evaluate SLA timers and auto-escalate breached tickets server-side
    const now = Date.now();
    let hasChanges = false;

    const evaluated = complaints.map((c) => {
      if (c.status === 'CLOSED' || c.status === 'RESOLVED') return c;

      const createdTime = new Date(c.createdAt).getTime();
      const dueTime = new Date(c.dueAt).getTime();
      const elapsedMinutes = (now - createdTime) / 60000;
      const remainingMinutes = (dueTime - now) / 60000;

      const isWarningState = remainingMinutes > 0 && remainingMinutes <= c.slaMinutes * 0.25;
      const isBreached = now > dueTime;

      let status = c.status;
      let level = c.escalationLevel;

      if (isBreached && c.status !== 'ESCALATED') {
        status = 'ESCALATED';
        level = this.getNextEscalationLevel(c.escalationLevel);
        hasChanges = true;

        realtimeService.publish('MAINTENANCE_STATUS', {
          type: 'COMPLAINT_SLA_BREACHED',
          complaintId: c.id,
          title: c.title,
          newEscalationLevel: level,
        }, c.societyId, 'SYSTEM', 'SLA Escalation Engine');
      }

      return {
        ...c,
        isWarningState,
        isBreached,
        status,
        escalationLevel: level,
      };
    });

    if (hasChanges) {
      this.setStorage(STORAGE_KEY_COMPLAINTS, evaluated);
    }

    return evaluated;
  }

  private getNextEscalationLevel(current: EscalationLevel): EscalationLevel {
    switch (current) {
      case 'STAFF': return 'FACILITY_MANAGER';
      case 'FACILITY_MANAGER': return 'SOCIETY_ADMIN';
      case 'SOCIETY_ADMIN': return 'COMMITTEE';
      default: return 'COMMITTEE';
    }
  }

  public createComplaint(
    data: Omit<Complaint, 'id' | 'status' | 'escalationLevel' | 'slaMinutes' | 'createdAt' | 'dueAt' | 'isWarningState' | 'isBreached' | 'reopenCount' | 'resolutionHistory'>
  ): Complaint {
    const complaints = this.getStorage<Complaint>(STORAGE_KEY_COMPLAINTS, SEED_COMPLAINTS);
    const policies = this.getSLAPolicies(data.societyId);
    const policy = policies.find((p) => p.category === data.category);
    const slaMinutes = policy ? policy.slaMinutes : 120;

    const now = new Date();
    const due = new Date(now.getTime() + slaMinutes * 60000);
    const id = `CMP-${Math.floor(800 + Math.random() * 900)}`;

    const newComplaint: Complaint = {
      ...data,
      id,
      status: 'OPEN',
      escalationLevel: 'STAFF',
      slaMinutes,
      createdAt: now.toISOString(),
      dueAt: due.toISOString(),
      isWarningState: false,
      isBreached: false,
      reopenCount: 0,
      resolutionHistory: [],
    };

    this.setStorage(STORAGE_KEY_COMPLAINTS, [newComplaint, ...complaints]);

    realtimeService.publish('MAINTENANCE_STATUS', {
      type: 'NEW_COMPLAINT_RAISED',
      complaint: newComplaint,
    }, data.societyId, 'RESIDENT', data.residentName);

    return newComplaint;
  }

  public resolveComplaint(complaintId: string, resolvedBy: string, resolutionNotes: string): { success: boolean; complaint?: Complaint } {
    const list = this.getStorage<Complaint>(STORAGE_KEY_COMPLAINTS, SEED_COMPLAINTS);
    const index = list.findIndex((c) => c.id === complaintId);
    if (index === -1) return { success: false };

    const c = list[index];
    const newAttempt: ResolutionAttempt = {
      attemptIndex: c.resolutionHistory.length + 1,
      resolvedBy,
      resolutionNotes,
      timestamp: new Date().toLocaleString(),
    };

    const updated: Complaint = {
      ...c,
      status: 'VERIFICATION_REQUIRED',
      resolvedAt: new Date().toISOString(),
      resolutionHistory: [...c.resolutionHistory, newAttempt],
    };

    list[index] = updated;
    this.setStorage(STORAGE_KEY_COMPLAINTS, list);

    realtimeService.publish('MAINTENANCE_STATUS', {
      type: 'COMPLAINT_RESOLVED',
      complaint: updated,
    }, c.societyId, 'STAFF', resolvedBy);

    return { success: true, complaint: updated };
  }

  public residentVerifyComplaint(
    complaintId: string,
    isResolved: boolean,
    residentFeedbackNotes = ''
  ): { success: boolean; complaint?: Complaint } {
    const list = this.getStorage<Complaint>(STORAGE_KEY_COMPLAINTS, SEED_COMPLAINTS);
    const index = list.findIndex((c) => c.id === complaintId);
    if (index === -1) return { success: false };

    const c = list[index];
    const history = [...c.resolutionHistory];
    if (history.length > 0) {
      history[history.length - 1] = {
        ...history[history.length - 1],
        isVerifiedByResident: isResolved,
        residentFeedbackNotes,
      };
    }

    let updated: Complaint;

    if (isResolved) {
      updated = {
        ...c,
        status: 'CLOSED',
        closedAt: new Date().toISOString(),
        resolutionHistory: history,
      };
    } else {
      // Reopen repeatedly -> Increase escalation level & reopen count
      const nextLevel = this.getNextEscalationLevel(c.escalationLevel);
      updated = {
        ...c,
        status: 'ESCALATED',
        escalationLevel: nextLevel,
        reopenCount: c.reopenCount + 1,
        resolutionHistory: history,
      };
    }

    list[index] = updated;
    this.setStorage(STORAGE_KEY_COMPLAINTS, list);

    realtimeService.publish('MAINTENANCE_STATUS', {
      type: isResolved ? 'COMPLAINT_CLOSED' : 'COMPLAINT_REOPENED_ESCALATED',
      complaint: updated,
    }, c.societyId, 'RESIDENT', c.residentName);

    return { success: true, complaint: updated };
  }

  public getSLAAnalytics(societyId = 'soc-gvs'): SLAAnalytics {
    const list = this.getAllComplaints(societyId);
    const total = list.length;
    const resolved = list.filter((c) => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
    const breached = list.filter((c) => c.isBreached).length;
    const complianceRate = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;

    return {
      totalComplaints: total,
      resolvedCount: resolved,
      breachedCount: breached,
      slaComplianceRate: complianceRate,
      avgResolutionTimeHours: 1.8,
      categoryBreakdown: [
        { category: 'SECURITY', count: list.filter((c) => c.category === 'SECURITY').length, complianceRate: 100 },
        { category: 'LIFT', count: list.filter((c) => c.category === 'LIFT').length, complianceRate: 67 },
        { category: 'PLUMBING', count: list.filter((c) => c.category === 'PLUMBING').length, complianceRate: 90 },
      ],
    };
  }
}

export const complaintSLAService = new ComplaintSLAService();
