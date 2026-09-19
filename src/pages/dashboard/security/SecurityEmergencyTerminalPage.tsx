import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { safetyCommandService } from '../../../services/safetyCommandService';
import type { EmergencyIncident } from '../../../types/safetyCommand';
import { Modal } from '../../../components/ui/Modal';
import {
  Siren,
  ShieldAlert,
  CheckCircle2,
  PhoneCall,
  MapPin,
  AlertTriangle,
  Play
} from 'lucide-react';

export const SecurityEmergencyTerminalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const guardName = currentUser?.name || 'Security Guard Ramesh';

  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);

  // Response Form State
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [responderName, setResponderName] = useState(guardName);
  const [responseNote, setResponseNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [societyId]);

  const loadData = () => {
    const list = safetyCommandService.getIncidents(societyId);
    setIncidents(list);
  };

  const handleAcknowledge = (incidentId: string) => {
    safetyCommandService.acknowledgeIncident(societyId, incidentId, guardName);
    loadData();
  };

  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !responderName) return;

    safetyCommandService.respondIncident(
      societyId,
      selectedIncident.id,
      currentUser?.id || 'guard-1',
      responderName,
      guardName,
      responseNote
    );

    setShowRespondModal(false);
    setResponseNote('');
    setSelectedIncident(null);
    loadData();
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !resolutionNote) return;

    safetyCommandService.resolveIncident(societyId, selectedIncident.id, guardName, resolutionNote);
    setShowResolveModal(false);
    setResolutionNote('');
    setSelectedIncident(null);
    loadData();
  };

  const activeTriggered = incidents.filter(i => i.status === 'TRIGGERED' || i.status === 'ACKNOWLEDGED' || i.status === 'RESPONDING');

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* High Priority Active Alarm Header */}
      {incidents.some(i => i.status === 'TRIGGERED') && (
        <div className="bg-rose-600 text-white p-5 rounded-2xl shadow-xl border-2 border-rose-400 animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Siren className="w-8 h-8 text-white shrink-0 animate-bounce" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider">ðŸš¨ NEW UNACKNOWLEDGED SOS ALARM RECEIVED!</h2>
              <p className="text-xs text-rose-100 font-medium">Immediate security gate response required. Check active incident list below.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Security Gate Emergency Terminal</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Real-time SOS panic alarm monitoring, guard dispatch, and incident resolution portal.
          </p>
        </div>
      </div>

      {/* Active Emergencies Dashboard */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" /> Active Emergency Incidents ({activeTriggered.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTriggered.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              All quiet. No active panic SOS alarms reported in the society.
            </div>
          ) : (
            activeTriggered.map(inc => (
              <div
                key={inc.id}
                className={`bg-white p-4 md:p-6 rounded-2xl border shadow-md flex flex-col justify-between space-y-4 ${
                  inc.status === 'TRIGGERED' ? 'border-2 border-rose-500 bg-rose-50/30' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-extrabold text-xs rounded-lg">
                      {inc.incidentNumber}
                    </span>
                    <span className={`px-3 py-1 text-xs font-black rounded-full ${
                      inc.status === 'TRIGGERED' ? 'bg-rose-600 text-white animate-pulse' :
                      inc.status === 'ACKNOWLEDGED' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mt-3">{inc.type.replace(/_/g, ' ')}</h3>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-rose-500" /> {inc.locationDetails} ({inc.tower})
                  </p>

                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border text-xs text-slate-700 space-y-1">
                    <p><strong>Reported By:</strong> {inc.reportedByName} (Flat {inc.flatNumber})</p>
                    <p className="flex items-center gap-1 text-indigo-700 font-bold">
                      <PhoneCall className="w-3.5 h-3.5" /> {inc.reportedByPhone}
                    </p>
                    {inc.description && <p className="italic text-slate-500 mt-1">"{inc.description}"</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {inc.status === 'TRIGGERED' && (
                    <button
                      onClick={() => handleAcknowledge(inc.id)}
                      className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Acknowledge Alarm
                    </button>
                  )}

                  {(inc.status === 'TRIGGERED' || inc.status === 'ACKNOWLEDGED') && (
                    <button
                      onClick={() => {
                        setSelectedIncident(inc);
                        setShowRespondModal(true);
                      }}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" /> Dispatch Responder
                    </button>
                  )}

                  {inc.status === 'RESPONDING' && (
                    <button
                      onClick={() => {
                        setSelectedIncident(inc);
                        setShowResolveModal(true);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Incident Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Dispatch Responder */}
      {selectedIncident && showRespondModal && (
        <Modal isOpen={showRespondModal} onClose={() => setShowRespondModal(false)} title={`Dispatch Responder: ${selectedIncident.incidentNumber}`}>
          <form onSubmit={handleRespond} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Guard / Responder Name</label>
              <input
                type="text"
                required
                value={responderName}
                onChange={e => setResponderName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field Response Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Guard Ramesh dispatched to Lift B2 with master keys."
                value={responseNote}
                onChange={e => setResponseNote(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowRespondModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg">Confirm Dispatch</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Resolve Incident */}
      {selectedIncident && showResolveModal && (
        <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title={`Resolve Emergency: ${selectedIncident.incidentNumber}`}>
          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Summary & Action Taken</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Lift technician reset main circuit breaker. Passengers safely extracted."
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowResolveModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg">Mark Incident Resolved</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

