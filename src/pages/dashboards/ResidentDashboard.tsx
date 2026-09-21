import React from 'react';
import { useComplaints } from '../../domains/complaints/services/useComplaints';
import { useMoves } from '../../domains/moves/services/useMoves';
import { useRenovations } from '../../domains/renovations/services/useRenovations';
import type { RBACUser } from '../../types/rbac';
import { MessageSquare, Package, HardHat, ClipboardList } from 'lucide-react';

const S = {
  page: { minHeight: '100%', background: '#f7f8fa', paddingBottom: '1.5rem' } as React.CSSProperties,
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    padding: '1.25rem 1rem 1.5rem',
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  name: { color: '#fff', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', margin: 0 } as React.CSSProperties,
  sub: { color: '#94a3b8', fontSize: '0.8125rem', marginTop: '0.2rem' } as React.CSSProperties,
  content: { padding: '1rem' } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: '1rem',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    marginBottom: '0.875rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  } as React.CSSProperties,
  cardHead: {
    display: 'flex', alignItems: 'center', gap: '0.625rem',
    padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9',
  } as React.CSSProperties,
  cardTitle: { fontWeight: 700, fontSize: '0.9375rem', color: '#111827', margin: 0, flex: 1 } as React.CSSProperties,
  row: (last: boolean) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    borderBottom: last ? 'none' : '1px solid #f1f5f9',
  } as React.CSSProperties),
  iconBox: (color: string, bg: string) => ({
    width: 32, height: 32, borderRadius: 8,
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color, flexShrink: 0,
  } as React.CSSProperties),
  badge: (color: string, bg: string) => ({
    padding: '0.2rem 0.5rem', borderRadius: 20,
    fontSize: '0.6875rem', fontWeight: 700,
    color, background: bg, flexShrink: 0,
  } as React.CSSProperties),
  empty: {
    padding: '1.25rem 1rem', textAlign: 'center' as const,
    color: '#9ca3af', fontSize: '0.875rem',
  } as React.CSSProperties,
  btn: (color: string, bg: string) => ({
    padding: '0.375rem 0.75rem', borderRadius: 8,
    background: bg, color, fontWeight: 700,
    fontSize: '0.8125rem', flexShrink: 0, border: 'none', cursor: 'pointer',
  } as React.CSSProperties),
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', padding: '3rem 1rem',
    color: '#6b7280', fontSize: '0.9375rem',
  } as React.CSSProperties,
};

export const ResidentDashboard: React.FC<{ user: RBACUser }> = ({ user }) => {
  const societyId = user.societyId!;
  const residentId = user.id;

  const { complaints, loading: compLoading } = useComplaints(societyId);
  const myComplaints = complaints.filter(c => c.residentId === residentId);

  const { activeResidentMoves, loading: movesLoading } = useMoves(societyId, residentId);
  const { activeRenovations, pendingApprovals: renPending, loading: renLoading } = useRenovations(societyId, 'resident', residentId);

  const loading = compLoading || movesLoading || renLoading;
  const allResidentRenovations = [...activeRenovations, ...renPending];

  if (loading) {
    return (
      <div style={S.loading}>
        <span style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        Syncing your household data...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ position: 'absolute', top: -24, right: -24, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 0.125rem' }}>My Dashboard</p>
        <h1 style={S.name}>Welcome back, {user.name?.split(' ')[0] || 'Resident'}</h1>
        <p style={S.sub}>Flat {user.flatDetails || 'N/A'}</p>

        {/* Quick stat badges */}
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Open Tickets', value: myComplaints.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
            { label: 'Active Moves', value: activeResidentMoves.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
            { label: 'Renovations', value: allResidentRenovations.length, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: '0.5rem 0.75rem' }}>
              <div style={{ color, fontWeight: 800, fontSize: '1.125rem', lineHeight: 1 }}>{value}</div>
              <div style={{ color, opacity: 0.8, fontSize: '0.625rem', fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.content}>
        {/* Visitors & Parcels placeholder */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
          {[
            { label: 'My Visitors', icon: ClipboardList, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'My Parcels', icon: Package, color: '#8b5cf6', bg: '#f5f3ff' },
          ].map(({ label, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: '1rem', border: `1px dashed ${color}30`, padding: '1rem', textAlign: 'center' }}>
              <Icon size={24} color={color} style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color }}>{label}</div>
              <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: 4 }}>Use Visitors tab</div>
            </div>
          ))}
        </div>

        {/* My Complaints */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.iconBox('#dc2626', '#fef2f2')}><MessageSquare size={15} /></div>
            <h2 style={S.cardTitle}>My Complaints</h2>
            {myComplaints.length > 0 && <span style={S.badge('#dc2626', '#fee2e2')}>{myComplaints.length}</span>}
          </div>
          {myComplaints.length === 0 ? (
            <div style={S.empty}>No active complaints ✓</div>
          ) : (
            myComplaints.map((comp, i) => (
              <div key={comp.id} style={S.row(i === myComplaints.length - 1)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.title}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: 2 }}>Category: {comp.category}</div>
                </div>
                <span style={{
                  marginLeft: '0.75rem',
                  ...S.badge(
                    comp.status === 'OPEN' || comp.status === 'ESCALATED' ? '#dc2626' : comp.status === 'IN_PROGRESS' || comp.status === 'ASSIGNED' ? '#d97706' : '#15803d',
                    comp.status === 'OPEN' || comp.status === 'ESCALATED' ? '#fee2e2' : comp.status === 'IN_PROGRESS' || comp.status === 'ASSIGNED' ? '#fffbeb' : '#f0fdf4',
                  )
                }}>{comp.status.replace('_', ' ')}</span>
              </div>
            ))
          )}
        </div>

        {/* My Move Requests */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.iconBox('#2563eb', '#eff6ff')}><Package size={15} /></div>
            <h2 style={S.cardTitle}>My Move Requests</h2>
            {activeResidentMoves.length > 0 && <span style={S.badge('#2563eb', '#dbeafe')}>{activeResidentMoves.length}</span>}
          </div>
          {activeResidentMoves.length === 0 ? (
            <div style={S.empty}>No active moves</div>
          ) : (
            activeResidentMoves.map((move, i) => (
              <div key={move.id} style={S.row(i === activeResidentMoves.length - 1)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                    {move.type} — {new Date(move.date).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: 2 }}>Lift Slot: {move.timeSlot}</div>
                </div>
                <span style={{ marginLeft: '0.75rem', ...S.badge('#7c3aed', '#f5f3ff') }}>{move.status}</span>
              </div>
            ))
          )}
        </div>

        {/* My Renovations */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.iconBox('#d97706', '#fffbeb')}><HardHat size={15} /></div>
            <h2 style={S.cardTitle}>My Renovations</h2>
            {allResidentRenovations.length > 0 && <span style={S.badge('#d97706', '#fef3c7')}>{allResidentRenovations.length}</span>}
          </div>
          {allResidentRenovations.length === 0 ? (
            <div style={S.empty}>No ongoing renovations</div>
          ) : (
            allResidentRenovations.map((ren, i) => (
              <div key={ren.id} style={S.row(i === allResidentRenovations.length - 1)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                    {ren.contractor.companyName}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: 2 }}>
                    {new Date(ren.startDate).toLocaleDateString()} – {new Date(ren.endDate).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ marginLeft: '0.75rem', ...S.badge('#15803d', '#f0fdf4') }}>{ren.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
