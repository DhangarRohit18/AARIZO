import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { safetyCommandService } from '../../../services/safetyCommandService';
import type { EmergencyIncident, EmergencyType, SocietyEmergencyContact } from '../../../types/safetyCommand';
import { Modal } from '../../../components/ui/Modal';
import {
  Siren,
  PhoneCall,
  ShieldAlert,
  Flame,
  Stethoscope,
  Lock,
  UserX,
  Droplet,
  Zap,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const EMERGENCY_TYPES: { type: EmergencyType; label: string; icon: any; color: string }[] = [
  { type: 'MEDICAL', label: 'Medical Emergency', icon: Stethoscope, color: 'bg-rose-600 hover:bg-rose-700 text-white' },
  { type: 'FIRE', label: 'Fire Emergency', icon: Flame, color: 'bg-amber-600 hover:bg-amber-700 text-white' },
  { type: 'SECURITY_THREAT', label: 'Security Threat / Intruder', icon: ShieldAlert, color: 'bg-red-700 hover:bg-red-800 text-white' },
  { type: 'SUSPICIOUS_PERSON', label: 'Suspicious Person', icon: UserX, color: 'bg-orange-600 hover:bg-orange-700 text-white' },
  { type: 'LIFT_EMERGENCY', label: 'Stuck in Lift', icon: Lock, color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  { type: 'CHILD_SAFETY', label: 'Child Safety Issue', icon: Siren, color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  { type: 'ELECTRICAL', label: 'Electrical Short Circuit', icon: Zap, color: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
  { type: 'WATER_LEAKAGE', label: 'Major Water Burst', icon: Droplet, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { type: 'OTHER', label: 'Other General SOS', icon: HelpCircle, color: 'bg-slate-700 hover:bg-slate-800 text-white' }
];

export const ResidentEmergencyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const residentName = currentUser?.name || 'Resident';
  const flatNumber = (currentUser as any)?.flatDetails || 'A-101';
  const phone = currentUser?.phone || '+91 98765 43210';

  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [contacts, setContacts] = useState<SocietyEmergencyContact[]>([]);
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);

  // Form State
  const [tower, setTower] = useState('Tower A');
  const [locationDetails, setLocationDetails] = useState(`Flat ${flatNumber}`);
  const [description, setDescription] = useState('');

  const [sosSuccess, setSosSuccess] = useState<EmergencyIncident | null>(null);

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    const list = safetyCommandService.getIncidents(societyId).filter(i => i.reportedByUserId === currentUser?.id || i.flatNumber === flatNumber);
    setIncidents(list);
    setContacts(safetyCommandService.getEmergencyContacts());
  };

  const handleTriggerSOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const newInc = safetyCommandService.triggerSOS(
      societyId,
      selectedType,
      flatNumber,
      tower,
      locationDetails,
      currentUser?.id || 'res-1',
      residentName,
      phone,
      description
    );

    setSosSuccess(newInc);
    setSelectedType(null);
    setDescription('');
    loadData();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Panic SOS Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <Siren className="w-6 h-6 text-white animate-pulse" />
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider">PANIC SOS EMERGENCY BUTTON</h1>
          </div>
          <p className="text-rose-100 text-sm mt-1">
            Tap any emergency type below to instantly dispatch Main Gate Security & Society Command Desk to your exact location.
          </p>
        </div>
      </div>

      {/* SOS Success Modal Banner */}
      {sosSuccess && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 rounded-2xl shadow-lg flex items-start justify-between gap-4 animate-bounce">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-lg">EMERGENCY SOS DISPATCHED ({sosSuccess.incidentNumber})</h3>
              <p className="text-xs font-semibold text-emerald-800 mt-1">
                Society Security Desk has been alerted for {sosSuccess.type.replace(/_/g, ' ')} at {sosSuccess.locationDetails}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSosSuccess(null)}
            className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Emergency Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" /> Choose Emergency Type & Trigger SOS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMERGENCY_TYPES.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => {
                  setSelectedType(item.type);
                  setLocationDetails(`Flat ${flatNumber}`);
                }}
                className={`p-5 rounded-2xl shadow-md transition-all flex items-center gap-4 text-left border ${item.color}`}
              >
                <div className="p-3 rounded-xl bg-white/20 shrink-0">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-snug">{item.label}</h3>
                  <span className="text-xs text-white/80 font-medium mt-0.5 block">Tap to trigger SOS</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column: Active & Historical Triggered Emergencies */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> My Active & Past SOS Incidents
          </h2>

          <div className="space-y-3">
            {incidents.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-slate-400 text-xs">
                No active or past emergency incidents logged for Flat {flatNumber}.
              </div>
            ) : (
              incidents.map(inc => (
                <div key={inc.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-lg">
                        {inc.incidentNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{inc.type.replace(/_/g, ' ')}</h3>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
                      inc.status === 'TRIGGERED' ? 'bg-rose-600 text-white animate-pulse' :
                      inc.status === 'ACKNOWLEDGED' ? 'bg-amber-500 text-white' :
                      inc.status === 'RESPONDING' ? 'bg-indigo-600 text-white' :
                      inc.status === 'RESOLVED' ? 'bg-emerald-600 text-white' :
                      'bg-slate-600 text-white'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">Location: <strong>{inc.locationDetails} ({inc.tower})</strong></p>
                  {inc.assignedResponderName && (
                    <p className="text-xs text-indigo-700 font-semibold">Assigned Responder: {inc.assignedResponderName}</p>
                  )}

                  {/* Incident Timeline Snippet */}
                  <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Incident Timeline Log:</span>
                    {inc.timeline.map(t => (
                      <div key={t.id} className="text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-800">{t.status}</span> by {t.actorName} ({t.actorRole}) - {new Date(t.timestamp).toLocaleTimeString()}
                        {t.note && <span className="italic block text-slate-500">{t.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Speed Dial Emergency Contacts */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" /> Direct Emergency Directory
          </h2>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            {contacts.map(c => (
              <a
                key={c.id}
                href={`tel:${c.phone}`}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between block"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                  <p className="text-[11px] text-slate-500">{c.role}</p>
                </div>
                <span className="px-3 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-lg flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" /> {c.phone}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Confirm SOS Trigger Form */}
      {selectedType && (
        <Modal isOpen={!!selectedType} onClose={() => setSelectedType(null)} title={`Confirm SOS: ${selectedType.replace(/_/g, ' ')}`}>
          <form onSubmit={handleTriggerSOS} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <Siren className="w-5 h-5 text-rose-600 shrink-0" />
              <span>This will broadcast an <strong>IMMEDIATE EMERGENCY SOS ALARM</strong> to Security Gate Control and Admin.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tower</label>
                <input
                  type="text"
                  required
                  value={tower}
                  onChange={e => setTower(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat A-101, Basement 2 Parking, Lift B"
                  value={locationDetails}
                  onChange={e => setLocationDetails(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Details (Optional)</label>
              <textarea
                rows={2}
                placeholder="Describe situation..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedType(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2">
                <Siren className="w-4 h-4 animate-bounce" /> CONFIRM & DISPATCH SOS NOW
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
