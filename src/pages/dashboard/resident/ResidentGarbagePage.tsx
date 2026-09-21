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
  const flatNumber = (currentUser as any)?.flatDetails
    ? String((currentUser as any).flatDetails).replace(/Â·|â€¢|Ã¢â‚¬Â¢/g, '·')
    : 'Tower B · Flat 1204';
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
    <div className="space-y-6 p-4 md:p-6 pb-24 max-w-6xl mx-auto">
      {/* Header */}
      <div
        className="p-5 md:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
        style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Garbage & Cleanliness Hub</h1>
          </div>
          <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            Doorstep waste collection schedule, pickup confirmations, missed reporting, and pool hygiene.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Doorstep Waste Collection Card */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#176B91]" /> Today's Waste Collection
              </h2>
              <span className="px-2.5 py-1 bg-sky-50 text-[#176B91] border border-sky-100 text-xs font-bold rounded-full">
                07:00 AM - 09:30 AM Shift
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Flat code: <strong>{flatNumber}</strong></p>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-medium">Collection Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  myFlatLog?.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {myFlatLog ? myFlatLog.status : 'PENDING'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-600 font-medium">Resident Confirmation:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  myFlatLog?.confirmedByResident ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {myFlatLog?.confirmedByResident ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Confirmed by Resident</>
                  ) : (
                    <><AlertTriangle className="w-3.5 h-3.5" /> Pending Confirmation</>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-center gap-2 pt-2">
            {myFlatLog && !myFlatLog.confirmedByResident && (
              <button
                onClick={() => handleConfirmPickup(myFlatLog.id)}
                className="w-full xs:flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Pickup
              </button>
            )}

            <button
              onClick={() => setShowReportForm(true)}
              className="w-full xs:flex-1 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
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

