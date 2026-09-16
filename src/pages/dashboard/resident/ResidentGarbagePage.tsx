import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { housekeepingService } from '../../../services/housekeepingService';
import type { GarbagePickupLog, HousekeepingTask } from '../../../types/housekeeping';
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  CheckSquare
} from 'lucide-react';

export const ResidentGarbagePage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const flatNumber = (currentUser as any)?.flatDetails || 'A-101';
  const tower = 'Tower A';
  const floor = '1st Floor';

  const [garbageLogs, setGarbageLogs] = useState<GarbagePickupLog[]>([]);
  const [poolTask, setPoolTask] = useState<HousekeepingTask | null>(null);

  const [reportNotes, setReportNotes] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    const logs = housekeepingService.getGarbagePickupLogs(societyId).filter(g => g.flatNumber === flatNumber || flatNumber === 'A-101');
    setGarbageLogs(logs);

    const tasks = housekeepingService.getTasks(societyId);
    const pool = tasks.find(t => t.category === 'SWIMMING_POOL');
    if (pool) setPoolTask(pool);
  };

  const handleConfirmPickup = (logId: string) => {
    housekeepingService.confirmResidentGarbagePickup(societyId, logId);
    setActionMessage('Garbage collection confirmed! Thank you.');
    loadData();
  };

  const handleReportMissed = (e: React.FormEvent) => {
    e.preventDefault();
    housekeepingService.reportMissedGarbagePickup(societyId, tower, floor, flatNumber, reportNotes);
    setActionMessage('Missed garbage collection reported to Housekeeping Supervisor.');
    setShowReportForm(false);
    setReportNotes('');
    loadData();
  };

  const myFlatLog = garbageLogs[0] || null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Garbage & Cleanliness Hub</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Doorstep waste collection schedule, pickup confirmations, missed garbage reporting, and pool maintenance status.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Doorstep Waste Collection Card */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-indigo-600" /> Today's Waste Collection (Flat {flatNumber})
              </h2>
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                07:00 AM - 09:30 AM Shift
              </span>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span>Collection Status:</span>
                <strong className={`px-2 py-0.5 rounded-full text-[11px] ${
                  myFlatLog?.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {myFlatLog ? myFlatLog.status : 'PENDING'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Resident Confirmation:</span>
                <strong>{myFlatLog?.confirmedByResident ? '✅ Confirmed by Resident' : '⚠️ Pending Confirmation'}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {myFlatLog && !myFlatLog.confirmedByResident && (
              <button
                onClick={() => handleConfirmPickup(myFlatLog.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Pickup
              </button>
            )}

            <button
              onClick={() => setShowReportForm(true)}
              className="flex-1 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" /> Report Missed Pickup
            </button>
          </div>
        </div>

        {/* Card 2: Swimming Pool Chemical & Cleanliness Card */}
        {poolTask && (
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Swimming Pool Water Hygiene
              </h2>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                poolTask.status === 'COMPLETED' || poolTask.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {poolTask.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
              <p><strong>Scheduled Cleaning:</strong> {poolTask.startTime} - {poolTask.endTime} (Daily)</p>
              <p><strong>Technician:</strong> {poolTask.assignedStaffName}</p>
              {poolTask.staffNotes && <p className="italic text-slate-600 mt-1">"{poolTask.staffNotes}"</p>}
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block">Chemical Maintenance Checklist:</span>
              {poolTask.checklist.map(chk => (
                <div key={chk.id} className="flex items-center gap-2 text-xs">
                  <CheckSquare className={`w-4 h-4 ${chk.isCompleted ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span className={chk.isCompleted ? 'text-slate-800 font-medium' : 'text-slate-400'}>{chk.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Report Missed Pickup */}
      {showReportForm && (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" /> Report Missed Garbage Pickup for Flat {flatNumber}
          </h3>

          <form onSubmit={handleReportMissed} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes for Housekeeping Supervisor</label>
              <textarea
                rows={3}
                placeholder="e.g. Garbage bin was kept outside door by 7:00 AM, but was not collected during morning shift."
                value={reportNotes}
                onChange={e => setReportNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowReportForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg">Submit Report</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
