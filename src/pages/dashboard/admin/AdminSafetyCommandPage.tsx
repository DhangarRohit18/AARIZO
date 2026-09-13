import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { safetyCommandService } from '../../../services/safetyCommandService';
import type { EmergencyIncident } from '../../../types/safetyCommand';
import { Modal } from '../../../components/ui/Modal';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Archive
} from 'lucide-react';

export const AdminSafetyCommandPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const adminName = currentUser?.name || 'Society Admin';

  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    setIncidents(safetyCommandService.getIncidents(societyId));
  };

  const handleCloseIncident = (incidentId: string) => {
    safetyCommandService.closeIncident(societyId, incidentId, adminName);
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(null);
    }
    loadData();
  };

  const filteredIncidents = incidents.filter(i => {
    if (statusFilter === 'ACTIVE') return i.status === 'TRIGGERED' || i.status === 'ACKNOWLEDGED' || i.status === 'RESPONDING';
    if (statusFilter === 'RESOLVED') return i.status === 'RESOLVED';
    if (statusFilter === 'CLOSED') return i.status === 'CLOSED';
    return true;
  });

  const activeCount = incidents.filter(i => i.status === 'TRIGGERED' || i.status === 'ACKNOWLEDGED' || i.status === 'RESPONDING').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Safety Command Center & Audit Control</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Society emergency oversight dashboard, responder assignment, timeline audit logs, and incident closure.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Active Emergencies</span>
            <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Resolved Incidents</span>
            <span className="text-2xl font-bold text-slate-900">{resolvedCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Total Recorded Incidents</span>
            <span className="text-2xl font-bold text-slate-900">{incidents.length}</span>
          </div>
        </div>
      </div>

      {/* Main Table & Filter */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Emergency Incident History & Audit Logs</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded-xl"
            >
              <option value="ALL">All Incidents</option>
              <option value="ACTIVE">Active Only</option>
              <option value="RESOLVED">Resolved Only</option>
              <option value="CLOSED">Closed / Archived</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Emergency Type</th>
                <th className="p-3">Reported By</th>
                <th className="p-3">Location</th>
                <th className="p-3">Triggered Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">No emergency incidents found</td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{inc.incidentNumber}</td>
                    <td className="p-3">{inc.type.replace(/_/g, ' ')}</td>
                    <td className="p-3">{inc.reportedByName} ({inc.flatNumber})</td>
                    <td className="p-3">{inc.locationDetails}</td>
                    <td className="p-3">{new Date(inc.triggeredAt).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                        inc.status === 'TRIGGERED' ? 'bg-rose-600 text-white' :
                        inc.status === 'ACKNOWLEDGED' ? 'bg-amber-500 text-white' :
                        inc.status === 'RESPONDING' ? 'bg-indigo-600 text-white' :
                        inc.status === 'RESOLVED' ? 'bg-emerald-600 text-white' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-3 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Audit Timeline
                      </button>
                      {inc.status === 'RESOLVED' && (
                        <button
                          onClick={() => handleCloseIncident(inc.id)}
                          className="px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-900 text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          <Archive className="w-3.5 h-3.5" /> Close & Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Incident Audit Timeline Viewer */}
      {selectedIncident && (
        <Modal isOpen={!!selectedIncident} onClose={() => setSelectedIncident(null)} title={`Incident Audit Trail: ${selectedIncident.incidentNumber}`}>
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 p-4 rounded-xl border text-xs space-y-1 text-slate-700">
              <p><strong>Emergency Category:</strong> {selectedIncident.type.replace(/_/g, ' ')}</p>
              <p><strong>Location:</strong> {selectedIncident.locationDetails} ({selectedIncident.tower})</p>
              <p><strong>Reported By:</strong> {selectedIncident.reportedByName} (Flat {selectedIncident.flatNumber}) • Phone: {selectedIncident.reportedByPhone}</p>
              {selectedIncident.assignedResponderName && (
                <p><strong>Assigned Responder:</strong> {selectedIncident.assignedResponderName}</p>
              )}
            </div>

            <h4 className="font-bold text-slate-900 text-sm pt-2">Step-by-Step Incident Lifecycle Timeline:</h4>

            <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 ml-2">
              {selectedIncident.timeline.map(t => (
                <div key={t.id} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-white" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">{t.status}</span>
                    <span className="text-slate-500 ml-2">by {t.actorName} ({t.actorRole})</span>
                    <span className="text-slate-400 block text-[11px]">{new Date(t.timestamp).toLocaleString()}</span>
                    {t.note && <p className="mt-1 bg-white p-2 border rounded-lg text-slate-700 font-mono text-[11px]">{t.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            {selectedIncident.status === 'RESOLVED' && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => handleCloseIncident(selectedIncident.id)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Archive className="w-4 h-4" /> Close & Archive Incident
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
