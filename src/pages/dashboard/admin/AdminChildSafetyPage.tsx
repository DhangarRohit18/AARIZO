import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { childSafetyService } from '../../../services/childSafetyService';
import type { ChildProfile, PickupLog, ChildSafetyAlert } from '../../../types/childSafety';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

export const AdminChildSafetyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-gvs';

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [pickupLogs, setPickupLogs] = useState<PickupLog[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<ChildSafetyAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    setChildren(childSafetyService.getChildren(societyId));
    setPickupLogs(childSafetyService.getPickupLogs(societyId));
    setSafetyAlerts(childSafetyService.getSafetyAlerts(societyId));
  };

  const handleResolveAlert = (alertId: string) => {
    childSafetyService.resolveSafetyAlert(societyId, alertId, currentUser?.name || 'Society Admin');
    loadData();
  };

  const filteredChildren = children.filter(c =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.flatNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAlerts = safetyAlerts.filter(a => a.status === 'ACTIVE');

  const childrenColumns: Column<ChildProfile>[] = [
    { key: 'fullName', header: 'Child Name', sortable: true },
    { key: 'flatNumber', header: 'Flat', sortable: true },
    { key: 'dateOfBirth', header: 'DOB / Age' },
    { key: 'guardians', header: 'Primary Guardian', render: (c) => `${c.guardians[0]?.name} (${c.guardians[0]?.phone})` },
    { key: 'authorizedPickups', header: 'Authorized Caretakers', render: (c) => `${c.authorizedPickups.length} Person(s)` },
    { key: 'status', header: 'Status', render: (c) => (
      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
        c.status === 'SAFE' ? 'bg-emerald-100 text-emerald-800' :
        c.status === 'OUT_OF_SOCIETY' ? 'bg-amber-100 text-amber-800' :
        'bg-rose-100 text-rose-800 animate-pulse'
      }`}>
        {c.status}
      </span>
    )}
  ];

  const logColumns: Column<PickupLog>[] = [
    { key: 'childName', header: 'Child Name' },
    { key: 'flatNumber', header: 'Flat' },
    { key: 'pickupPersonName', header: 'Caretaker' },
    { key: 'gateId', header: 'Gate' },
    { key: 'timestamp', header: 'Time', render: (l) => new Date(l.timestamp).toLocaleString() },
    { key: 'status', header: 'Outcome', render: (l) => (
      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
        l.status === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      }`}>
        {l.status}
      </span>
    )}
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Active Safety Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-600 text-white p-5 rounded-2xl shadow-lg border-2 border-rose-400 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-8 h-8 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide uppercase">ACTIVE MISSING CHILD ALERT BROADCAST</h2>
              <div className="mt-1 space-y-1 text-sm font-medium">
                {activeAlerts.map(alert => (
                  <div key={alert.id}>{alert.message}</div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleResolveAlert(activeAlerts[0].id)}
            className="px-4 py-2 bg-white text-rose-700 font-extrabold text-xs rounded-xl shadow hover:bg-rose-50 shrink-0"
          >
            Mark Child Safe / Resolve Incident
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Child Safety Oversight & Gate Audit</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Society-wide register of children, authorized pickup guardians, emergency alerts, and gate pickup audit history.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Registered Children</span>
            <span className="text-2xl font-bold text-slate-900">{children.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Gate Pickups Today</span>
            <span className="text-2xl font-bold text-slate-900">{pickupLogs.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Active Missing Alerts</span>
            <span className="text-2xl font-bold text-slate-900">{activeAlerts.length}</span>
          </div>
        </div>
      </div>

      {/* Children Register Table */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Registered Society Children Register</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by child name or flat..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl"
            />
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            columns={childrenColumns}
            data={filteredChildren}
            keyExtractor={(c) => c.id}
            pageSize={10}
            mobileRender={(c) => (
              <MobileDataCard
                title={c.fullName}
                subtitle={`Flat: ${c.flatNumber}`}
                status={<span className={`px-2 py-0.5 text-[0.65rem] rounded-full font-bold ${
                  c.status === 'SAFE' ? 'bg-emerald-100 text-emerald-800' :
                  c.status === 'OUT_OF_SOCIETY' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>{c.status}</span>}
                attributes={[
                  { label: 'Guardian', value: c.guardians[0]?.name },
                  { label: 'Auth Pickups', value: c.authorizedPickups.length }
                ]}
              />
            )}
          />
        </div>
      </div>

      {/* Pickup Event Audit Logs */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Gate Pickup Audit Logs & Incident History</h2>
        <div className="mt-4">
          <DataTable
            columns={logColumns}
            data={pickupLogs}
            keyExtractor={(l) => l.id}
            pageSize={10}
            mobileRender={(l) => (
              <MobileDataCard
                title={l.childName}
                subtitle={l.pickupPersonName}
                status={<span className={`px-2 py-0.5 text-[0.65rem] rounded-full font-bold ${
                  l.status === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>{l.status}</span>}
                attributes={[
                  { label: 'Flat', value: l.flatNumber },
                  { label: 'Time', value: new Date(l.timestamp).toLocaleString() }
                ]}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};
