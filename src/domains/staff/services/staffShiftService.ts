import type { StaffShiftRecord, StaffDashboardMetrics, ShiftStatus, ShiftHistoryLog } from '../types';
import { realTimeSync } from '../../../services/realTimeSync';

const STORAGE_KEY_SHIFTS = 'aarizo_staff_shifts_v1';

const INITIAL_MOCK_SHIFTS: StaffShiftRecord[] = [
  {
    id: 'shf-001',
    staffId: 'stf-101',
    staffName: 'Vikram Singh',
    staffRole: 'GUARD',
    phone: '+91 98765 11111',
    date: new Date().toISOString().split('T')[0],
    shiftType: 'MORNING',
    startTime: '07:00',
    endTime: '15:00',
    status: 'ON_DUTY',
    assignedTask: 'Main Gate Visitor Verification & Vehicle Logging',
    isTaskCompleted: false,
    attendanceCheckInTime: '06:55 AM',
    overtimeHours: 0,
    historyLogs: [
      {
        id: 'log-1',
        action: 'SHIFT_SCHEDULED',
        timestamp: new Date().toISOString(),
        performedBy: 'Facility Manager',
        details: 'Morning Shift scheduled for Gate 1.',
      },
      {
        id: 'log-2',
        action: 'CHECKED_IN',
        timestamp: new Date().toISOString(),
        performedBy: 'Vikram Singh',
        details: 'Checked in at Gate 1 at 06:55 AM.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shf-002',
    staffId: 'stf-102',
    staffName: 'Ramesh Cleaner',
    staffRole: 'CLEANER',
    phone: '+91 98765 22222',
    date: new Date().toISOString().split('T')[0],
    shiftType: 'MORNING',
    startTime: '08:00',
    endTime: '16:00',
    status: 'ABSENT',
    assignedTask: 'Tower A & B Lobby Deep Cleaning',
    isTaskCompleted: false,
    overtimeHours: 0,
    historyLogs: [
      {
        id: 'log-3',
        action: 'MARKED_ABSENT',
        timestamp: new Date().toISOString(),
        performedBy: 'Facility Manager',
        details: 'Staff member did not report. Marked Absent. Replacement required.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shf-003',
    staffId: 'stf-103',
    staffName: 'Suresh Electrician',
    staffRole: 'TECHNICIAN',
    phone: '+91 98765 33333',
    date: new Date().toISOString().split('T')[0],
    shiftType: 'MORNING',
    startTime: '09:00',
    endTime: '17:00',
    status: 'ON_DUTY',
    assignedTask: 'Clubhouse AC & Generator Meter Reading',
    isTaskCompleted: true,
    attendanceCheckInTime: '08:58 AM',
    overtimeHours: 1.5,
    historyLogs: [
      {
        id: 'log-4',
        action: 'TASK_COMPLETED',
        timestamp: new Date().toISOString(),
        performedBy: 'Suresh Electrician',
        details: 'Meter readings submitted and AC serviced.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shf-004',
    staffId: 'stf-104',
    staffName: 'Sunita Devi',
    staffRole: 'HOUSEKEEPING',
    phone: '+91 98765 44444',
    date: new Date().toISOString().split('T')[0],
    shiftType: 'MORNING',
    startTime: '08:00',
    endTime: '16:00',
    status: 'REPLACED',
    assignedTask: 'Clubhouse Gym & Pool Deck Sanitization',
    isTaskCompleted: true,
    attendanceCheckInTime: '08:05 AM',
    overtimeHours: 0,
    replacementWorkerId: 'stf-105',
    replacementWorkerName: 'Kavita Housekeeping',
    historyLogs: [
      {
        id: 'log-5',
        action: 'REPLACEMENT_ASSIGNED',
        timestamp: new Date().toISOString(),
        performedBy: 'Facility Manager',
        details: 'Assigned Kavita Housekeeping as replacement for Sunita Devi.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class StaffShiftService {
  private getStoredShifts(): StaffShiftRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_SHIFTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(INITIAL_MOCK_SHIFTS));
      return INITIAL_MOCK_SHIFTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_SHIFTS;
    }
  }

  private saveShifts(shifts: StaffShiftRecord[]) {
    localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(shifts));
    realTimeSync.publish('STAFF_SHIFTS_UPDATED', { timestamp: new Date().toISOString() });
  }

  public getShifts(): StaffShiftRecord[] {
    return this.getStoredShifts();
  }

  public getMetrics(): StaffDashboardMetrics {
    const shifts = this.getStoredShifts();
    const todaysDate = new Date().toISOString().split('T')[0];
    const todaysShifts = shifts.filter(s => s.date === todaysDate);

    const todaysTotalStaff = todaysShifts.length;
    const onDutyCount = todaysShifts.filter(s => s.status === 'ON_DUTY').length;
    const absentCount = todaysShifts.filter(s => s.status === 'ABSENT').length;
    const replacementRequiredCount = todaysShifts.filter(s => s.status === 'ABSENT' && !s.replacementWorkerId).length;
    const pendingTasksCount = todaysShifts.filter(s => s.assignedTask && !s.isTaskCompleted).length;
    const completedTasksCount = todaysShifts.filter(s => s.assignedTask && s.isTaskCompleted).length;

    return {
      todaysTotalStaff,
      onDutyCount,
      absentCount,
      replacementRequiredCount,
      pendingTasksCount,
      completedTasksCount,
    };
  }

  public createShift(
    data: Omit<StaffShiftRecord, 'id' | 'status' | 'isTaskCompleted' | 'overtimeHours' | 'historyLogs' | 'createdAt' | 'updatedAt'>,
    performedBy: string = 'Facility Manager'
  ): StaffShiftRecord {
    const shifts = this.getStoredShifts();
    const newId = `shf-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const initialLog: ShiftHistoryLog = {
      id: `log-${Date.now()}`,
      action: 'SHIFT_SCHEDULED',
      timestamp,
      performedBy,
      details: `Shift [${data.shiftType}] scheduled for ${data.staffName} (${data.staffRole}).`,
    };

    const newShift: StaffShiftRecord = {
      ...data,
      id: newId,
      status: 'SCHEDULED',
      isTaskCompleted: false,
      overtimeHours: 0,
      historyLogs: [initialLog],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    shifts.unshift(newShift);
    this.saveShifts(shifts);
    return newShift;
  }

  public markStatus(
    shiftId: string,
    status: ShiftStatus,
    performedBy: string = 'Facility Manager'
  ): StaffShiftRecord | null {
    const shifts = this.getStoredShifts();
    const index = shifts.findIndex(s => s.id === shiftId);
    if (index === -1) return null;

    const shift = shifts[index];
    const timestamp = new Date().toISOString();

    const log: ShiftHistoryLog = {
      id: `log-${Date.now()}`,
      action: `STATUS_CHANGED_TO_${status}`,
      timestamp,
      performedBy,
      details: `Shift status changed from ${shift.status} to ${status}.`,
    };

    let checkInTime = shift.attendanceCheckInTime;
    if (status === 'ON_DUTY' && !checkInTime) {
      checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const updated: StaffShiftRecord = {
      ...shift,
      status,
      attendanceCheckInTime: checkInTime,
      historyLogs: [log, ...shift.historyLogs],
      updatedAt: timestamp,
    };

    shifts[index] = updated;
    this.saveShifts(shifts);
    return updated;
  }

  public assignReplacement(
    shiftId: string,
    replacementName: string,
    performedBy: string = 'Facility Manager'
  ): StaffShiftRecord | null {
    const shifts = this.getStoredShifts();
    const index = shifts.findIndex(s => s.id === shiftId);
    if (index === -1) return null;

    const shift = shifts[index];
    const timestamp = new Date().toISOString();

    const log: ShiftHistoryLog = {
      id: `log-${Date.now()}`,
      action: 'REPLACEMENT_ASSIGNED',
      timestamp,
      performedBy,
      details: `Assigned ${replacementName} as replacement worker for ${shift.staffName}.`,
    };

    const updated: StaffShiftRecord = {
      ...shift,
      status: 'REPLACED',
      replacementWorkerId: `stf-rep-${Date.now()}`,
      replacementWorkerName: replacementName,
      historyLogs: [log, ...shift.historyLogs],
      updatedAt: timestamp,
    };

    shifts[index] = updated;
    this.saveShifts(shifts);
    return updated;
  }

  public completeTask(shiftId: string, overtimeHours: number = 0): StaffShiftRecord | null {
    const shifts = this.getStoredShifts();
    const index = shifts.findIndex(s => s.id === shiftId);
    if (index === -1) return null;

    const shift = shifts[index];
    const timestamp = new Date().toISOString();

    const log: ShiftHistoryLog = {
      id: `log-${Date.now()}`,
      action: 'TASK_COMPLETED',
      timestamp,
      performedBy: shift.staffName,
      details: `Completed assigned task: ${shift.assignedTask}. Logged ${overtimeHours} OT hours.`,
    };

    const updated: StaffShiftRecord = {
      ...shift,
      isTaskCompleted: true,
      overtimeHours: shift.overtimeHours + overtimeHours,
      historyLogs: [log, ...shift.historyLogs],
      updatedAt: timestamp,
    };

    shifts[index] = updated;
    this.saveShifts(shifts);
    return updated;
  }
}

export const staffShiftService = new StaffShiftService();
