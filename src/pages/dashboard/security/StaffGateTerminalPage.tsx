import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle,
  XCircle,
  Shield,
  UserCheck,
  Search,
  Phone,
  FileCheck,
  UserX,
} from 'lucide-react';
import { staffService } from '../../../services/staffService';
import type { DomesticWorkerProfile, StaffAttendanceLog, AttendanceStatus } from '../../../types/staff';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const StaffGateTerminalPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const currentUser = { id: 'sec-guard-1', name: 'Officer Vikram Singh', role: 'SECURITY' };

  const [workers, setWorkers] = useState<DomesticWorkerProfile[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<StaffAttendanceLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<DomesticWorkerProfile | null>(null);
  const [scanResult, setScanResult] = useState<{ status: 'SUCCESS' | 'DENIED'; message: string } | null>(null);

  const reloadData = () => {
    const list = staffService.getWorkers(currentSocietyId);
    setWorkers(list);
    setAttendanceLogs(staffService.getAttendanceLogs(currentSocietyId));
    if (selectedWorker) {
      const updated = list.find((w: DomesticWorkerProfile) => w.id === selectedWorker.id);
      if (updated) setSelectedWorker(updated);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;

    const match = workers.find(
      (w: DomesticWorkerProfile) =>
        w.passCode.toLowerCase() === query.trim().toLowerCase() ||
        w.phone.includes(query.trim()) ||
        w.qrDataString.toLowerCase().includes(query.trim().toLowerCase()) ||
        w.name.toLowerCase().includes(query.trim().toLowerCase())
    );

    if (match) {
      setSelectedWorker(match);
      setScanResult(null);
    }
  };

  const handleEntry = (worker: DomesticWorkerProfile) => {
    try {
      const updated = staffService.scanWorkerEntry(worker.id, currentUser);
      if (updated) {
        setSelectedWorker(updated);
        setScanResult({
          status: 'SUCCESS',
          message: `ENTRY GRANTED: ${worker.name} (${worker.workerType}) checked IN successfully.`,
        });
        reloadData();
      }
    } catch (err: any) {
      setScanResult({
        status: 'DENIED',
        message: err.message || 'Entry Denied',
      });
    }
  };

  const handleExit = (worker: DomesticWorkerProfile) => {
    try {
      const updated = staffService.scanWorkerExit(worker.id, currentUser);
      if (updated) {
        setSelectedWorker(updated);
        setScanResult({
          status: 'SUCCESS',
          message: `EXIT RECORDED: ${worker.name} checked OUT successfully.`,
        });
        reloadData();
      }
    } catch (err: any) {
      setScanResult({
        status: 'DENIED',
        message: err.message || 'Exit recording failed',
      });
    }
  };

  const getAttendanceBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'IN':
        return <StatusBadge variant="success" label="IN SOCIETY" />;
      case 'OUT':
        return <StatusBadge variant="neutral" label="OUTSIDE" />;
      case 'LATE':
        return <StatusBadge variant="warning" label="LATE" />;
      case 'ABSENT':
        return <StatusBadge variant="danger" label="ABSENT" />;
      case 'SUSPENDED':
        return <StatusBadge variant="danger" label="SUSPENDED" />;
      default:
        return <StatusBadge variant="neutral" label={status} />;
    }
  };

  const filteredWorkers = workers.filter(
    (w: DomesticWorkerProfile) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.phone.includes(searchQuery) ||
      w.workerType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.assignedFlatCodes.some((f: string) => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Domestic Staff & Worker Security Scanner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verify staff QR codes, inspect background verification status, and log attendance entries/exits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
            Gate #1 Main Gate
          </span>
          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
            {currentUser.name}
          </span>
        </div>
      </div>

      {scanResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            scanResult.status === 'SUCCESS'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {scanResult.status === 'SUCCESS' ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-semibold text-sm">{scanResult.message}</span>
          </div>
          <button
            onClick={() => setScanResult(null)}
            className="text-xs font-semibold hover:underline opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Worker List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Search Worker / QR Scan</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Scan QR or search by code/phone/name..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredWorkers.map((w: DomesticWorkerProfile) => (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedWorker(w);
                    setScanResult(null);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedWorker?.id === w.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden shrink-0">
                      {w.photoUrl ? (
                        <img src={w.photoUrl} alt={w.name} className="w-full h-full object-cover" />
                      ) : (
                        w.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {w.name}
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                          {w.workerType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{w.phone}</span>
                        <span>•</span>
                        <span>Flats: {w.assignedFlatCodes.join(', ') || 'None'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">{getAttendanceBadge(w.attendanceStatus)}</div>
                </div>
              ))}

              {filteredWorkers.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">No domestic workers matched search.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Worker Pass Verification & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {selectedWorker ? (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Staff Gate Pass Verification</h2>
                  <p className="text-xs text-slate-500">Pass Code: {selectedWorker.passCode}</p>
                </div>
                <StatusBadge
                  variant={selectedWorker.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
                  label={selectedWorker.verificationStatus}
                />
              </div>

              {/* Profile Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border-2 border-indigo-500">
                    {selectedWorker.photoUrl ? (
                      <img src={selectedWorker.photoUrl} alt={selectedWorker.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xl">
                        {selectedWorker.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedWorker.name}
                      {getAttendanceBadge(selectedWorker.attendanceStatus)}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-semibold">
                        {selectedWorker.workerType}
                      </span>
                      <span>Phone: {selectedWorker.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <StatusBadge
                    variant={selectedWorker.accessStatus === 'ACTIVE' ? 'success' : 'danger'}
                    label={`ACCESS: ${selectedWorker.accessStatus}`}
                  />
                </div>
              </div>

              {selectedWorker.accessStatus !== 'ACTIVE' && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 flex items-center gap-3">
                  <UserX className="w-6 h-6 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">ACCESS RESTRICTED</div>
                    <div className="text-xs">
                      This worker is currently <strong>{selectedWorker.accessStatus}</strong>. Gate entry must be denied immediately.
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned Flats</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1">
                    {selectedWorker.assignedFlatCodes.length > 0
                      ? selectedWorker.assignedFlatCodes.join(', ')
                      : 'No flat assigned'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Emergency Contact</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedWorker.emergencyContactName} ({selectedWorker.emergencyContactPhone})
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Documents Status</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1 text-xs">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    {selectedWorker.documents.filter((d: { isVerified: boolean }) => d.isVerified).length} / {selectedWorker.documents.length} Verified
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Entry / Exit</span>
                  <div className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    <div>IN: {selectedWorker.lastEntryTime || 'N/A'}</div>
                    <div>OUT: {selectedWorker.lastExitTime || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Gate Entry / Exit Buttons */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Record Gate Attendance Action
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={selectedWorker.accessStatus !== 'ACTIVE'}
                    onClick={() => handleEntry(selectedWorker)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    <UserCheck className="w-5 h-5" />
                    ALLOW ENTRY (IN)
                  </button>
                  <button
                    onClick={() => handleExit(selectedWorker)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    <XCircle className="w-5 h-5" />
                    RECORD EXIT (OUT)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-500">
              <QrCode className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <div className="font-semibold text-slate-700 dark:text-slate-300">No Worker Selected</div>
              <div className="text-sm mt-1">Scan a worker QR code or select a profile from the left list.</div>
            </div>
          )}

          {/* Attendance Activity Log */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Recent Staff Gate Activity Log</h2>
            <div className="space-y-3">
              {attendanceLogs.slice(0, 5).map((log: StaffAttendanceLog) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    {log.action === 'IN' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {log.workerName} ({log.workerType})
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Scanned by {log.scannedBy}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge
                      variant={log.action === 'IN' ? 'success' : 'neutral'}
                      label={log.action}
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.timestamp}</div>
                  </div>
                </div>
              ))}

              {attendanceLogs.length === 0 && (
                <div className="text-center py-4 text-slate-500 text-sm">No gate activity logged today.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
