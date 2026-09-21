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
  const societyId = (currentUser as any)?.societyId || 'soc-gvs';
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
    <div style={{ padding: '1rem', paddingBottom: '6rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* High Priority Active Alarm Header */}
      {incidents.some(i => i.status === 'TRIGGERED') && (
        <div
          style={{
            background: 'var(--aarizo-danger, #D9535B)',
            color: '#FFFFFF',
            padding: '1rem 1.25rem',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(217, 83, 91, 0.3)',
            border: '2px solid #ff8a90',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
          className="animate-pulse"
        >
          <Siren size={28} style={{ color: '#FFFFFF', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              🚨 NEW ACTIVE SOS PANIC ALARM!
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#ffe4e6', margin: '0.25rem 0 0', fontWeight: 600 }}>
              Immediate security gate dispatch required. Respond below.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.25rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '6px', background: 'rgba(255,255,255,0.12)', color: 'var(--aarizo-sky, #83CBEA)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <ShieldAlert size={20} />
            </span>
            <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.1875rem', margin: 0, letterSpacing: '-0.02em' }}>
              Security Gate Emergency Terminal
            </h1>
          </div>
          <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.75rem', margin: '0.375rem 0 0' }}>
            Real-time SOS panic monitoring, guard dispatch & incident resolution
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.6875rem',
              fontWeight: 800,
              background: activeTriggered.length > 0 ? 'var(--aarizo-danger, #D9535B)' : 'var(--aarizo-success, #3F8F58)',
              color: '#FFFFFF',
            }}
          >
            {activeTriggered.length} ACTIVE INCIDENTS
          </span>
        </div>
      </div>

      {/* Active Emergencies Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <AlertTriangle size={16} style={{ color: 'var(--aarizo-danger, #D9535B)' }} /> Active Emergency Incidents ({activeTriggered.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeTriggered.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                padding: '2.5rem 1rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
              }}
            >
              <CheckCircle2 size={36} style={{ color: 'var(--aarizo-success, #3F8F58)', margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--aarizo-navy, #083B56)' }}>All Clear</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-muted, #8B9AA5)', margin: '0.25rem 0 0' }}>
                No active panic SOS alarms reported in the society.
              </p>
            </div>
          ) : (
            activeTriggered.map((inc) => (
              <div
                key={inc.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: inc.status === 'TRIGGERED' ? '2px solid var(--aarizo-danger, #D9535B)' : '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  padding: '1rem 1.25rem',
                  boxShadow: '0 2px 10px rgba(8, 59, 86, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, fontFamily: 'monospace', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--aarizo-light-blue, #EAF6FC)', color: 'var(--aarizo-blue, #176B91)' }}>
                      {inc.incidentNumber}
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.625rem',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        borderRadius: '9999px',
                        background:
                          inc.status === 'TRIGGERED'
                            ? 'var(--aarizo-danger, #D9535B)'
                            : inc.status === 'ACKNOWLEDGED'
                            ? 'var(--aarizo-warning, #D99A2B)'
                            : 'var(--aarizo-blue, #176B91)',
                        color: '#FFFFFF',
                      }}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: '0 0 0.25rem 0' }}>
                    {inc.type.replace(/_/g, ' ')}
                  </h3>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--aarizo-text-secondary, #657785)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                    <MapPin size={14} style={{ color: 'var(--aarizo-danger, #D9535B)' }} /> {inc.locationDetails} ({inc.tower})
                  </p>

                  <div
                    style={{
                      marginTop: '0.625rem',
                      background: 'var(--aarizo-pale-blue, #F4FAFE)',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                      fontSize: '0.75rem',
                      color: 'var(--aarizo-text, #203746)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div><strong>Reported By:</strong> {inc.reportedByName} (Flat {inc.flatNumber})</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--aarizo-blue, #176B91)', fontWeight: 700 }}>
                      <PhoneCall size={13} /> {inc.reportedByPhone}
                    </div>
                    {inc.description && <div style={{ fontStyle: 'italic', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>"{inc.description}"</div>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--aarizo-border-soft, #E8F1F5)' }}>
                  {inc.status === 'TRIGGERED' && (
                    <button
                      onClick={() => handleAcknowledge(inc.id)}
                      style={{
                        flex: 1,
                        padding: '0.625rem',
                        background: 'var(--aarizo-warning, #D99A2B)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={14} /> Acknowledge Alarm
                    </button>
                  )}

                  {(inc.status === 'TRIGGERED' || inc.status === 'ACKNOWLEDGED') && (
                    <button
                      onClick={() => {
                        setSelectedIncident(inc);
                        setShowRespondModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.625rem',
                        background: 'var(--aarizo-blue, #176B91)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Play size={14} /> Dispatch Responder
                    </button>
                  )}

                  {inc.status === 'RESPONDING' && (
                    <button
                      onClick={() => {
                        setSelectedIncident(inc);
                        setShowResolveModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        background: 'var(--aarizo-success, #3F8F58)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={14} /> Mark Incident Resolved
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
              <button type="button" onClick={() => setShowRespondModal(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--aarizo-border, #DCE8EF)', borderRadius: '10px', background: '#FFFFFF', color: 'var(--aarizo-text-secondary, #657785)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '0.5rem 1.25rem', background: 'var(--aarizo-blue, #176B91)', color: '#FFFFFF', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Confirm Dispatch</button>
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
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}
                className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: '#059669', color: '#FFFFFF' }}
                className="px-4 py-2 font-bold text-sm rounded-lg hover:opacity-95 transition shadow-sm"
              >
                Mark Incident Resolved
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

