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
  page: { minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: '1.5rem' } as React.CSSProperties,
  header: {
    background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
    padding: '1.25rem 1rem 1.5rem',
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  htitle: { color: '#FFFFFF', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', margin: 0 } as React.CSSProperties,
  hsub: { color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.8125rem', marginTop: '0.2rem' } as React.CSSProperties,
  content: { padding: '1rem' } as React.CSSProperties,
  card: {
    background: '#FFFFFF', borderRadius: '1rem',
    border: '1px solid var(--aarizo-border, #E8F1F5)', overflow: 'hidden',
    marginBottom: '0.875rem', boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
  } as React.CSSProperties,
  alertCard: {
    background: '#FFF0F1', borderRadius: '1rem',
    border: '1px solid rgba(217, 83, 91, 0.25)', overflow: 'hidden',
    marginBottom: '0.875rem',
  } as React.CSSProperties,
  aiCard: {
    background: 'var(--aarizo-card-blue, #F4FAFE)', borderRadius: '1rem',
    border: '1px solid var(--aarizo-border, #E8F1F5)', overflow: 'hidden',
    marginBottom: '0.875rem', boxShadow: '0 2px 8px rgba(23, 107, 145, 0.05)',
  } as React.CSSProperties,
  head: {
    display: 'flex', alignItems: 'center', gap: '0.625rem',
    padding: '0.875rem 1rem', borderBottom: '1px solid rgba(8, 59, 86, 0.06)',
  } as React.CSSProperties,
  title: { fontWeight: 700, fontSize: '0.9375rem', color: 'var(--aarizo-text-dark, #203746)', margin: 0, flex: 1 } as React.CSSProperties,
  aiTitle: { fontWeight: 700, fontSize: '0.9375rem', color: 'var(--aarizo-navy, #083B56)', margin: 0, flex: 1 } as React.CSSProperties,
  alertTitle: { fontWeight: 700, fontSize: '0.9375rem', color: '#B91C1C', margin: 0, flex: 1 } as React.CSSProperties,
  row: (last: boolean) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 1rem', borderBottom: last ? 'none' : '1px solid var(--aarizo-border, #E8F1F5)',
  } as React.CSSProperties),
  alertRow: (last: boolean) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 1rem', borderBottom: last ? 'none' : '1px solid rgba(217, 83, 91, 0.15)',
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
    color: 'var(--aarizo-text-muted, #657785)', fontSize: '0.875rem',
  } as React.CSSProperties,
  actionBtn: (color: string, bg: string) => ({
    padding: '0.375rem 0.75rem', borderRadius: 8,
    background: bg, color, fontWeight: 700, fontSize: '0.8125rem',
    flexShrink: 0, border: 'none', cursor: 'pointer',
  } as React.CSSProperties),
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', padding: '3rem 1rem', color: 'var(--aarizo-text-muted, #657785)', fontSize: '0.9375rem',
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
        <span style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: 'var(--aarizo-blue, #176B91)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
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
        <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.75rem', margin: '0 0 0.125rem' }}>Operations Center</p>
        <h1 style={S.htitle}>Command Center</h1>
        <p style={S.hsub}>{user.name} · Secretary</p>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'SLA Breaches', value: breachedComplaints.length, color: '#f87171', bg: 'rgba(239,68,68,0.2)' },
            { label: 'Move Approvals', value: movePending.length, color: 'var(--aarizo-sky, #83CBEA)', bg: 'rgba(131,203,234,0.2)' },
            { label: 'Reno Pending', value: renPending.length, color: '#fcd34d', bg: 'rgba(245,158,11,0.2)' },
            { label: 'AI Insights', value: pendingInsights.length, color: '#FFFFFF', bg: 'rgba(255,255,255,0.15)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: '0.5rem 0.625rem' }}>
              <div style={{ color, fontWeight: 800, fontSize: '1.125rem', lineHeight: 1 }}>{value}</div>
              <div style={{ color, opacity: 0.9, fontSize: '0.5625rem', fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.content}>
        {/* AI Insights */}
        {pendingInsights.length > 0 && (
          <div style={S.aiCard}>
            <div style={{ ...S.head, borderBottom: '1px solid var(--aarizo-border, #E8F1F5)', background: 'var(--aarizo-card-blue, #F4FAFE)' }}>
              <div style={S.iconBox('var(--aarizo-blue, #176B91)', '#EAF6FC')}><Sparkles size={15} /></div>
              <h2 style={S.aiTitle}>AI Operational Insights</h2>
              <span style={S.badge('var(--aarizo-blue, #176B91)', '#EAF6FC')}>{pendingInsights.length}</span>
            </div>
            {pendingInsights.map((insight, i) => (
              <div key={insight.id} style={{ padding: '0.875rem 1rem', borderBottom: i < pendingInsights.length - 1 ? '1px solid var(--aarizo-border, #E8F1F5)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={S.badge('var(--aarizo-navy, #083B56)', '#EAF6FC')}>{insight.context.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #657785)' }}>
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--aarizo-text-dark, #203746)', margin: '0 0 0.25rem' }}>
                  {insight.recommendation}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-blue, #176B91)', margin: '0 0 0.75rem' }}>{insight.reason}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={S.actionBtn('#fff', 'var(--aarizo-blue, #176B91)')}
                    onClick={() => aiService.resolveInsight(insight.id, 'ACCEPTED', user.id)}
                  >
                    ✓ Accept & Execute
                  </button>
                  <button
                    style={S.actionBtn('var(--aarizo-text-muted, #657785)', 'var(--aarizo-page, #F7FBFE)')}
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
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--aarizo-text-dark, #203746)' }}>{move.residentName}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #657785)', marginTop: 2 }}>{new Date(move.date).toLocaleDateString()}</div>
                </div>
                <button style={{ marginLeft: '0.75rem', ...S.actionBtn('var(--aarizo-blue, #176B91)', 'var(--aarizo-blue-light, #EAF6FC)') }}>Review</button>
              </div>
            ))
          )}
        </div>

        {/* Pending Renovations */}
        <div style={S.card}>
          <div style={S.head}>
            <div style={S.iconBox('#D99A2B', '#FFF8E8')}><HardHat size={15} /></div>
            <h2 style={S.title}>Pending Renovations</h2>
            {renPending.length > 0 && <span style={S.badge('#D99A2B', '#FFF8E8')}>{renPending.length}</span>}
          </div>
          {renPending.length === 0 ? (
            <div style={S.empty}>All caught up ✓</div>
          ) : (
            renPending.map((ren, i) => (
              <div key={ren.id} style={S.row(i === renPending.length - 1)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--aarizo-text-dark, #203746)' }}>Flat {ren.flatCode}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #657785)', marginTop: 2 }}>{ren.contractor.companyName}</div>
                </div>
                <button style={{ marginLeft: '0.75rem', ...S.actionBtn('#D99A2B', '#FFF8E8') }}>Review</button>
              </div>
            ))
          )}
        </div>

        {/* AMC / Contracts */}
        {(expiringContracts.length > 0 || expiredContracts.length > 0) && (
          <div style={S.card}>
            <div style={S.head}>
              <div style={S.iconBox('var(--aarizo-blue, #176B91)', 'var(--aarizo-blue-light, #EAF6FC)')}><FileCheck size={15} /></div>
              <h2 style={S.title}>AMC / Contract Alerts</h2>
              <span style={S.badge('var(--aarizo-blue, #176B91)', 'var(--aarizo-blue-light, #EAF6FC)')}>{expiringContracts.length + expiredContracts.length}</span>
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
