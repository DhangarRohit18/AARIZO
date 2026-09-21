import React, { useState } from 'react';
import {
  UserCheck, CreditCard, Wrench, Package, AlertCircle,
  CheckCircle2, Bell, Clock,
} from 'lucide-react';

const ALL_ACTIVITIES = [
  { id: 1, text: 'Rajesh Singh checked in — Visitor pass used', time: '2 min ago', icon: UserCheck, color: '#176B91', category: 'visitors' },
  { id: 2, text: 'Water tank maintenance completed', time: '1 hr ago', icon: CheckCircle2, color: '#3F8F58', category: 'maintenance' },
  { id: 3, text: 'Society AGM Notice: 25 Sep at 6PM, Club House', time: '3 hrs ago', icon: AlertCircle, color: '#D99A2B', category: 'notices' },
  { id: 4, text: 'Monthly maintenance levy auto-paid ₹2,400', time: 'Yesterday', icon: CreditCard, color: '#176B91', category: 'payments' },
  { id: 5, text: 'Plumbing repair request closed — Flat B-301', time: 'Yesterday', icon: Wrench, color: '#176B91', category: 'maintenance' },
  { id: 6, text: 'Parcel arrived at gate: Amazon — Pending pickup', time: '2 days ago', icon: Package, color: '#176B91', category: 'parcels' },
  { id: 7, text: 'Gym booking confirmed: Saturday 7AM - 8AM', time: '2 days ago', icon: CheckCircle2, color: '#3F8F58', category: 'amenities' },
  { id: 8, text: 'Priya Sharma left — Visitor stay: 2hrs 30min', time: '3 days ago', icon: UserCheck, color: '#176B91', category: 'visitors' },
  { id: 9, text: 'Power bill payment received: ₹1,850', time: '4 days ago', icon: CreditCard, color: '#176B91', category: 'payments' },
  { id: 10, text: 'Emergency alert: Lift malfunction in Tower A (resolved)', time: '5 days ago', icon: AlertCircle, color: '#D9535B', category: 'notices' },
];

const FILTERS = ['all', 'visitors', 'payments', 'maintenance', 'notices', 'parcels', 'amenities'];

export const ResidentActivityPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? ALL_ACTIVITIES
    : ALL_ACTIVITIES.filter((a) => a.category === activeFilter);

  return (
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%', paddingBottom: '1.5rem' }}>
      {/* ── Subheader ── */}
      <div style={{ background: 'var(--aarizo-light-blue, #EAF6FC)', borderBottom: '1px solid var(--aarizo-border, #DCE8EF)', padding: '1.25rem 1rem' }}>
        <h1 style={{ color: 'var(--aarizo-navy, #083B56)', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Activity Feed</h1>
        <p style={{ color: 'var(--aarizo-text-secondary, #657785)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>All recent events in your flat & society</p>
      </div>

      {/* Filter pills */}
      <div className="scroll-x" style={{ padding: '0.75rem 1rem', gap: '0.5rem' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '0.35rem 0.875rem',
              borderRadius: '9999px',
              background: activeFilter === f ? 'var(--aarizo-navy, #083B56)' : '#ffffff',
              color: activeFilter === f ? '#fff' : 'var(--aarizo-text-secondary, #657785)',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: activeFilter === f ? '1px solid var(--aarizo-navy, #083B56)' : '1px solid var(--aarizo-border, #DCE8EF)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 34,
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div style={{ padding: '0.25rem 1rem 1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
            <Bell size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.875rem' }}>No activity in this category</p>
          </div>
        ) : (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--aarizo-border-soft, #E8F1F5)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)' }}>
            {filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', borderBottom: index < filtered.length - 1 ? '1px solid var(--aarizo-border-soft, #E8F1F5)' : 'none' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--aarizo-light-blue, #EAF6FC)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text, #203746)', lineHeight: 1.4, margin: 0, fontWeight: 600 }}>{item.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Clock size={11} style={{ color: 'var(--aarizo-text-muted, #8B9AA5)' }} />
                      <span style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>{item.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentActivityPage;
