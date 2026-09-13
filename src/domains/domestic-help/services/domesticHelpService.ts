import type { DomesticWorker, HouseholdAssignment, AttendanceRecord } from '../types';
import { realtimeService } from '../../../services/realtimeService';
import { filterBySociety } from '../../../utils/societyIsolation';

const STORAGE_KEY_WORKERS = 'aarizo_domestic_workers_v1';
const STORAGE_KEY_ASSIGNMENTS = 'aarizo_worker_assignments_v1';
const STORAGE_KEY_ATTENDANCE = 'aarizo_worker_attendance_v1';

const SEED_WORKERS: DomesticWorker[] = [
  {
    id: 'DW-101',
    societyId: 'soc-gvs',
    name: 'Sunita Devi',
    phone: '9820090123',
    workerType: 'MAID',
    passCode: 'PASS-9042',
    qrCode: 'DW:DW-101|PASS-9042',
    verificationStatus: 'VERIFIED',
    overallStatus: 'CHECKED_IN',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    policeVerificationDocMasked: true,
  },
  {
    id: 'DW-102',
    societyId: 'soc-gvs',
    name: 'Ramesh Kumar',
    phone: '9820090124',
    workerType: 'DRIVER',
    passCode: 'PASS-8812',
    qrCode: 'DW:DW-102|PASS-8812',
    verificationStatus: 'VERIFIED',
    overallStatus: 'CHECKED_OUT',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    policeVerificationDocMasked: true,
  },
  {
    id: 'DW-103',
    societyId: 'soc-gvs',
    name: 'Rekha Sharma',
    phone: '9820090125',
    workerType: 'COOK',
    passCode: 'PASS-7741',
    qrCode: 'DW:DW-103|PASS-7741',
    verificationStatus: 'PENDING',
    overallStatus: 'ABSENT',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    policeVerificationDocMasked: true,
  },
];

const SEED_ASSIGNMENTS: HouseholdAssignment[] = [
  { id: 'asgn-1', workerId: 'DW-101', residentId: 'res-1', residentName: 'Vikram Joshi', flatCode: 'Tower B · B-1204', consentGiven: true, accessRevoked: false, linkedAt: '2026-01-15' },
  { id: 'asgn-2', workerId: 'DW-101', residentId: 'res-2', residentName: 'Ananya Roy', flatCode: 'Tower A · A-402', consentGiven: true, accessRevoked: false, linkedAt: '2026-02-10' },
  { id: 'asgn-3', workerId: 'DW-102', residentId: 'res-1', residentName: 'Vikram Joshi', flatCode: 'Tower B · B-1204', consentGiven: true, accessRevoked: false, linkedAt: '2026-03-01' },
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', workerId: 'DW-101', workerName: 'Sunita Devi', workerType: 'MAID', societyId: 'soc-gvs', residentId: 'res-1', flatCode: 'B-1204', gateName: 'Main Gate 1', entryTime: '09:03 AM', status: 'CHECKED_IN', checkedInByGuard: 'Guard R. Singh' },
  { id: 'att-2', workerId: 'DW-102', workerName: 'Ramesh Kumar', workerType: 'DRIVER', societyId: 'soc-gvs', residentId: 'res-1', flatCode: 'B-1204', gateName: 'Main Gate 1', entryTime: '07:30 AM', exitTime: '05:45 PM', status: 'CHECKED_OUT', checkedInByGuard: 'Guard R. Singh' },
];

class DomesticHelpService {
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

  public getWorkersForResident(residentId = 'res-1', societyId = 'soc-gvs'): { worker: DomesticWorker; assignment: HouseholdAssignment }[] {
    const workers = filterBySociety(this.getStorage<DomesticWorker>(STORAGE_KEY_WORKERS, SEED_WORKERS), societyId);
    const assignments = this.getStorage<HouseholdAssignment>(STORAGE_KEY_ASSIGNMENTS, SEED_ASSIGNMENTS);

    const residentAssignments = assignments.filter((a) => a.residentId === residentId && !a.accessRevoked);

    return residentAssignments
      .map((asgn) => {
        const worker = workers.find((w) => w.id === asgn.workerId);
        return worker ? { worker, assignment: asgn } : null;
      })
      .filter((item): item is { worker: DomesticWorker; assignment: HouseholdAssignment } => item !== null);
  }

  public getAllWorkersForAdmin(societyId = 'soc-gvs'): DomesticWorker[] {
    return filterBySociety(this.getStorage<DomesticWorker>(STORAGE_KEY_WORKERS, SEED_WORKERS), societyId);
  }

  public getAttendanceLogs(societyId = 'soc-gvs', residentId?: string): AttendanceRecord[] {
    const logs = filterBySociety(this.getStorage<AttendanceRecord>(STORAGE_KEY_ATTENDANCE, SEED_ATTENDANCE), societyId);
    if (residentId) {
      return logs.filter((l) => l.residentId === residentId);
    }
    return logs;
  }

  public processGateScanCheckIn(workerId: string, gateName = 'Main Gate 1', guardName = 'Guard On Duty'): { success: boolean; message: string; record?: AttendanceRecord } {
    const workers = this.getStorage<DomesticWorker>(STORAGE_KEY_WORKERS, SEED_WORKERS);
    const index = workers.findIndex((w) => w.id === workerId || w.passCode === workerId || w.qrCode.includes(workerId));

    if (index === -1) {
      return { success: false, message: 'Worker QR / Pass not recognized' };
    }

    const worker = workers[index];
    if (worker.verificationStatus === 'REJECTED' || worker.overallStatus === 'SUSPENDED') {
      return { success: false, message: `Access Denied: Worker status is ${worker.overallStatus}` };
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedWorker: DomesticWorker = { ...worker, overallStatus: 'CHECKED_IN' };
    workers[index] = updatedWorker;
    this.setStorage(STORAGE_KEY_WORKERS, workers);

    // Get primary assigned resident for notification
    const assignments = this.getStorage<HouseholdAssignment>(STORAGE_KEY_ASSIGNMENTS, SEED_ASSIGNMENTS);
    const primaryAsgn = assignments.find((a) => a.workerId === worker.id && !a.accessRevoked);

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      workerType: worker.workerType,
      societyId: worker.societyId,
      residentId: primaryAsgn?.residentId,
      flatCode: primaryAsgn?.flatCode,
      gateName,
      entryTime: nowStr,
      status: 'CHECKED_IN',
      checkedInByGuard: guardName,
    };

    const attendance = this.getStorage<AttendanceRecord>(STORAGE_KEY_ATTENDANCE, SEED_ATTENDANCE);
    this.setStorage(STORAGE_KEY_ATTENDANCE, [newRecord, ...attendance]);

    // Real-Time Event Broadcast across tabs
    realtimeService.publish('WORKER_ENTRY_EXIT', {
      type: 'WORKER_CHECKED_IN',
      workerName: worker.name,
      workerType: worker.workerType,
      entryTime: nowStr,
      flatCode: primaryAsgn?.flatCode || 'Resident Flat',
      residentId: primaryAsgn?.residentId,
    }, worker.societyId, 'SECURITY', guardName);

    return {
      success: true,
      message: `Your ${worker.workerType.toLowerCase()} ${worker.name} entered at ${nowStr}`,
      record: newRecord,
    };
  }

  public processGateScanCheckOut(workerId: string, _gateName = 'Main Gate 1', guardName = 'Guard On Duty'): { success: boolean; message: string } {
    const workers = this.getStorage<DomesticWorker>(STORAGE_KEY_WORKERS, SEED_WORKERS);
    const index = workers.findIndex((w) => w.id === workerId || w.passCode === workerId || w.qrCode.includes(workerId));

    if (index === -1) {
      return { success: false, message: 'Worker QR not found' };
    }

    const worker = workers[index];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedWorker: DomesticWorker = { ...worker, overallStatus: 'CHECKED_OUT' };
    workers[index] = updatedWorker;
    this.setStorage(STORAGE_KEY_WORKERS, workers);

    // Update attendance record exit time
    const attendance = this.getStorage<AttendanceRecord>(STORAGE_KEY_ATTENDANCE, SEED_ATTENDANCE);
    const recIndex = attendance.findIndex((a) => a.workerId === worker.id && a.status === 'CHECKED_IN');
    if (recIndex !== -1) {
      attendance[recIndex] = { ...attendance[recIndex], exitTime: nowStr, status: 'CHECKED_OUT' };
      this.setStorage(STORAGE_KEY_ATTENDANCE, attendance);
    }

    realtimeService.publish('WORKER_ENTRY_EXIT', {
      type: 'WORKER_CHECKED_OUT',
      workerName: worker.name,
      workerType: worker.workerType,
      exitTime: nowStr,
    }, worker.societyId, 'SECURITY', guardName);

    return { success: true, message: `${worker.name} checked out at ${nowStr}` };
  }

  public revokeHouseholdAccess(assignmentId: string): boolean {
    const assignments = this.getStorage<HouseholdAssignment>(STORAGE_KEY_ASSIGNMENTS, SEED_ASSIGNMENTS);
    const index = assignments.findIndex((a) => a.id === assignmentId);
    if (index === -1) return false;

    assignments[index].accessRevoked = true;
    this.setStorage(STORAGE_KEY_ASSIGNMENTS, assignments);
    return true;
  }
}

export const domesticHelpService = new DomesticHelpService();
