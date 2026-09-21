import React from 'react';
import { useComplaints } from '../../domains/complaints/services/useComplaints';
import { useMoves } from '../../domains/moves/services/useMoves';
import { useRenovations } from '../../domains/renovations/services/useRenovations';
import { useCompliance } from '../../domains/compliance/services/useCompliance';
import { useAIInsights } from '../../domains/ai/services/useAIInsights';
import { aiService } from '../../repositories/ai/AIService';
import type { RBACUser } from '../../types/rbac';
import { Sparkles, AlertTriangle, FileCheck, Truck, HardHat, CheckCircle2 } from 'lucide-react';

const S = {
  page: { minHeight: '100%', background: '#f7f8fa', paddingBottom: '1.5rem' } as React.CSSProperties,
  header: {
    background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
    padding: '1.25rem 1rem 1.5rem',
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  htitle: { color: '#fff', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', margin: 0 } as React.CSSProperties,
  hsub: { color: '#c7d2fe', fontSize: '0.8125rem', marginTop: '0.2rem' } as React.CSSProperties,
  content: { padding: '1rem' } as React.CSSProperties,
  card: {
    background: '#fff', borderRadius: '1rem',
    border: '1px solid #e5e7eb', overflow: 'hidden',
    marginBottom: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  } as React.CSSProperties,
  alertCard: {
    background: '#fef2f2', borderRadius: '1rem',
    border: '1.5px solid #fecaca', overflow: 'hidden',
    marginBottom: '0.875rem',
  } as React.CSSProperties,
  aiCard: {
    background: '#eef2ff', borderRadius: '1rem',
    border: '1.5px solid #c7d2fe', overflow: 'hidden',
    marginBottom: '0.875rem',
  } as React.CSSProperties,
  head: {
    display: 'flex', alignItems: 'center', gap: '0.625rem',
    padding: '0.875rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  title: { fontWeight: 700, fontSize: '0.9375rem', color: '#111827', margin: 0, flex: 1 } as React.CSSProperties,
  aiTitle: { fontWeight: 700, fontSize: '0.9375rem', color: '#312e81', margin: 0, flex: 1 } as React.CSSProperties,
  alertTitle: { fontWeight: 700, fontSize: '0.9375rem', color: '#991b1b', margin: 0, flex: 1 } as React.CSSProperties,
  row: (last: boolean) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 1rem', borderBottom: last ? 'none' : '1px solid #f1f5f9',
  } as React.CSSProperties),
  alertRow: (last: boolean) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 1rem', borderBottom: last ? 'none' : '1px solid #fecaca',
  } as React.CSSProperties),
  iconBox: (color: string, bg: string) => ({
    width: 32, height: 32, borderRadius: 8, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
  } as React.CSSProperties),
  badge: (color: string, bg: string) => ({
    padding: '0.2rem 0.5rem', borderRadius: 20, flexShrink: 0,
    fontSize: '0.6875rem', fontWeight: 700, color, background: bg,
  } as React.CSSProperties),
  empty: {
    padding: '1.25rem 1rem', textAlign: 'center' as const,
    color: '#9ca3af', fontSize: '0.875rem',
  } as React.CSSProperties,
  actionBtn: (color: string, bg: string) => ({
    padding: '0.375rem 0.75rem', borderRadius: 8,
    background: bg, color, fontWeight: 700, fontSize: '0.8125rem',
    flexShrink: 0, border: 'none', cursor: 'pointer',
  } as React.CSSProperties),
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', padding: '3rem 1rem', color: '#6b7280', fontSize: '0.9375rem',
  } as React.CSSProperties,
};

export const SecretaryDashboard: React.FC<{ user: RBACUser }> = ({ user }) => {
  const societyId = user.societyId!;

  const { breachedComplaints, loading: compLoading } = useComplaints(societyId);
  const { pendingApproval: movePending, loading: movesLoading } = useMoves(societyId);
  const { pendingApprovals: renPending, loading: renLoading } = useRenovations(societyId, 'secretary');
  const { expiringContracts, expiredContracts, loading: amcLoading } = useCompliance(societyId, 'admin');
  const { insights: pendingInsights, loading: aiLoading } = useAIInsights(societyId, 'PENDING_REVIEW');

  const loading = compLoading || movesLoading || renLoading || amcLoading || aiLoading;

  if (loading) {
    return (
      <div style={S.loading}>
        <span style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        Syncing Operations Data...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const totalAlerts = breachedComplaints.length + movePending.length + renPending.length;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ position: 'absolute', top: -24, right: -24, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <p style={{ color: '#c7d2fe', fontSize: '0.75rem', margin: '0 0 0.125rem' }}>Operations Center</p>
        <h1 style={S.htitle}>Command Center</h1>
        <p style={S.hsub}>{user.name} · Secretary</p>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'SLA Breaches', value: breachedComplaints.length, color: '#f87171', bg: 'rgba(239,68,68,0.2)' },
            { label: 'Move Approvals', value: movePending.length, color: '#93c5fd', bg: 'rgba(59,130,246,0.2)' },
            { label: 'Reno Pending', value: renPending.length, color: '#fcd34d', bg: 'rgba(245,158,11,0.2)' },
            { label: 'AI Insights', value: pendingInsights.length, color: '#a5b4fc', bg: 'rgba(139,92,246,0.2)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: '0.5rem 0.625rem' }}>
              <div style={{ color, fontWeight: 800, fontSize: '1.125rem', lineHeight: 1 }}>{value}</div>
              <div style={{ color, opacity: 0.8, fontSize: '0.5625rem', fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.content}>
        {/* AI Insights */}
        {pendingInsights.length > 0 && (
          <div style={S.aiCard}>
            <div style={{ ...S.head, borderBottom: '1px solid #c7d2fe', background: '#f5f3ff' }}>
              <div style={S.iconBox('#4f46e5', '#eef2ff')}><Sparkles size={15} /></div>
              <h2 style={S.aiTitle}>AI Operational Insights</h2>
              <span style={S.badge('#4f46e5', '#e0e7ff')}>{pendingInsights.length}</span>
            </div>
            {pendingInsights.map((insight, i) => (
              <div key={insight.id} style={{ padding: '0.875rem 1rem', borderBottom: i < pendingInsights.length - 1 ? '1px solid #c7d2fe' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={S.badge('#4338ca', '#eef2ff')}>{insight.context.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e1b4b', margin: '0 0 0.25rem' }}>
                  {insight.recommendation}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#4338ca', margin: '0 0 0.75rem' }}>{insight.reason}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={S.actionBtn('#fff', '#4f46e5')}
                    onClick={() => aiService.resolveInsight(insight.id, 'ACCEPTED', user.id)}
                  >
                    ✓ Accept & Execute
                  </button>
                  <button
                    style={S.actionBtn('#6b7280', '#f3f4f6')}
                    onClick={() => aiService.resolveInsight(insight.id, 'REJECTED', user.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SLA Breaches */}
        {breachedComplaints.length > 0 && (
          <div style={S.alertCard}>
            <div style={{ ...S.head, borderBottom: '1px solid #fecaca', background: '#fff5f5' }}>
              <div style={S.iconBox('#dc2626', '#fee2e2')}><AlertTriangle size={15} /></div>
              <h2 style={S.alertTitle}>SLA Breaches</h2>
              <span style={S.badge('#dc2626', '#fee2e2')}>{breachedComplaints.length}</span>
            </div>
            {breachedComplaints.map((comp, i) => (
              <div key={comp.id} style={S.alertRow(i === breachedComplaints.length - 1)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.title}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#dc2626', marginTop: 2 }}>Level: {comp.escalationLevel}</div>
                </div>
                <button style={{ marginLeft: '0.75rem', ...S.actionBtn('#fff', '#dc2626') }}>Intervene</button>
              </div>
            ))}
          </div>
        )}

        {/* Pending Move Approvals */}
        <div style={S.card}>
          <div style={S.head}>
            <div style={S.iconBox('#2563eb', '#eff6ff')}><Truck size={15} /></div>
            <h2 style={S.title}>Pending Move Approvals</h2>
            {movePending.length > 0 && <span style={S.badge('#2563eb', '#dbeafe')}>{movePending.length}</span>}
          </div>
          {movePending.length === 0 ? (
            <div style={S.empty}>All caught up ✓</div>
          ) : (
            movePending.map((move, i) => (
              <div key={move.id} style={S.row(i === movePending.length - 1)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>{move.residentName}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: 2 }}>{new Date(move.date).toLocaleDateString()}</div>
                </div>
                <button style={{ marginLeft: '0.75rem', ...S.actionBtn('#2563eb', '#eff6ff') }}>Review</button>
              </div>
            ))
          )}
        </div>

        {/* Pending Renovations */}
        <div style={S.card}>
          <div style={S.head}>
            <div style={S.iconBox('#d97706', '#fffbeb')}><HardHat size={15} /></div>
            <h2 style={S.title}>Pending Renovations</h2>
            {renPending.length > 0 && <span style={S.badge('#d97706', '#fef3c7')}>{renPending.length}</span>}
          </div>
          {renPending.length === 0 ? (
            <div style={S.empty}>All caught up ✓</div>
          ) : (
            renPending.map((ren, i) => (
              <div key={ren.id} style={S.row(i === renPending.length - 1)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>Flat {ren.flatCode}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: 2 }}>{ren.contractor.companyName}</div>
                </div>
                <button style={{ marginLeft: '0.75rem', ...S.actionBtn('#d97706', '#fffbeb') }}>Review</button>
              </div>
            ))
          )}
        </div>

        {/* AMC / Contracts */}
        {(expiringContracts.length > 0 || expiredContracts.length > 0) && (
          <div style={S.card}>
            <div style={S.head}>
              <div style={S.iconBox('#7c3aed', '#f5f3ff')}><FileCheck size={15} /></div>
              <h2 style={S.title}>AMC / Contract Alerts</h2>
              <span style={S.badge('#7c3aed', '#ede9fe')}>{expiringContracts.length + expiredContracts.length}</span>
            </div>
            {expiredContracts.map((amc, i) => (
              <div key={amc.id} style={{ ...S.row(i === expiredContracts.length - 1 && expiringContracts.length === 0), background: '#fff5f5' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b' }}>{amc.title}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#dc2626', marginTop: 2 }}>
                    Expired: {new Date(amc.contractEnd).toLocaleDateString()}
                  </div>
                </div>
                <span style={S.badge('#dc2626', '#fee2e2')}>EXPIRED</span>
              </div>
            ))}
            {expiringContracts.map((amc, i) => (
              <div key={amc.id} style={{ ...S.row(i === expiringContracts.length - 1), background: '#fffbeb' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#92400e' }}>{amc.title}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#d97706', marginTop: 2 }}>
                    Expires: {new Date(amc.contractEnd).toLocaleDateString()}
                  </div>
                </div>
                <span style={S.badge('#d97706', '#fef3c7')}>SOON</span>
              </div>
            ))}
          </div>
        )}

        {totalAlerts === 0 && pendingInsights.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>All Operations Clear</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.375rem' }}>No pending actions or alerts</div>
          </div>
        )}
      </div>
    </div>
  );
};
