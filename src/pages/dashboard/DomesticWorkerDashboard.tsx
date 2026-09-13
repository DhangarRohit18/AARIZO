import React, { useState } from 'react';
import {
  UserCheck,
  Home,
  QrCode,
} from 'lucide-react';

export const DomesticWorkerDashboard: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider bg-emerald-700 px-2.5 py-1 rounded-full text-emerald-100">
            Domestic Staff Pass
          </span>
          <h1 className="text-2xl font-extrabold mt-2">Sunita Devi</h1>
          <p className="text-emerald-100 text-xs mt-1">ID: DW-9042 • Society: Green Valley Society</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setIsCheckedIn(!isCheckedIn)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              isCheckedIn
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-white text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <UserCheck size={16} />
            {isCheckedIn ? 'Check-Out Gate Pass' : 'Gate Check-In'}
          </button>
          <span className="text-[10px] text-emerald-100">
            Gate Status: <strong className="text-white">{isCheckedIn ? 'INSIDE SOCIETY' : 'OUTSIDE'}</strong>
          </span>
        </div>
      </div>

      {/* QR Pass Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Gate Entry QR Pass</h3>
        <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
          <QrCode size={120} className="text-slate-800" />
        </div>
        <p className="text-xs text-slate-500">Show this QR code at Security Gate for instant touchless verification</p>
      </div>

      {/* Assigned Households */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Home size={18} className="text-emerald-600" /> Assigned Households (3)
          </h3>
          <span className="text-xs text-slate-500">Today's Schedule</span>
        </div>

        <div className="space-y-3">
          {[
            { flat: 'Flat B-1204', owner: 'Vikram Joshi', time: '08:00 AM - 10:00 AM', status: 'COMPLETED' },
            { flat: 'Flat A-402', owner: 'Ananya Roy', time: '10:30 AM - 12:00 PM', status: 'IN_PROGRESS' },
            { flat: 'Flat C-301', owner: 'Mayuri Udar', time: '04:00 PM - 05:30 PM', status: 'SCHEDULED' },
          ].map((h, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{h.flat}</h4>
                <p className="text-xs text-slate-500">{h.owner} • {h.time}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                h.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                h.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {h.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
