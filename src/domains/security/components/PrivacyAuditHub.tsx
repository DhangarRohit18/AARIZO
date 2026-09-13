import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Activity,
  Clock,
} from 'lucide-react';
import { privacyAuditEngine } from '../services/privacyAuditEngine';
import type { StructuralAuditLog, AuditActionType } from '../types/auditTypes';

export const PrivacyAuditHub: React.FC = () => {
  const [logs, setLogs] = useState<StructuralAuditLog[]>([]);
  const [selectedAction, setSelectedAction] = useState<AuditActionType | 'ALL'>('ALL');
  const [activeLogModal, setActiveLogModal] = useState<StructuralAuditLog | null>(null);

  const refreshLogs = () => {
    setLogs(
      privacyAuditEngine.getAuditLogs({
        action: selectedAction,
      })
    );
  };

  useEffect(() => {
    refreshLogs();
  }, [selectedAction]);

  const privacyTestCases = [
    {
      domain: 'domestic_attendance' as const,
      title: 'Domestic Worker Attendance',
      rule: 'Linked household + authorized staff only',
      testResident: privacyAuditEngine.verifyPrivacyAccess('domestic_attendance', 'RESIDENT', 'flat-101', 'flat-102'),
      testAdmin: privacyAuditEngine.verifyPrivacyAccess('domestic_attendance', 'SOCIETY_ADMIN'),
    },
    {
      domain: 'medical_blood_registry' as const,
      title: 'Medical / Blood Registry',
      rule: 'Opt-in + verified emergency only',
      testResident: privacyAuditEngine.verifyPrivacyAccess('medical_blood_registry', 'RESIDENT'),
      testAdmin: privacyAuditEngine.verifyPrivacyAccess('medical_blood_registry', 'SECURITY'),
    },
    {
      domain: 'child_safety' as const,
      title: 'Child Safety & Guardian Authorizations',
      rule: 'Guardian-authorized only',
      testResident: privacyAuditEngine.verifyPrivacyAccess('child_safety', 'RESIDENT', 'flat-101', 'flat-102'),
      testAdmin: privacyAuditEngine.verifyPrivacyAccess('child_safety', 'SECURITY'),
    },
    {
      domain: 'trust_score' as const,
      title: 'Trust Score & Badges',
      rule: 'Positive-only + relevant viewers only',
      testResident: privacyAuditEngine.verifyPrivacyAccess('trust_score', 'RESIDENT'),
      testAdmin: privacyAuditEngine.verifyPrivacyAccess('trust_score', 'SOCIETY_ADMIN'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 text-white p-5 rounded-2xl shadow-md gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold">Privacy Guard & Structural Audit Engine</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Immutable 10-point audit schema tracking login, approvals, QR scans, entries, payments, SLA escalations, AMC renewals, and NOC actions.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
          <Lock size={14} /> Backend Enforced Authorization
        </div>
      </div>

      {/* Privacy Rules Enforcement Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <EyeOff size={16} className="text-indigo-600" /> Privacy & Access Control Enforcement Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privacyTestCases.map((tc) => (
            <div key={tc.domain} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{tc.title}</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Policy: {tc.rule}</span>
                </div>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded">
                  ENFORCED
                </span>
              </div>

              <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unlinked Resident Request:</span>
                  <span className={tc.testResident.isAuthorized ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {tc.testResident.isAuthorized ? 'ALLOWED' : 'BLOCKED (403 Forbidden)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized Role Request:</span>
                  <span className={tc.testAdmin.isAuthorized ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {tc.testAdmin.isAuthorized ? 'ALLOWED' : 'BLOCKED'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity size={16} className="text-indigo-600" /> Immutable Structural Audit Logs
          </h2>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="APPROVAL">APPROVAL</option>
              <option value="REJECTION">REJECTION</option>
              <option value="QR_SCAN">QR_SCAN</option>
              <option value="ENTRY">ENTRY</option>
              <option value="EXIT">EXIT</option>
              <option value="ATTENDANCE">ATTENDANCE</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="SLA_ESCALATION">SLA_ESCALATION</option>
              <option value="AMC_RENEWAL">AMC_RENEWAL</option>
              <option value="NOC_ACTION">NOC_ACTION</option>
              <option value="EMERGENCY_ACTION">EMERGENCY_ACTION</option>
              <option value="VENDOR_CHANGE">VENDOR_CHANGE</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity Target</th>
                <th className="p-3">10-Point Schema State</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-900">{log.actorName}</div>
                    <span className="text-[10px] text-indigo-600 font-semibold">{log.role}</span>
                  </td>

                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-800">{log.entity}</div>
                    <span className="text-[10px] text-slate-400">ID: {log.entityId}</span>
                  </td>

                  <td className="p-3">
                    <div className="text-[11px] font-mono text-slate-600">
                      {log.beforeState ? `Before: ${JSON.stringify(log.beforeState)}` : 'Before: null'}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">
                      {log.afterState ? `After: ${JSON.stringify(log.afterState)}` : 'After: null'}
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveLogModal(log)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold"
                    >
                      View Raw JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAW JSON MODAL */}
      {activeLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Raw 10-Point Audit Schema</h3>
              <button onClick={() => setActiveLogModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto max-h-80">
              {JSON.stringify(activeLogModal, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
