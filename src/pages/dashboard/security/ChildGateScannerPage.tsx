import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { childSafetyService } from '../../../services/childSafetyService';
import type { ChildProfile, ChildPickupQR, PickupLog, ChildSafetyAlert } from '../../../types/childSafety';
import {
  QrCode,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  UserCheck
} from 'lucide-react';

export const ChildGateScannerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';

  const [qrInput, setQrInput] = useState('');

  const [activeAlerts, setActiveAlerts] = useState<ChildSafetyAlert[]>([]);
  const [activeQRs, setActiveQRs] = useState<ChildPickupQR[]>([]);
  const [pickupLogs, setPickupLogs] = useState<PickupLog[]>([]);

  // Scan Validation Result
  const [scanResult, setScanResult] = useState<{
    scanned: boolean;
    allowed: boolean;
    message: string;
    child?: ChildProfile;
    pickupPersonName?: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    setActiveAlerts(childSafetyService.getSafetyAlerts(societyId).filter(a => a.status === 'ACTIVE'));
    setActiveQRs(childSafetyService.getPickupQRs(societyId));
    setPickupLogs(childSafetyService.getPickupLogs(societyId));
  };

  const handleScanQR = (codeStr: string) => {
    if (!codeStr.trim()) return;

    const res = childSafetyService.verifyAndScanChildPickup(societyId, codeStr.trim());
    setScanResult({
      scanned: true,
      allowed: res.allowed,
      message: res.message,
      child: res.child,
      pickupPersonName: res.pickupPersonName
    });
    setQrInput('');
    loadData();
  };

  const handleResolveAlert = (alertId: string) => {
    childSafetyService.resolveSafetyAlert(societyId, alertId, currentUser?.name || 'Security Guard');
    loadData();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Active Missing Child Critical Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-600 text-white p-5 rounded-2xl shadow-lg border-2 border-rose-400 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-8 h-8 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide uppercase">🚨 CRITICAL MISSING CHILD LOCKDOWN ACTIVE</h2>
              <div className="mt-1 space-y-1 text-sm font-medium">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center gap-2">
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleResolveAlert(activeAlerts[0].id)}
            className="px-4 py-2 bg-white text-rose-700 font-extrabold text-xs rounded-xl shadow hover:bg-rose-50 shrink-0"
          >
            Mark Child Safe / Resolve Alert
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Child Security & Gate Scanner</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Scan Child Pickup QR gate passes, verify authorized pickup caretakers, and enforce missing child gate lockdowns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Scanner Terminal */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Terminal Box */}
          <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" /> Security Gate Scanner Terminal
              </h2>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                Gate Terminal Active
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Scan barcode/QR code from caretaker's mobile or paste QR code string below to verify pickup permission.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleScanQR(qrInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Scan or Enter QR Code (e.g. CP-QR-172...)"
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
              >
                Scan Pass
              </button>
            </form>

            {/* Quick Demo Passes Buttons */}
            {activeQRs.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Active Society QR Passes (Click to test scan):</span>
                <div className="flex flex-wrap gap-2">
                  {activeQRs.slice(0, 4).map(qr => (
                    <button
                      key={qr.id}
                      onClick={() => handleScanQR(qr.qrCode)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-indigo-300 font-mono"
                    >
                      {qr.childName} ({qr.pickupPersonName})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validation Result Box */}
          {scanResult && (
            <div className={`p-6 rounded-2xl border shadow-lg ${
              scanResult.allowed ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="flex items-start gap-4">
                {scanResult.allowed ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-10 h-10 text-rose-600 shrink-0" />
                )}
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold">
                    {scanResult.allowed ? '✅ PICKUP AUTHORIZED & PERMITTED' : '⛔ PICKUP DENIED / BLOCKED'}
                  </h3>
                  <p className="text-sm font-medium">{scanResult.message}</p>

                  {scanResult.child && (
                    <div className="mt-3 p-4 bg-white/80 rounded-xl border text-xs text-slate-800 space-y-1">
                      <p><strong>Child Name:</strong> {scanResult.child.fullName} (Flat {scanResult.child.flatNumber})</p>
                      <p><strong>Pickup Person:</strong> {scanResult.pickupPersonName || 'N/A'}</p>
                      <p><strong>Primary Guardian Phone:</strong> {scanResult.child.guardians[0]?.phone || 'N/A'}</p>
                      {scanResult.child.medicalNotes && (
                        <p className="text-rose-700"><strong>Medical Warning:</strong> {scanResult.child.medicalNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Gate Logs */}
        <div className="space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" /> Recent Gate Verification Logs
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {pickupLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent child pickup events recorded</p>
              ) : (
                pickupLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">{log.childName} (Flat {log.flatNumber})</strong>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        log.status === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-500">Caretaker: {log.pickupPersonName}</p>
                    <p className="text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()} • {log.gateId}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
