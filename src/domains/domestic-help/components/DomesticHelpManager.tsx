import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle,
  ShieldCheck,
  UserX,
  Bell,
  Lock,
} from 'lucide-react';
import { domesticHelpService } from '../services/domesticHelpService';
import type { DomesticWorker, HouseholdAssignment, AttendanceRecord } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useRBAC } from '../../../hooks/useRBAC';
import { realtimeService } from '../../../services/realtimeService';

export const DomesticHelpManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeRole } = useRBAC();

  const [residentWorkers, setResidentWorkers] = useState<{ worker: DomesticWorker; assignment: HouseholdAssignment }[]>([]);
  const [allWorkers, setAllWorkers] = useState<DomesticWorker[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [realtimeEntryAlert, setRealtimeEntryAlert] = useState<string | null>(null);

  // Security gate scan simulation state
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('DW-101');
  const [scanResultMsg, setScanResultMsg] = useState<{ success?: boolean; message?: string }>({});

  const loadData = () => {
    if (activeRole === 'RESIDENT') {
      const rw = domesticHelpService.getWorkersForResident(currentUser?.id || 'res-1', 'soc-gvs');
      setResidentWorkers(rw);
      setAttendanceLogs(domesticHelpService.getAttendanceLogs('soc-gvs', currentUser?.id || 'res-1'));
    } else {
      setAllWorkers(domesticHelpService.getAllWorkersForAdmin('soc-gvs'));
      setAttendanceLogs(domesticHelpService.getAttendanceLogs('soc-gvs'));
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time worker gate entry/exit events
    const unsubscribe = realtimeService.subscribe('WORKER_ENTRY_EXIT', (msg) => {
      if (msg.payload && msg.payload.type === 'WORKER_CHECKED_IN') {
        const alertStr = `Your ${msg.payload.workerType.toLowerCase()} ${msg.payload.workerName} entered at ${msg.payload.entryTime}`;
        setRealtimeEntryAlert(alertStr);
      }
      loadData();
    });

    return () => unsubscribe();
  }, [activeRole]);

  const handleGateScanCheckIn = () => {
    const res = domesticHelpService.processGateScanCheckIn(selectedWorkerId, 'Main Gate 1', 'Guard R. Singh');
    setScanResultMsg(res);
    loadData();
  };

  const handleGateScanCheckOut = () => {
    const res = domesticHelpService.processGateScanCheckOut(selectedWorkerId, 'Main Gate 1', 'Guard R. Singh');
    setScanResultMsg(res);
    loadData();
  };

  const handleRevokeConsent = (assignmentId: string) => {
    domesticHelpService.revokeHouseholdAccess(assignmentId);
    loadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Real-time Alert Banner */}
      {realtimeEntryAlert && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex justify-between items-center animate-bounce">
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <div>
              <span className="text-xs uppercase font-extrabold text-emerald-200">Live Gate Entry Alert</span>
              <p className="font-bold text-sm">{realtimeEntryAlert}</p>
            </div>
          </div>
          <button onClick={() => setRealtimeEntryAlert(null)} className="text-xs font-bold bg-emerald-700 px-3 py-1 rounded-lg">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Domestic Help & Household Staff Hub</h1>
          <p className="text-sm text-slate-500">
            Household worker linkages, consent management, QR gate check-in, & privacy-protected attendance logs
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs flex items-center gap-1">
            <ShieldCheck size={14} /> Verified Staff Network
          </span>
        </div>
      </div>

      {/* Security Gate QR Terminal View */}
      {(activeRole === 'SECURITY_GUARD' || activeRole === 'SECURITY' || activeRole === 'SOCIETY_ADMIN' || activeRole === 'SUPER_ADMIN') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="text-indigo-600" size={20} /> Security Gate Terminal — Scan Domestic Staff Pass
          </h3>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="p-2.5 border rounded-xl text-xs border-slate-300 font-semibold flex-1 w-full"
            >
              <option value="DW-101">Sunita Devi (Maid) • PASS-9042</option>
              <option value="DW-102">Ramesh Kumar (Driver) • PASS-8812</option>
              <option value="DW-103">Rekha Sharma (Cook) • PASS-7741</option>
            </select>

            <button
              onClick={handleGateScanCheckIn}
              className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Gate Check-In Scan
            </button>

            <button
              onClick={handleGateScanCheckOut}
              className="w-full md:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <UserX size={16} /> Gate Check-Out
            </button>
          </div>

          {scanResultMsg.message && (
            <div className={`p-3 rounded-xl text-xs font-bold ${scanResultMsg.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {scanResultMsg.message}
            </div>
          )}
        </div>
      )}

      {/* Resident View: Linked Household Workers */}
      {activeRole === 'RESIDENT' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">My Household Linked Staff ({residentWorkers.length})</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {residentWorkers.map(({ worker, assignment }) => (
              <div key={worker.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={worker.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                    alt={worker.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {worker.workerType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Pass ID: {worker.passCode} • Phone: {worker.phone}</p>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                      <CheckCircle size={12} /> Resident Consent Granted
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    worker.overallStatus === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {worker.overallStatus}
                  </span>
                  <button
                    onClick={() => handleRevokeConsent(assignment.id)}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Revoke Consent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin / Facility View: Society Aggregate Worker List */}
      {(activeRole === 'SOCIETY_ADMIN' || activeRole === 'FACILITY_MANAGER' || activeRole === 'SUPER_ADMIN') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-lg font-bold text-slate-900">Society Domestic Staff Directory ({allWorkers.length})</h3>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Lock size={12} /> Identity Docs Masked for Privacy
            </span>
          </div>

          <div className="divide-y">
            {allWorkers.map((w) => (
              <div key={w.id} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <img src={w.avatarUrl} alt={w.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-800">{w.name}</span> ({w.workerType})
                    <p className="text-slate-500 text-[10px]">Pass: {w.passCode} • Status: {w.overallStatus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                    {w.verificationStatus}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Police Doc Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800">Attendance Log History</h3>
        <div className="overflow-x-auto">
<table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b font-bold uppercase text-[10px]">
              <th className="p-3">Staff Name & Type</th>
              <th className="p-3">Flat & Household</th>
              <th className="p-3">Entry Time</th>
              <th className="p-3">Exit Time</th>
              <th className="p-3">Gate & Verified By</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendanceLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-800">{log.workerName} ({log.workerType})</td>
                <td className="p-3 text-slate-600">{log.flatCode || 'Multiple Households'}</td>
                <td className="p-3 text-emerald-600 font-semibold">{log.entryTime}</td>
                <td className="p-3 text-slate-500">{log.exitTime || 'Inside'}</td>
                <td className="p-3 text-slate-500">{log.gateName} ({log.checkedInByGuard})</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    log.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
