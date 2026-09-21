import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Zap,
  ArrowUpRight,
  Wifi,
  Trash2,
  Sparkles,
  Waves,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Edit3,
  History,
  Radio,
  Cpu,
  X,
} from 'lucide-react';
import { societyOperationsService } from '../services/societyOperationsService';
import type { UtilityItem, OutageHistoryRecord, SocietyOperationsSummary, UtilityCategory, OperationsStatus } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

const CATEGORY_ICONS: Record<UtilityCategory, any> = {
  WATER: Droplet,
  POWER: Zap,
  LIFT: ArrowUpRight,
  EV: Zap,
  INTERNET: Wifi,
  GARBAGE: Trash2,
  CLEANING: Sparkles,
  SWIMMING_POOL: Waves,
  COMMON_AREAS: Building2,
};

export const SocietyOperationsBoard: React.FC = () => {
  const { currentUser } = useAuth();
  const activeRole = (currentUser?.role || '').toLowerCase();
  const isAdminOrFacility = ['admin', 'secretary', 'facility_manager'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'LIVE_BOARD' | 'OUTAGE_HISTORY' | 'IOT_TERMINAL'>('LIVE_BOARD');
  const [summary, setSummary] = useState<SocietyOperationsSummary>(() => societyOperationsService.getSummary());
  const [utilities, setUtilities] = useState<UtilityItem[]>(() => societyOperationsService.getUtilities());
  const [outages, setOutages] = useState<OutageHistoryRecord[]>(() => societyOperationsService.getOutageHistory());

  const [selectedUtility, setSelectedUtility] = useState<UtilityItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Update Form
  const [updateStatus, setUpdateStatus] = useState<OperationsStatus>('NORMAL');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateMetric, setUpdateMetric] = useState('');

  // IoT Simulator Form
  const [iotForm, setIotForm] = useState({
    category: 'WATER' as UtilityCategory,
    sensorId: 'SENSOR-WATER-TANK-01',
    metricValue: 'Water Level Critical (12% Drop)',
    suggestedStatus: 'DEGRADED' as OperationsStatus,
  });

  const loadData = () => {
    setSummary(societyOperationsService.getSummary());
    setUtilities(societyOperationsService.getUtilities());
    setOutages(societyOperationsService.getOutageHistory());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = realTimeSync.subscribe('UTILITY_STATUS_UPDATED', () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUtility) return;

    societyOperationsService.updateUtilityStatus(
      selectedUtility.id,
      updateStatus,
      updateNotes,
      updateMetric,
      currentUser?.name || 'Facility Manager'
    );

    setIsUpdateModalOpen(false);
    loadData();
    alert('Operations Board status updated in real-time across society dashboards.');
  };

  const handleSimulateIoT = (e: React.FormEvent) => {
    e.preventDefault();
    societyOperationsService.ingestIoTSensorPayload({
      sensorId: iotForm.sensorId,
      category: iotForm.category,
      metricValue: iotForm.metricValue,
      suggestedStatus: iotForm.suggestedStatus,
      rawPayload: { sensorId: iotForm.sensorId, timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });

    loadData();
    alert(`IoT Sensor Payload [${iotForm.sensorId}] ingested! Operations status updated.`);
  };

  const getStatusBadge = (status: OperationsStatus) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
            <CheckCircle2 size={13} /> NORMAL
          </span>
        );
      case 'RESTORED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
            <CheckCircle2 size={13} /> RESTORED
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
            <AlertTriangle size={13} /> DEGRADED
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-full flex items-center gap-1">
            <Clock size={13} /> MAINTENANCE
          </span>
        );
      case 'OUTAGE':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full flex items-center gap-1 animate-pulse">
            <XCircle size={13} /> OUTAGE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div
        className="text-white rounded-2xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)' }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Radio size={24} className="animate-pulse" />
            </span>
            <h2 className="text-xl font-bold">Society Operations Centre & Live Utility Health Board</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Live status board for 9 key utility categories with real-time resident streams & IoT event mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md border border-slate-700"
          >
            <RefreshCw size={14} /> Refresh Live Stream
          </button>
        </div>
      </div>

      {/* Operations Uptime Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Uptime</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">{summary.overallUptimePercent}%</span>
            <span className="text-xs font-medium text-emerald-600">Health Index</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                summary.overallUptimePercent >= 90
                  ? 'bg-emerald-500'
                  : summary.overallUptimePercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${summary.overallUptimePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Normal Operational</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600">{summary.normalCount} / {summary.totalUtilities}</span>
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">100% Functional</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Outages</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-rose-600">{summary.outageCount}</span>
            <XCircle size={22} className="text-rose-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Critical attention needed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Degraded / Reduced</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">{summary.degradedCount}</span>
            <AlertTriangle size={22} className="text-amber-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Partial service active</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Maintenance</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-blue-600">{summary.maintenanceCount}</span>
            <Clock size={22} className="text-blue-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Planned servicing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 bg-white px-4 rounded-xl shadow-sm overflow-x-auto">
        {[
          { key: 'LIVE_BOARD', label: 'Live Status Board (9 Categories)', icon: Radio },
          { key: 'OUTAGE_HISTORY', label: `Outage & Downtime Audit Log (${outages.length})`, icon: History },
          { key: 'IOT_TERMINAL', label: 'IoT Sensor Event Pipeline', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 font-semibold text-xs md:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-[#176B91] text-[#176B91]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: LIVE BOARD */}
      {activeTab === 'LIVE_BOARD' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {utilities.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] || Building2;
            return (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                      <Icon size={20} />
                    </span>
                    {getStatusBadge(item.currentStatus)}
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                  <p className="text-xs text-slate-500">{item.location}</p>

                  {item.metricValue && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs text-indigo-700 font-semibold">
                      {item.metricValue}
                    </div>
                  )}

                  {item.notes && <p className="text-xs text-slate-600 italic">"{item.notes}"</p>}
                </div>

                <div className="pt-3 border-t flex justify-between items-center text-[11px] text-slate-400">
                  <span>Updated: {new Date(item.updatedAt).toLocaleTimeString()}</span>
                  {isAdminOrFacility && (
                    <button
                      onClick={() => {
                        setSelectedUtility(item);
                        setUpdateStatus(item.currentStatus);
                        setUpdateNotes(item.notes || '');
                        setUpdateMetric(item.metricValue || '');
                        setIsUpdateModalOpen(true);
                      }}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Edit3 size={13} /> Update Status
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: OUTAGE HISTORY */}
      {activeTab === 'OUTAGE_HISTORY' && (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Historical Outage & Downtime Audit Trail</h3>
            <p className="text-xs text-slate-500">Record of unscheduled interruptions, cause analysis, and restoration durations.</p>
          </div>

          <div className="space-y-3">
            {outages.map((outage) => (
              <div key={outage.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-indigo-600 font-mono">{outage.category} - {outage.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${outage.status === 'RESTORED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {outage.status}
                  </span>
                </div>

                <p className="text-slate-800">{outage.causeNotes}</p>

                <div className="flex flex-wrap gap-4 text-slate-500 text-[11px] pt-1">
                  <span>Start: {new Date(outage.startTime).toLocaleString()}</span>
                  {outage.endTime && <span>Restored: {new Date(outage.endTime).toLocaleString()}</span>}
                  {outage.durationMinutes && (
                    <span className="font-semibold text-slate-700">Duration: {outage.durationMinutes} Minutes</span>
                  )}
                  {outage.resolvedBy && <span>Resolved By: {outage.resolvedBy}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: IOT TERMINAL */}
      {activeTab === 'IOT_TERMINAL' && (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">IoT Sensor Event Simulation Terminal</h3>
            <p className="text-xs text-slate-500">
              Simulate sensor payloads (Water Level Drop, Power Grid Fluctuation) mapping into the exact same data model.
            </p>
          </div>

          <form onSubmit={handleSimulateIoT} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Utility Category</label>
              <select
                value={iotForm.category}
                onChange={(e) => setIotForm({ ...iotForm, category: e.target.value as UtilityCategory })}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
              >
                <option value="WATER">WATER</option>
                <option value="POWER">POWER</option>
                <option value="LIFT">LIFT</option>
                <option value="EV">EV</option>
                <option value="INTERNET">INTERNET</option>
                <option value="SWIMMING_POOL">SWIMMING_POOL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sensor Hardware ID</label>
              <input
                type="text"
                required
                value={iotForm.sensorId}
                onChange={(e) => setIotForm({ ...iotForm, sensorId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sensor Metric Reading</label>
              <input
                type="text"
                required
                value={iotForm.metricValue}
                onChange={(e) => setIotForm({ ...iotForm, metricValue: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mapped Operations Status</label>
              <select
                value={iotForm.suggestedStatus}
                onChange={(e) => setIotForm({ ...iotForm, suggestedStatus: e.target.value as OperationsStatus })}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="DEGRADED">DEGRADED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OUTAGE">OUTAGE</option>
                <option value="RESTORED">RESTORED</option>
              </select>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2"
              >
                <Cpu size={15} /> Ingest Sensor Payload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Update Status */}
      {isUpdateModalOpen && selectedUtility && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Update Status: {selectedUtility.name}</h3>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as OperationsStatus)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
                >
                  <option value="NORMAL">NORMAL (100% Functional)</option>
                  <option value="RESTORED">RESTORED (Service Resumed)</option>
                  <option value="DEGRADED">DEGRADED (Reduced Capacity)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Scheduled Servicing)</option>
                  <option value="OUTAGE">OUTAGE (Critical Service Loss)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Metric Value / Meter Reading</label>
                <input
                  type="text"
                  placeholder="e.g. Tank 85% Full (120,000L)"
                  value={updateMetric}
                  onChange={(e) => setUpdateMetric(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Notes / Cause</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Servicing completed by Otis engineers."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-md hover:opacity-95"
                  style={{ background: 'var(--aarizo-blue, #176B91)' }}
                >
                  Broadcast Live Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



