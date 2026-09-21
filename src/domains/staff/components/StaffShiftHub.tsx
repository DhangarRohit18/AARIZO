import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  PlusCircle,
  Search,
  History,
  X,
} from 'lucide-react';
import { staffShiftService } from '../services/staffShiftService';
import type { StaffShiftRecord, StaffDashboardMetrics, StaffRole, ShiftType, ShiftStatus } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

export const StaffShiftHub: React.FC = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<StaffDashboardMetrics>(() => staffShiftService.getMetrics());
  const [shifts, setShifts] = useState<StaffShiftRecord[]>(() => staffShiftService.getShifts());

  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeShiftForModal, setActiveShiftForModal] = useState<StaffShiftRecord | null>(null);
  const [modalMode, setModalMode] = useState<'CREATE' | 'REPLACE' | 'HISTORY' | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    staffName: '',
    staffRole: 'GUARD' as StaffRole,
    phone: '',
    date: new Date().toISOString().split('T')[0],
    shiftType: 'MORNING' as ShiftType,
    startTime: '07:00',
    endTime: '15:00',
    assignedTask: '',
  });

  const [replacementName, setReplacementName] = useState('');

  const loadData = () => {
    setMetrics(staffShiftService.getMetrics());
    setShifts(staffShiftService.getShifts());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = realTimeSync.subscribe('STAFF_SHIFTS_UPDATED', () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const filteredShifts = shifts.filter((s) => {
    if (selectedRole !== 'ALL' && s.staffRole !== selectedRole) return false;
    if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.staffName.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.assignedTask && s.assignedTask.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.staffName) return;

    staffShiftService.createShift(
      {
        staffId: `stf-${Date.now()}`,
        staffName: createForm.staffName,
        staffRole: createForm.staffRole,
        phone: createForm.phone || '+91 98765 00000',
        date: createForm.date,
        shiftType: createForm.shiftType,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        assignedTask: createForm.assignedTask,
      },
      currentUser?.name || 'Facility Manager'
    );

    setModalMode(null);
    loadData();
    alert('Shift scheduled successfully.');
  };

  const handleStatusChange = (shiftId: string, status: ShiftStatus) => {
    staffShiftService.markStatus(shiftId, status, currentUser?.name || 'Facility Manager');
    loadData();
  };

  const handleReplacementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShiftForModal || !replacementName) return;

    staffShiftService.assignReplacement(activeShiftForModal.id, replacementName, currentUser?.name || 'Facility Manager');
    setModalMode(null);
    loadData();
    alert(`Replacement worker "${replacementName}" assigned.`);
  };

  const handleCompleteTask = (shiftId: string) => {
    staffShiftService.completeTask(shiftId, 1.0);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Staff</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.todaysTotalStaff}</span>
            <Users size={20} className="text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Duty</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600">{metrics.onDutyCount}</span>
            <UserCheck size={20} className="text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Absent</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-rose-600">{metrics.absentCount}</span>
            <UserX size={20} className="text-rose-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Replacement Req.</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">{metrics.replacementRequiredCount}</span>
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-indigo-600">{metrics.pendingTasksCount}</span>
            <Clock size={20} className="text-indigo-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasks Completed</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600">{metrics.completedTasksCount}</span>
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, task, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border rounded-lg text-xs font-semibold bg-white text-slate-700"
          >
            <option value="ALL">All Staff Roles</option>
            <option value="GUARD">Security Guard</option>
            <option value="CLEANER">Cleaner</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="HOUSEKEEPING">Housekeeping</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-xs font-semibold bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ON_DUTY">On Duty</option>
            <option value="ABSENT">Absent</option>
            <option value="REPLACED">Replaced</option>
          </select>
        </div>

        <button
          onClick={() => {
            setCreateForm({
              staffName: '',
              staffRole: 'GUARD',
              phone: '',
              date: new Date().toISOString().split('T')[0],
              shiftType: 'MORNING',
              startTime: '07:00',
              endTime: '15:00',
              assignedTask: '',
            });
            setModalMode('CREATE');
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
        >
          <PlusCircle size={15} /> Schedule Shift & Assign Task
        </button>
      </div>

      {/* Roster Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filteredShifts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-600">No shift records found for this filter.</p>
          </div>
        ) : (
          filteredShifts.map((shift) => (
            <div key={shift.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-800 rounded">
                    {shift.staffRole}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{shift.staffName}</h4>
                  <span className="text-xs text-slate-400">({shift.phone})</span>

                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      shift.status === 'ON_DUTY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : shift.status === 'ABSENT'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : shift.status === 'REPLACED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {shift.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                  <span>
                    Shift: <strong className="text-slate-800">{shift.shiftType}</strong> ({shift.startTime} - {shift.endTime})
                  </span>
                  {shift.attendanceCheckInTime && (
                    <span className="text-emerald-700 font-semibold">In at: {shift.attendanceCheckInTime}</span>
                  )}
                  {shift.overtimeHours > 0 && (
                    <span className="text-indigo-600 font-semibold">OT: {shift.overtimeHours} hrs</span>
                  )}
                </div>

                {shift.assignedTask && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-700 font-medium">Task: {shift.assignedTask}</span>
                    {shift.isTaskCompleted ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> COMPLETED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteTask(shift.id)}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}

                {shift.replacementWorkerName && (
                  <div className="text-xs text-purple-700 font-semibold">
                    Replacement Worker: {shift.replacementWorkerName}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {shift.status !== 'ON_DUTY' && (
                  <button
                    onClick={() => handleStatusChange(shift.id, 'ON_DUTY')}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg"
                  >
                    Check In
                  </button>
                )}

                {shift.status !== 'ABSENT' && (
                  <button
                    onClick={() => handleStatusChange(shift.id, 'ABSENT')}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-lg"
                  >
                    Mark Absent
                  </button>
                )}

                {(shift.status === 'ABSENT' || !shift.replacementWorkerName) && (
                  <button
                    onClick={() => {
                      setActiveShiftForModal(shift);
                      setReplacementName('');
                      setModalMode('REPLACE');
                    }}
                    className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold rounded-lg"
                  >
                    Assign Replacement
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveShiftForModal(shift);
                    setModalMode('HISTORY');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <History size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Shift Modal */}
      {modalMode === 'CREATE' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Schedule Staff Shift</h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Guard"
                  value={createForm.staffName}
                  onChange={(e) => setCreateForm({ ...createForm, staffName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Role</label>
                  <select
                    value={createForm.staffRole}
                    onChange={(e) => setCreateForm({ ...createForm, staffRole: e.target.value as StaffRole })}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="GUARD">Security Guard</option>
                    <option value="CLEANER">Cleaner</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Type</label>
                  <select
                    value={createForm.shiftType}
                    onChange={(e) => setCreateForm({ ...createForm, shiftType: e.target.value as ShiftType })}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="MORNING">Morning (07:00 - 15:00)</option>
                    <option value="EVENING">Evening (15:00 - 23:00)</option>
                    <option value="NIGHT">Night (23:00 - 07:00)</option>
                    <option value="CUSTOM">Custom Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Task / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Gate Guarding & Intercom"
                  value={createForm.assignedTask}
                  onChange={(e) => setCreateForm({ ...createForm, assignedTask: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  style={{ background: '#F1F5F9', color: '#334155' }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'var(--aarizo-blue, #176B91)', color: '#FFFFFF' }}
                  className="px-5 py-2 text-xs font-bold rounded-lg shadow-md hover:brightness-110 transition-all"
                >
                  Schedule Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Staff Modal */}
      {modalMode === 'REPLACE' && activeShiftForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Assign Shift Replacement</h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Assign replacement worker for <strong className="text-slate-900">{activeShiftForModal.staffName}</strong> ({activeShiftForModal.staffRole})
            </p>

            <form onSubmit={handleReplacementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Replacement Worker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavita Housekeeping"
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  style={{ background: '#F1F5F9', color: '#334155' }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#D97706', color: '#FFFFFF' }}
                  className="px-5 py-2 text-xs font-bold rounded-lg shadow-md hover:brightness-110 transition-all"
                >
                  Confirm Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {modalMode === 'HISTORY' && activeShiftForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 md:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Shift Audit History</h3>
                <p className="text-xs text-slate-500">{activeShiftForModal.staffName} ({activeShiftForModal.staffRole})</p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {activeShiftForModal.historyLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span className="text-indigo-600">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-800">{log.details}</p>
                  <div className="text-[10px] text-slate-400">By: {log.performedBy}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                style={{ background: '#F1F5F9', color: '#334155' }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
