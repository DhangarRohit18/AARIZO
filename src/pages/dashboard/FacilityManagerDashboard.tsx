import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  Calendar,
  Layers,
  Trash2,
  Zap,
  CheckCircle,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { AssetComplianceHub } from '../../domains/compliance';
import { StaffShiftHub } from '../../domains/staff';

export const FacilityManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'maintenance' | 'shifts' | 'amc' | 'cleaning' | 'utilities'>('maintenance');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facility Manager Dashboard</h1>
          <p className="text-sm text-slate-500">Asset maintenance, staff shifts, AMCs, cleaning & utility operations</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full text-xs flex items-center gap-1">
          <Wrench size={14} /> Facility Operations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Open Maintenance Tickets</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">7</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Wrench size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Staff On Duty</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">18 / 20</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Active AMCs</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">12 Contracts</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Utility Status</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">NORMAL</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Zap size={24} />
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 space-x-6">
        {[
          { key: 'maintenance', label: 'Maintenance & Tickets', icon: Wrench },
          { key: 'shifts', label: 'Staff Shifts & Roster', icon: Clock },
          { key: 'amc', label: 'AMC & Asset Servicing', icon: Calendar },
          { key: 'cleaning', label: 'Housekeeping & Waste', icon: Trash2 },
          { key: 'utilities', label: 'Utilities & Power', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Assigned Maintenance Tasks</h3>
          <div className="divide-y">
            {[
              { id: 'TKT-801', title: 'Main Elevator B2 Noise Inspection', assignedTo: 'Otis Elevator AMC', priority: 'HIGH', status: 'IN_PROGRESS' },
              { id: 'TKT-802', title: 'Clubhouse AC Gas Refill', assignedTo: 'CoolCare Servicing', priority: 'MEDIUM', status: 'PENDING' },
              { id: 'TKT-803', title: 'Basement P2 Lighting Replacement', assignedTo: 'Suresh Kumar (Electrician)', priority: 'LOW', status: 'COMPLETED' },
            ].map((t) => (
              <div key={t.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{t.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Assigned to: {t.assignedTo} • Ticket #{t.id}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <StaffShiftHub />
      )}

      {activeTab === 'amc' && (
        <AssetComplianceHub userRoleOverride="FACILITY_MANAGER" />
      )}

      {activeTab === 'cleaning' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Cleaning & Waste Disposal Log</h3>
          <p className="text-sm text-slate-600">Garbage collection completed for Towers A, B & C at 09:30 AM.</p>
        </div>
      )}

      {activeTab === 'utilities' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Utilities & Generator Meters</h3>
          <p className="text-sm text-slate-600">Water Tank level: 85% full. DG Fuel Level: 320 Liters.</p>
        </div>
      )}
    </div>
  );
};
