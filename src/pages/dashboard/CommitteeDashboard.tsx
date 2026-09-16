import React, { useState } from 'react';
import {
  FileCheck,
  DollarSign,
  ShieldCheck,
  Activity,
  BookOpen,
} from 'lucide-react';
import { UnifiedRequestCenter } from '../../domains/requests/components/UnifiedRequestCenter';
import { SocietyExpenseHub } from '../../domains/expenses';

export const CommitteeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'financials' | 'compliance' | 'health' | 'governance'>('approvals');


  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Management Committee Dashboard</h1>
          <p className="text-sm text-slate-500">Executive oversight, financial approvals, compliance & governance</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-xs flex items-center gap-1">
            <ShieldCheck size={14} /> Committee Access
          </span>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">4</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <FileCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Monthly Collection Rate</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">94.2%</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Society Health Index</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">98/100</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Compliance Audit</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">COMPLIANT</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        {[
          { key: 'approvals', label: 'Approvals & NOCs', icon: FileCheck },
          { key: 'financials', label: 'Financial Overview', icon: DollarSign },
          { key: 'compliance', label: 'Compliance Audit', icon: ShieldCheck },
          { key: 'health', label: 'Society Health', icon: Activity },
          { key: 'governance', label: 'Governance & Bye-Laws', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      {activeTab === 'approvals' && <UnifiedRequestCenter />}


      {activeTab === 'financials' && (
        <SocietyExpenseHub userRole="COMMITTEE_MEMBER" />
      )}

      {activeTab === 'compliance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Society Statutory Compliance Checklist</h3>
          <div className="space-y-2">
            {[
              { title: 'Fire Safety Audit 2026', status: 'VALID', date: 'Expires Dec 2026' },
              { title: 'Lift Safety Inspection', status: 'VALID', date: 'Expires Oct 2026' },
              { title: 'Annual General Meeting (AGM) Minutes', status: 'SUBMITTED', date: 'Filed Aug 2026' },
              { title: 'Water Tank Quality Certification', status: 'DUE SOON', date: 'Renewal Due 30 Sep' },
            ].map((c, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="font-medium text-slate-800 text-sm">{c.title}</span>
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 rounded">{c.status} ({c.date})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Society Health & Operational Analytics</h3>
          <p className="text-sm text-slate-600">Complaint resolution speed: 92% resolved under 24 hours. Resident satisfaction rate: 4.8 / 5.0.</p>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Governance & Bye-Laws Enforcement</h3>
          <p className="text-sm text-slate-600">Model bye-laws compliant. Digital voting & notice management enabled.</p>
        </div>
      )}
    </div>
  );
};
