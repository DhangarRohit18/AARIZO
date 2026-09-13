export * from '../../../types/staff';

export type StaffRole = 'GUARD' | 'CLEANER' | 'TECHNICIAN' | 'HOUSEKEEPING' | 'MAINTENANCE';

export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT' | 'CUSTOM';

export type ShiftStatus = 'SCHEDULED' | 'ON_DUTY' | 'COMPLETED' | 'ABSENT' | 'REPLACED' | 'LEAVE';

export interface ShiftHistoryLog {
  id: string;
  action: string;
  timestamp: string;
  performedBy: string;
  details: string;
}

export interface StaffShiftRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: StaffRole;
  phone: string;
  date: string;
  shiftType: ShiftType;
  startTime: string; // e.g. "07:00"
  endTime: string;   // e.g. "15:00"
  status: ShiftStatus;
  
  assignedTask?: string;
  isTaskCompleted: boolean;
  
  attendanceCheckInTime?: string;
  attendanceCheckOutTime?: string;
  overtimeHours: number;
  
  replacementWorkerId?: string;
  replacementWorkerName?: string;
  
  historyLogs: ShiftHistoryLog[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffLeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: StaffRole;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  replacementWorkerName?: string;
  createdAt: string;
}

export interface StaffDashboardMetrics {
  todaysTotalStaff: number;
  onDutyCount: number;
  absentCount: number;
  replacementRequiredCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
}
