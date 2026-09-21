// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle,
  ShieldCheck,
  UserX,
  Bell,
  Lock,
  X,
} from 'lucide-react';
import { domesticHelpService } from '../services/domesticHelpService';
import type { DomesticWorker, HouseholdAssignment, AttendanceRecord } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { useRBAC } from '../../../hooks/useRBAC';
import { realtimeService } from '../../../services/realtimeService';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

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
    if (activeRole === 'resident') {
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

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [workerToLink, setWorkerToLink] = useState('DW-101');

  const handleLinkWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const targetWorker = domesticHelpService.getAllWorkersForAdmin('soc-gvs').find(w => w.id === workerToLink);
    if (targetWorker) {
      domesticHelpService.linkWorkerToResident(
        workerToLink,
        currentUser?.id || 'user-resident-01',
        currentUser?.name || 'Sarvesh Kulkarni',
        currentUser?.flatDetails || 'Tower B · B-1204'
      );
      setShowLinkModal(false);
      loadData();
    }
  };

  return (
    <div className="p-3 md:p-6 pb-24 space-y-4 md:space-y-6 max-w-7xl mx-auto">
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
      <div
        className="p-5 md:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
        style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Domestic Help & Household Staff</h1>
          </div>
          <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            Household staff linkages, consent management, QR gate check-in, & attendance logs.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {activeRole === 'resident' && (
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-4 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:opacity-95 transition"
              style={{ background: 'var(--aarizo-blue, #176B91)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              + Link Household Staff
            </button>
          )}
          <span className="px-3 py-1.5 bg-white/10 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/20">
            <ShieldCheck size={14} className="text-emerald-300" /> Verified Staff Network
          </span>
        </div>
      </div>

      {/* Modal: Link Household Staff */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Link Household Staff to My Flat</h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLinkWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Society-Verified Worker</label>
                <select
                  value={workerToLink}
                  onChange={(e) => setWorkerToLink(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="DW-101">Sunita Devi · Maid (PASS-9042)</option>
                  <option value="DW-102">Ramesh Kumar · Driver (PASS-8812)</option>
                  <option value="DW-103">Rekha Sharma · Cook (PASS-7741)</option>
                </select>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 space-y-1">
                <p className="font-bold">Security Consent Policy:</p>
                <p>Linking grants gate check-in authorization for your flat. You will receive live notification alerts whenever this staff member checks in or out at any society gate.</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-md hover:opacity-95"
                  style={{ background: 'var(--aarizo-blue, #176B91)' }}
                >
                  Confirm Linkage & Grant Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Gate QR Terminal View */}
      {(activeRole === 'guard' || activeRole === 'secretary' || activeRole === 'admin') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="text-[#176B91]" size={20} /> Security Gate Terminal — Scan Domestic Staff Pass
          </h3>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="p-2.5 border rounded-xl text-xs border-slate-300 font-semibold flex-1 w-full"
            >
              <option value="DW-101">Sunita Devi (Maid) · PASS-9042</option>
              <option value="DW-102">Ramesh Kumar (Driver) · PASS-8812</option>
              <option value="DW-103">Rekha Sharma (Cook) · PASS-7741</option>
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
      {activeRole === 'resident' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">My Household Linked Staff ({residentWorkers.length})</h3>

          {residentWorkers.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
              <ShieldCheck size={36} className="mx-auto text-[#176B91]" />
              <h4 className="font-bold text-slate-800 text-sm">No Household Staff Linked Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Link your maids, drivers, or cooks to receive real-time gate entry notifications and grant pre-authorized society gatepass access.</p>
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-4 py-2 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md hover:opacity-95"
                style={{ background: 'var(--aarizo-blue, #176B91)' }}
              >
                + Link Household Staff
              </button>
            </div>
          ) : (
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
                      <p className="text-xs text-slate-500 mt-0.5">Pass ID: {worker.passCode} · Phone: {worker.phone}</p>
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
          )}
        </div>
      )}

      {/* Admin / Facility View: Society Aggregate Worker List */}
      {(activeRole === 'secretary' || activeRole === 'facility_manager' || activeRole === 'admin') && (
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
                    <p className="text-slate-500 text-[10px]">Pass: {w.passCode} · Status: {w.overallStatus}</p>
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
        <div className="mt-4">
          <DataTable
            columns={[
              { key: 'worker', header: 'Staff Name & Type', render: (log: any) => <span className="font-bold text-slate-800">{log.workerName} ({log.workerType})</span> },
              { key: 'household', header: 'Flat & Household', render: (log: any) => <span className="text-slate-600">{log.flatCode || 'Multiple Households'}</span> },
              { key: 'entryTime', header: 'Entry Time', render: (log: any) => <span className="text-emerald-600 font-semibold">{log.entryTime}</span> },
              { key: 'exitTime', header: 'Exit Time', render: (log: any) => <span className="text-slate-500">{log.exitTime || 'Inside'}</span> },
              { key: 'gate', header: 'Gate & Verified By', render: (log: any) => <span className="text-slate-500">{log.gateName} ({log.checkedInByGuard})</span> },
              {
                key: 'status',
                header: 'Status',
                render: (log: any) => (
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    log.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.status}
                  </span>
                )
              }
            ]}
            data={attendanceLogs}
            keyExtractor={(log: any) => log.id}
            pageSize={10}
            mobileRender={(log: any) => (
              <MobileDataCard
                title={`${log.workerName} (${log.workerType})`}
                subtitle={`Household: ${log.flatCode || 'Multiple'} • Gate: ${log.gateName}`}
                status={
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    log.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.status}
                  </span>
                }
                attributes={[
                  { label: 'Entry Time', value: log.entryTime },
                  { label: 'Exit Time', value: log.exitTime || 'Inside Community' },
                  { label: 'Guard Verified', value: log.checkedInByGuard }
                ]}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

