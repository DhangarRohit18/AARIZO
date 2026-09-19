import React, { useState, useMemo } from 'react';
import {
  Shield,
  Terminal,
  Activity,
  UserCheck,
  Search,
  Filter,
  LogOut,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Download,
  Code,
  Zap,
} from 'lucide-react';
import { securityService } from '../../../services/securityService';
import type { SessionRecord, AuditEventType } from '../../../types/security';

export const SecurityAuditCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit_logs' | 'sessions' | 'rbac' | 'simulator'>('audit_logs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [sessions, setSessions] = useState<SessionRecord[]>(() => securityService.getActiveSessions());
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Simulator States
  const [simPayload, setSimPayload] = useState<string>('{\n  "username": "admin",\n  "comment": "<script>alert(1)</script>"\n}');
  const [simValidationResult, setSimValidationResult] = useState<any>(null);
  const [simRateLimitResult, setSimRateLimitResult] = useState<any>(null);
  const [simRateLimitHits, setSimRateLimitHits] = useState<number>(0);

  const logs = useMemo(() => {
    return securityService.getAuditLogs('soc-gvs', actionFilter);
  }, [actionFilter]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (l) =>
        l.actor.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.ipAddress.includes(q)
    );
  }, [logs, searchQuery]);

  const handleTerminateSession = (sessionId: string) => {
    securityService.terminateSession(sessionId);
    setSessions(securityService.getActiveSessions());
  };

  const handleRunPayloadValidation = () => {
    try {
      const parsed = JSON.parse(simPayload);
      const res = securityService.validatePayload(parsed);
      setSimValidationResult(res);
    } catch (e: any) {
      setSimValidationResult({ isValid: false, errors: [`JSON Parse Error: ${e.message}`] });
    }
  };

  const handleTestRateLimit = () => {
    const res = securityService.checkRateLimit('ip:192.168.1.100:api/v1/auth', 5, 10);
    setSimRateLimitResult(res);
    setSimRateLimitHits((prev) => prev + 1);
  };

  const handleDispatchTestAudit = (action: AuditEventType) => {
    securityService.logAudit({
      actor: 'Admin Console Simulator',
      role: 'SOCIETY_ADMIN',
      society: 'soc-gvs',
      action,
      entity: 'TestEntity',
      entityId: `TEST-${Date.now().toString().slice(-4)}`,
      metadata: { dispatchedVia: 'Simulator Tab', testMode: true },
      ipAddress: '127.0.0.1',
    });
    // Trigger re-render
    setActionFilter(actionFilter);
  };

  const handleExportAuditLogs = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Security_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'APPROVE':
      case 'VISITOR_ENTRY':
      case 'WORKER_VERIFICATION':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'REJECT':
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
      case 'EMERGENCY_ACTION':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-bold';
      case 'QR_SCAN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'PAYMENT':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 rounded-2xl p-4 md:p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" /> Security & Compliance Command Center
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Security & Audit Operations</h1>
            <p className="text-slate-400 text-sm mt-1">
              Immutable audit logs, active session management, payload validation, & RBAC controls
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAuditLogs}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-2 border border-slate-700"
            >
              <Download className="w-4 h-4" /> Export Logs
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-800">
          {[
            { id: 'audit_logs', label: 'Audit Logs (14 Events)', icon: Activity },
            { id: 'sessions', label: `Active Sessions (${sessions.filter((s) => !s.isExpired).length})`, icon: UserCheck },
            { id: 'rbac', label: 'RBAC Permission Matrix', icon: Lock },
            { id: 'simulator', label: 'Security & Rate Simulator', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AUDIT LOGS EXPLORER */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search actor, entity, entity ID, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium"
              >
                <option value="ALL">All Event Types (14)</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="APPROVE">APPROVE</option>
                <option value="REJECT">REJECT</option>
                <option value="QR_SCAN">QR_SCAN</option>
                <option value="VISITOR_ENTRY">VISITOR_ENTRY</option>
                <option value="VISITOR_EXIT">VISITOR_EXIT</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="MAINTENANCE_REASSIGNMENT">MAINTENANCE_REASSIGNMENT</option>
                <option value="WORKER_VERIFICATION">WORKER_VERIFICATION</option>
                <option value="EMERGENCY_ACTION">EMERGENCY_ACTION</option>
              </select>
            </div>
          </div>

          {/* Audit Trail Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor & Role</th>
                    <th className="p-3.5">Action Event</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">{log.actor}</div>
                            <div className="text-[10px] text-slate-400">{log.role}</div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${getActionBadgeColor(
                                log.action
                              )}`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-medium text-slate-900 dark:text-white">{log.entity}</span>
                            <span className="ml-1 text-slate-400 font-mono text-[10px]">({log.entityId})</span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-500">{log.ipAddress}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="text-xs text-rose-600 font-medium hover:underline"
                            >
                              {isExpanded ? 'Hide' : 'Metadata'}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-950 text-emerald-400 font-mono text-[11px]">
                            <td colSpan={6} className="p-4 border-t border-slate-800">
                              <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Metadata Record Payload</div>
                              <pre className="whitespace-pre-wrap overflow-x-auto bg-slate-900 p-3 rounded-lg border border-slate-800">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS MONITOR */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.sessionId}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border ${
                  sess.isExpired
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : 'border-emerald-200 dark:border-emerald-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        sess.isExpired ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'
                      }`}
                    ></div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{sess.userName}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {sess.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <div>IP: {sess.ipAddress}</div>
                  <div>Device: {sess.deviceInfo}</div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Active since: {new Date(sess.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {sess.isExpired ? 'EXPIRED / REVOKED' : 'SESSION ACTIVE'}
                  </span>
                  {!sess.isExpired && (
                    <button
                      onClick={() => handleTerminateSession(sess.sessionId)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-xs font-medium rounded-lg transition flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Revoke Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" /> Platform Role-Based Access Control (RBAC)
            </h3>
            <p className="text-xs text-slate-500">Strict server-enforced permission authorization matrix</p>
          </div>

          <div className="space-y-4">
            {[
              {
                role: 'SUPER_ADMIN',
                permissions: ['All Platform Permissions (*)'],
                desc: 'Full global system administration & multi-society configuration',
                color: 'bg-purple-50 text-purple-700 border-purple-200',
              },
              {
                role: 'SOCIETY_ADMIN',
                permissions: [
                  'create:flat',
                  'update:flat',
                  'delete:flat',
                  'approve:resident',
                  'reject:resident',
                  'create:vendor',
                  'approve:vendor',
                  'reject:vendor',
                  'manage:billing',
                  'reassign:maintenance',
                  'view:audit_logs',
                ],
                desc: 'Society management, financial control, and resident approvals',
                color: 'bg-blue-50 text-blue-700 border-blue-200',
              },
              {
                role: 'resident',
                permissions: [
                  'create:visitor_pass',
                  'approve:visitor_pass',
                  'reject:visitor_pass',
                  'create:maintenance_ticket',
                  'pay:bill',
                  'book:amenity',
                  'trigger:sos',
                  'book:guest_stay',
                ],
                desc: 'Self-service resident operations & visitor authorizations',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              },
              {
                role: 'SECURITY',
                permissions: [
                  'scan:visitor_qr',
                  'scan:parking_qr',
                  'scan:staff_qr',
                  'scan:child_qr',
                  'scan:guest_qr',
                  'verify:worker',
                  'respond:emergency',
                ],
                desc: 'Security gate scanning terminals & incident response',
                color: 'bg-amber-50 text-amber-700 border-amber-200',
              },
            ].map((item) => (
              <div key={item.role} className={`p-4 rounded-xl border ${item.color}`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">{item.role}</span>
                  <span className="text-xs text-slate-500">{item.desc}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.permissions.map((perm) => (
                    <span key={perm} className="px-2 py-0.5 bg-white/80 dark:bg-slate-950/40 rounded text-[11px] font-mono border">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & RATE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payload Sanitizer Simulator */}
          <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-rose-500" /> Payload Sanitizer & XSS Inspector
            </h3>
            <p className="text-xs text-slate-500">Test backend security payload validation engine</p>

            <textarea
              value={simPayload}
              onChange={(e) => setSimPayload(e.target.value)}
              rows={4}
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-emerald-400 focus:outline-none"
            ></textarea>

            <button
              onClick={handleRunPayloadValidation}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow transition"
            >
              Validate Payload Against Injection Rules
            </button>

            {simValidationResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono ${
                  simValidationResult.isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  {simValidationResult.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                  )}
                  Status: {simValidationResult.isValid ? 'PASSED CLEAN' : 'SECURITY VIOLATION REJECTED'}
                </div>
                {simValidationResult.errors.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-[11px] space-y-1">
                    {simValidationResult.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Rate Limiting Simulator */}
          <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Sliding-Window Rate Limiter
            </h3>
            <p className="text-xs text-slate-500">Simulate rapid API requests (Limit: 5 req / 10s)</p>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs">
              <span>Total Clicks / Attempts:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{simRateLimitHits}</span>
            </div>

            <button
              onClick={handleTestRateLimit}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow transition"
            >
              Simulate Instant API Call
            </button>

            {simRateLimitResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono ${
                  simRateLimitResult.allowed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Result: {simRateLimitResult.allowed ? '200 OK (Allowed)' : '429 TOO MANY REQUESTS'}</span>
                  <span>Remaining: {simRateLimitResult.remaining}</span>
                </div>
                <div className="text-[10px] mt-1 text-slate-500">
                  Window Reset in {simRateLimitResult.resetSeconds}s
                </div>
              </div>
            )}

            {/* Audit Dispatcher Quick Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold mb-2">Test Live Audit Log Event Dispatcher</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDispatchTestAudit('LOGIN')}
                  className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-semibold rounded"
                >
                  Dispatch LOGIN
                </button>
                <button
                  onClick={() => handleDispatchTestAudit('EMERGENCY_ACTION')}
                  className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-semibold rounded"
                >
                  Dispatch EMERGENCY
                </button>
                <button
                  onClick={() => handleDispatchTestAudit('WORKER_VERIFICATION')}
                  className="px-2.5 py-1 bg-purple-600 text-white text-[10px] font-semibold rounded"
                >
                  Dispatch WORKER_VERIFICATION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

