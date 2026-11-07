import React, { useState } from 'react';
import { AlertTriangle, Flame, HeartPulse, ShieldAlert, PhoneCall, CheckCircle2 } from 'lucide-react';

export const UnifiedEmergencyHub: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);

  const emergencyCategories = [
    {
      id: 'MEDICAL',
      title: 'Medical Emergency',
      subtext: 'Dispatches society on-duty first responder & ambulance',
      icon: <HeartPulse size={32} className="text-rose-500" />,
      color: 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500',
      phone: '108',
    },
    {
      id: 'FIRE',
      title: 'Fire Outbreak',
      subtext: 'Triggers gate alarm, activates emergency water booster pumps',
      icon: <Flame size={32} className="text-orange-500" />,
      color: 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500',
      phone: '101',
    },
    {
      id: 'SECURITY',
      title: 'Security / Intruder Alert',
      subtext: 'Instant gate lockdown alert to all on-duty security guards',
      icon: <ShieldAlert size={32} className="text-amber-500" />,
      color: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500',
      phone: '112',
    },
    {
      id: 'SENIOR_ASSIST',
      title: 'Senior Citizen Assistance',
      subtext: 'Priority help for elderly residents (mobility/medicines)',
      icon: <AlertTriangle size={32} className="text-blue-500" />,
      color: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500',
      phone: 'Security Desk',
    },
  ];

  const handleTriggerAlert = (category: string) => {
    setIsAlerting(true);
    setTimeout(() => {
      setActiveAlert(category);
      setIsAlerting(false);
    }, 600);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-black rounded-3xl p-6 text-white border border-rose-900/60 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600/30 text-rose-400 rounded-2xl animate-pulse">
            <AlertTriangle size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Unified Society Emergency Hub</h1>
            <p className="text-sm text-rose-200">
              One-tap priority emergency response with automated gate guard dispatch
            </p>
          </div>
        </div>
      </div>

      {activeAlert && (
        <div className="p-5 bg-rose-950/60 border-2 border-rose-500 rounded-2xl text-white shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} className="text-rose-400 flex-shrink-0 animate-ping" />
            <div>
              <div className="font-bold text-base text-rose-300">
                Active SOS Broadcast: {activeAlert}
              </div>
              <div className="text-xs text-slate-300">
                Security Main Gate and Facility Manager received urgent response notification.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl"
          >
            Acknowledge / Stand Down
          </button>
        </div>
      )}

      {/* Grid of Emergency Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {emergencyCategories.map((cat) => (
          <div
            key={cat.id}
            className={`p-6 rounded-2xl border text-white transition shadow-lg flex flex-col justify-between ${cat.color} bg-slate-900`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {cat.icon}
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1 bg-slate-950/70 px-2 py-1 rounded-lg">
                  <PhoneCall size={12} /> {cat.phone}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold">{cat.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{cat.subtext}</p>
              </div>
            </div>

            <button
              onClick={() => handleTriggerAlert(cat.title)}
              disabled={isAlerting}
              className="mt-5 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-600/30 uppercase tracking-wider"
            >
              {isAlerting ? 'Broadcasting...' : `Trigger ${cat.id} SOS`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
