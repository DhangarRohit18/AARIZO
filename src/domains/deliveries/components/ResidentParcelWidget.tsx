import React, { useState, useEffect } from 'react';
import { Package, QrCode } from 'lucide-react';
import { parcelRoomService } from '../services/parcelRoomService';
import type { Parcel } from '../types';
import { realtimeService } from '../../../services/realtimeService';

export const ResidentParcelWidget: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedQrParcel, setSelectedQrParcel] = useState<Parcel | null>(null);

  const loadResidentParcels = () => {
    const list = parcelRoomService.getAllParcels('soc-gvs');
    // Filter for current resident (res-1 for Vikram Joshi)
    setParcels(list.filter((p) => p.residentId === 'res-1' || p.residentName.includes('Vikram')));
  };

  useEffect(() => {
    loadResidentParcels();

    // Real-Time subscription: Updates resident view when security receives/updates parcel without page refresh!
    const unsubscribe = realtimeService.subscribe('DELIVERY_STATUS', () => {
      loadResidentParcels();
    });

    return () => unsubscribe();
  }, []);

  const activeParcels = parcels.filter((p) => p.status !== 'COLLECTED');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <Package size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Parcel & Courier Room Pass</h3>
            <p className="text-[10px] text-slate-400">Live parcel status & pickup OTP/QR codes</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
          {activeParcels.length} Active Parcels
        </span>
      </div>

      {/* Active Parcels Section */}
      <div className="space-y-3">
        {activeParcels.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No active parcels awaiting pickup.</p>
        ) : (
          activeParcels.map((p) => (
            <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{p.courierCompany}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">{p.storageLocation}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Arrived {p.ageHours}h ago • Tracking #{p.trackingNumber}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block uppercase">Pickup OTP</span>
                  <span className="text-base font-extrabold text-amber-400 tracking-wider font-mono">{p.pickupOtp}</span>
                </div>
                <button
                  onClick={() => setSelectedQrParcel(p)}
                  className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg border border-emerald-500/30"
                  title="Show Digital QR Code"
                >
                  <QrCode size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Modal */}
      {selectedQrParcel && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 max-w-xs w-full text-center space-y-3">
            <h4 className="font-bold text-white text-sm">Gate Pickup Digital Pass</h4>
            <p className="text-xs text-slate-400">{selectedQrParcel.courierCompany} • {selectedQrParcel.storageLocation}</p>
            <div className="p-4 bg-white rounded-xl flex justify-center">
              <QrCode size={140} className="text-slate-950" />
            </div>
            <div className="p-2 bg-slate-950 rounded-lg">
              <span className="text-xs text-slate-400 block">SHOW OTP TO GUARD</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono tracking-widest">{selectedQrParcel.pickupOtp}</span>
            </div>
            <button
              onClick={() => setSelectedQrParcel(null)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
