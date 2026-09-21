import React from 'react';
import { useMoves } from '../../domains/moves/services/useMoves';
import { useRenovations } from '../../domains/renovations/services/useRenovations';
import type { RBACUser } from '../../types/rbac';
import { Truck, HardHat, Users, Clock, CheckCircle2 } from 'lucide-react';

const styles = {
  page: {
    minHeight: '100%',
    background: '#f7f8fa',
    padding: '0 0 1.5rem',
  } as React.CSSProperties,
  header: {
    background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
    padding: '1.25rem 1rem 1.5rem',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  headerTitle: {
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.25rem',
    letterSpacing: '-0.02em',
    margin: 0,
  } as React.CSSProperties,
  headerSub: {
    color: '#fca5a5',
    fontSize: '0.8125rem',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  content: { padding: '1rem' } as React.CSSProperties,
  section: {
    background: '#fff',
    borderRadius: '1rem',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    marginBottom: '1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  } as React.CSSProperties,
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '1rem',
    borderBottom: '1px solid #f1f5f9',
  } as React.CSSProperties,
  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.9375rem',
    color: '#111827',
    margin: 0,
  } as React.CSSProperties,
  iconBox: (color: string, bg: string) => ({
    width: 32, height: 32, borderRadius: 8,
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color,
  } as React.CSSProperties),
  listItem: (last: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    borderBottom: last ? 'none' : '1px solid #f1f5f9',
  } as React.CSSProperties),
  badge: (color: string, bg: string) => ({
    padding: '0.25rem 0.625rem',
    borderRadius: 20,
    fontSize: '0.6875rem',
    fontWeight: 700,
    color, background: bg,
    flexShrink: 0,
  } as React.CSSProperties),
  emptyText: {
    padding: '1.25rem 1rem',
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: '0.875rem',
  } as React.CSSProperties,
  loadingText: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', padding: '3rem 1rem',
    color: '#6b7280', fontSize: '0.9375rem',
  } as React.CSSProperties,
};

export const GuardDashboard: React.FC<{ user: RBACUser }> = ({ user }) => {
  const societyId = user.societyId!;
  const { todaysMoves, loading: movesLoading } = useMoves(societyId);
  const { activeRenovations, loading: renLoading } = useRenovations(societyId, 'guard');

  if (movesLoading || renLoading) {
    return (
      <div style={styles.loadingText}>
        <span style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#dc2626', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        Loading Live Gate Data...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Gate Security Hub</h1>
            <p style={styles.headerSub}>Welcome, {user.name}</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            { label: "Today's Moves", value: todaysMoves.length },
            { label: 'Active Renos', value: activeRenovations.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ color: '#fca5a5', fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
              <div style={{ color: '#fecaca', fontSize: '0.6875rem', fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {/* Today's Moves */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.iconBox('#dc2626', '#fef2f2')}>
              <Truck size={16} />
            </div>
            <h2 style={styles.sectionTitle}>Today's Scheduled Moves</h2>
            {todaysMoves.length > 0 && (
              <span style={{ marginLeft: 'auto', ...styles.badge('#dc2626', '#fee2e2') }}>{todaysMoves.length}</span>
            )}
          </div>

          {todaysMoves.length === 0 ? (
            <div style={styles.emptyText}>
              <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <div>No moves scheduled for today</div>
            </div>
          ) : (
            todaysMoves.map((move, i) => (
              <div key={move.id} style={styles.listItem(i === todaysMoves.length - 1)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={16} color="#dc2626" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {move.residentName} · Flat {move.flatCode}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                      {move.type} · Vendor: {move.vendor.companyName}
                    </div>
                  </div>
                </div>
                <span style={styles.badge('#b45309', '#fffbeb')}>{move.status}</span>
              </div>
            ))
          )}
        </div>

        {/* Active Renovations */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.iconBox('#d97706', '#fffbeb')}>
              <HardHat size={16} />
            </div>
            <h2 style={styles.sectionTitle}>Active Renovations</h2>
            {activeRenovations.length > 0 && (
              <span style={{ marginLeft: 'auto', ...styles.badge('#d97706', '#fef3c7') }}>{activeRenovations.length}</span>
            )}
          </div>

          {activeRenovations.length === 0 ? (
            <div style={styles.emptyText}>
              <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <div>No active renovations inside the premises</div>
            </div>
          ) : (
            activeRenovations.map((ren, i) => (
              <div key={ren.id} style={styles.listItem(i === activeRenovations.length - 1)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HardHat size={16} color="#d97706" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>Flat {ren.flatCode}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                      {ren.contractor.companyName} · {ren.rules.allowedHoursStart}–{ren.rules.allowedHoursEnd}
                    </div>
                  </div>
                </div>
                <span style={styles.badge(ren.rules.allowWeekends ? '#15803d' : '#dc2626', ren.rules.allowWeekends ? '#f0fdf4' : '#fef2f2')}>
                  {ren.rules.allowWeekends ? 'Wknds OK' : 'No Wknds'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Visitors & Deliveries Placeholder */}
        <div style={{ ...styles.section, border: '1.5px dashed #e5e7eb', background: '#fafafa' }}>
          <div style={styles.sectionHeader}>
            <div style={styles.iconBox('#6b7280', '#f3f4f6')}>
              <Users size={16} />
            </div>
            <h2 style={{ ...styles.sectionTitle, color: '#9ca3af' }}>Visitors & Deliveries</h2>
          </div>
          <div style={{ ...styles.emptyText, paddingBottom: '1.5rem' }}>
            <Clock size={24} color="#d1d5db" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ color: '#d1d5db' }}>Live streams available via the Security tab</div>
          </div>
        </div>
      </div>
    </div>
  );
};
