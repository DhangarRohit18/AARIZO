import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { guestStayService } from '../../../services/guestStayService';
import type { GuestReservation } from '../../../types/guestStay';
import {
  Hotel,
  QrCode,
  CheckCircle2,
  XCircle,
  UserCheck
} from 'lucide-react';

export const GuestStayScannerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';

  const [qrInput, setQrInput] = useState('');
  const [activeReservations, setActiveReservations] = useState<GuestReservation[]>([]);

  // Scan Validation Result
  const [scanResult, setScanResult] = useState<{
    scanned: boolean;
    allowed: boolean;
    message: string;
    reservation?: GuestReservation;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    setActiveReservations(guestStayService.getReservations(societyId));
  };

  const handleScanQR = (codeStr: string) => {
    if (!codeStr.trim()) return;

    const res = guestStayService.verifyGuestQRAndCheckIn(societyId, codeStr.trim());
    setScanResult({
      scanned: true,
      allowed: res.allowed,
      message: res.message,
      reservation: res.reservation
    });
    setQrInput('');
    loadData();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Hotel className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Guest Accommodation Gate Scanner</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Scan Guest Access QR passes, verify guest ID proof against room assignment, and log check-in/check-out entry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scanner Terminal */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Terminal Box */}
          <div className="bg-slate-900 text-white p-4 md:p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" /> Guest Pass QR Scanner Terminal
              </h2>
              <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                Gate Terminal Ready
              </span>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleScanQR(qrInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Scan or Enter Guest QR Code (e.g. GUEST-QR-8801-ROYAL)"
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
              >
                Scan Pass
              </button>
            </form>

            {/* Quick Demo Passes */}
            {activeReservations.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Active Guest QR Passes (Click to test check-in/out):</span>
                <div className="flex flex-wrap gap-2">
                  {activeReservations.slice(0, 4).map(resv => (
                    <button
                      key={resv.id}
                      onClick={() => handleScanQR(resv.qrCode)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-indigo-300 font-mono"
                    >
                      {resv.primaryGuestName} (Room {resv.roomNumber})
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
                    {scanResult.allowed ? 'VERIFICATION SUCCESSFUL' : 'ENTRY DENIED / BLOCKED'}
                  </h3>
                  <p className="text-sm font-medium">{scanResult.message}</p>

                  {scanResult.reservation && (
                    <div className="mt-3 p-4 bg-white/80 rounded-xl border text-xs text-slate-800 space-y-1">
                      <p><strong>Primary Guest:</strong> {scanResult.reservation.primaryGuestName} ({scanResult.reservation.primaryGuestPhone})</p>
                      <p><strong>ID Proof:</strong> {scanResult.reservation.idProofType} ({scanResult.reservation.idProofNumber})</p>
                      <p><strong>Assigned Suite:</strong> {scanResult.reservation.roomName} (Room #{scanResult.reservation.roomNumber})</p>
                      <p><strong>Resident Host:</strong> {scanResult.reservation.residentName} (Flat {scanResult.reservation.flatNumber})</p>
                      <p><strong>Stay Dates:</strong> {scanResult.reservation.checkInDate} to {scanResult.reservation.checkOutDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Guest Stays */}
        <div className="space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" /> Currently Checked-In Guest Stays
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {activeReservations.filter(r => r.status === 'CHECKED_IN').length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No guests currently checked-in</p>
              ) : (
                activeReservations.filter(r => r.status === 'CHECKED_IN').map(resv => (
                  <div key={resv.id} className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Room #{resv.roomNumber} â€” {resv.primaryGuestName}</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full">CHECKED IN</span>
                    </div>
                    <p className="text-slate-500">Resident Host: {resv.residentName} ({resv.flatNumber})</p>
                    <p className="text-slate-400 text-[11px]">Checkout Due: {resv.checkOutDate}</p>
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

