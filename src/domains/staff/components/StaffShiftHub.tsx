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
      {/* Metrics Banner - Responsive Neat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {[
          { label: "Today's Staff", value: metrics.todaysTotalStaff, color: '#083B56', bg: '#F4FAFE', icon: Users },
          { label: 'On Duty', value: metrics.onDutyCount, color: '#059669', bg: '#ECFDF5', icon: UserCheck },
          { label: 'Absent', value: metrics.absentCount, color: '#DC2626', bg: '#FEF2F2', icon: UserX },
          { label: 'Replace Req.', value: metrics.replacementRequiredCount, color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
          { label: 'Pending Tasks', value: metrics.pendingTasksCount, color: '#176B91', bg: '#EAF6FC', icon: Clock },
          { label: 'Completed', value: metrics.completedTasksCount, color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
        ].map((m, idx) => {
          const IconComponent = m.icon;
          return (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #DCE8EF',
                borderRadius: '12px',
                padding: '0.625rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#657785', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                  {m.label}
                </span>
                <div style={{ width: 22, height: 22, borderRadius: '6px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent size={12} color={m.color} />
                </div>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>
                {m.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Control Bar - Neat & Responsive */}
      <div style={{ background: '#ffffff', border: '1px solid #DCE8EF', borderRadius: '14px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8B9AA5' }} />
          <input
            type="text"
            placeholder="Search staff, task, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.75rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.5rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, background: '#ffffff', color: '#203746' }}
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
            style={{ width: '100%', padding: '0.45rem 0.5rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, background: '#ffffff', color: '#203746' }}
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
          style={{ width: '100%', padding: '0.55rem', background: 'var(--aarizo-blue, #176B91)', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(23, 107, 145, 0.2)' }}
        >
          <PlusCircle size={15} /> Schedule Shift & Assign Task
        </button>
      </div>

      {/* Roster Directory - Neat Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredShifts.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #DCE8EF', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: '#8B9AA5' }}>
            <Users size={32} style={{ margin: '0 auto 0.5rem', color: '#CBD5E1' }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8125rem', color: '#475569' }}>No shift records found for this filter.</p>
          </div>
        ) : (
          filteredShifts.map((shift) => (
            <div
              key={shift.id}
              style={{
                background: '#ffffff',
                border: '1px solid #DCE8EF',
                borderRadius: '14px',
                padding: '0.875rem',
                boxShadow: '0 2px 6px rgba(8, 59, 86, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              {/* Header row: Role badge, Name, Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.15rem 0.45rem', borderRadius: '6px', background: '#F1F5F9', color: '#334155' }}>
                    {shift.staffRole}
                  </span>
                  <span style={{ fontWeight: 800, color: '#083B56', fontSize: '0.875rem' }}>
                    {shift.staffName}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#8B9AA5' }}>
                    {shift.phone}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '20px',
                    background:
                      shift.status === 'ON_DUTY'
                        ? '#ECFDF5'
                        : shift.status === 'ABSENT'
                        ? '#FEF2F2'
                        : shift.status === 'REPLACED'
                        ? '#FAF5FF'
                        : '#F8FAFC',
                    color:
                      shift.status === 'ON_DUTY'
                        ? '#059669'
                        : shift.status === 'ABSENT'
                        ? '#DC2626'
                        : shift.status === 'REPLACED'
                        ? '#176B91'
                        : '#64748B',
                  }}
                >
                  {shift.status}
                </span>
              </div>

              {/* Shift info chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', fontSize: '0.7rem', color: '#657785' }}>
                <span style={{ background: '#F4FAFE', border: '1px solid #E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                  Shift: <strong style={{ color: '#083B56' }}>{shift.shiftType}</strong> ({shift.startTime} - {shift.endTime})
                </span>
                {shift.attendanceCheckInTime && (
                  <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: 600 }}>
                    In: {shift.attendanceCheckInTime}
                  </span>
                )}
                {shift.overtimeHours > 0 && (
                  <span style={{ background: '#EAF6FC', border: '1px solid #DCE8EF', color: '#083B56', padding: '0.15rem 0.45rem', borderRadius: '6px', fontWeight: 600 }}>
                    OT: {shift.overtimeHours} hrs
                  </span>
                )}
              </div>

              {/* Assigned Task Strip */}
              {shift.assignedTask && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem 0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600 }}>
                    Task: {shift.assignedTask}
                  </span>
                  {shift.isTaskCompleted ? (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(shift.id)}
                      style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--aarizo-blue, #176B91)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              )}

              {shift.replacementWorkerName && (
                <div style={{ fontSize: '0.7rem', color: '#176B91', fontWeight: 600 }}>
                  Replacement: {shift.replacementWorkerName}
                </div>
              )}

              {/* Actions Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                {shift.status !== 'ON_DUTY' && (
                  <button
                    onClick={() => handleStatusChange(shift.id, 'ON_DUTY')}
                    style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.3rem 0.65rem', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Check In
                  </button>
                )}

                {shift.status !== 'ABSENT' && (
                  <button
                    onClick={() => handleStatusChange(shift.id, 'ABSENT')}
                    style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '0.3rem 0.65rem', borderRadius: '8px', cursor: 'pointer' }}
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
                    style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.3rem 0.65rem', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Assign Replacement
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveShiftForModal(shift);
                    setModalMode('HISTORY');
                  }}
                  title="Shift Audit History"
                  style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.3rem 0.45rem', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <History size={14} />
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
                    <span className="text-[#083B56] font-bold">{log.action}</span>
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
