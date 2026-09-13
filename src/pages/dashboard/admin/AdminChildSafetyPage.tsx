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

export const AdminChildSafetyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';

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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Active Safety Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-600 text-white p-5 rounded-2xl shadow-lg border-2 border-rose-400 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-8 h-8 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide uppercase">🚨 ACTIVE MISSING CHILD ALERT BROADCAST</h2>
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Child Name</th>
                <th className="p-3">Flat</th>
                <th className="p-3">DOB / Age</th>
                <th className="p-3">Primary Guardian</th>
                <th className="p-3">Authorized Caretakers</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">No children profiles found</td>
                </tr>
              ) : (
                filteredChildren.map(child => (
                  <tr key={child.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {child.fullName.charAt(0)}
                      </div>
                      {child.fullName}
                    </td>
                    <td className="p-3">{child.flatNumber}</td>
                    <td className="p-3">{child.dateOfBirth}</td>
                    <td className="p-3">
                      {child.guardians[0]?.name} ({child.guardians[0]?.phone})
                    </td>
                    <td className="p-3">{child.authorizedPickups.length} Person(s)</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        child.status === 'SAFE' ? 'bg-emerald-100 text-emerald-800' :
                        child.status === 'OUT_OF_SOCIETY' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800 animate-pulse'
                      }`}>
                        {child.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pickup Event Audit Logs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Gate Pickup Audit Logs & Incident History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Child Name</th>
                <th className="p-3">Flat</th>
                <th className="p-3">Caretaker / Pickup Person</th>
                <th className="p-3">Gate</th>
                <th className="p-3">Time</th>
                <th className="p-3">Verification Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pickupLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">No pickup logs recorded</td>
                </tr>
              ) : (
                pickupLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{log.childName}</td>
                    <td className="p-3">{log.flatNumber}</td>
                    <td className="p-3">{log.pickupPersonName}</td>
                    <td className="p-3">{log.gateId}</td>
                    <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        log.status === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
