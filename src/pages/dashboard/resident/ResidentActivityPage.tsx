import React, { useState } from 'react';
import {
  UserCheck, CreditCard, Wrench, Package, AlertCircle,
  CheckCircle2, Bell, Clock, Filter,
} from 'lucide-react';

const ALL_ACTIVITIES = [
  { id: 1, text: 'Rajesh Singh checked in â€” Visitor pass used', time: '2 min ago', icon: UserCheck, color: '#3b82f6', category: 'visitors' },
  { id: 2, text: 'Water tank maintenance completed', time: '1 hr ago', icon: CheckCircle2, color: '#10b981', category: 'maintenance' },
  { id: 3, text: 'Society AGM Notice: 25 Sep at 6PM, Club House', time: '3 hrs ago', icon: AlertCircle, color: '#f59e0b', category: 'notices' },
  { id: 4, text: 'Monthly maintenance levy auto-paid â‚¹2,400', time: 'Yesterday', icon: CreditCard, color: '#8b5cf6', category: 'payments' },
  { id: 5, text: 'Plumbing repair request closed â€” Flat B-301', time: 'Yesterday', icon: Wrench, color: '#f97316', category: 'maintenance' },
  { id: 6, text: 'Parcel arrived at gate: Amazon â€” Pending pickup', time: '2 days ago', icon: Package, color: '#06b6d4', category: 'parcels' },
  { id: 7, text: 'Gym booking confirmed: Saturday 7AM - 8AM', time: '2 days ago', icon: CheckCircle2, color: '#22c55e', category: 'amenities' },
  { id: 8, text: 'Priya Sharma left â€” Visitor stay: 2hrs 30min', time: '3 days ago', icon: UserCheck, color: '#3b82f6', category: 'visitors' },
  { id: 9, text: 'Power bill payment received: â‚¹1,850', time: '4 days ago', icon: CreditCard, color: '#8b5cf6', category: 'payments' },
  { id: 10, text: 'Emergency alert: Lift malfunction in Tower A (resolved)', time: '5 days ago', icon: AlertCircle, color: '#ef4444', category: 'notices' },
];

const FILTERS = ['all', 'visitors', 'payments', 'maintenance', 'notices', 'parcels', 'amenities'];

export const ResidentActivityPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? ALL_ACTIVITIES
    : ALL_ACTIVITIES.filter((a) => a.category === activeFilter);

  return (
    <div style={{ backgroundColor: '#f7f4ee', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917, #292524)', padding: '1.25rem 1rem 1rem' }}>
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.125rem' }}>Activity</h1>
        <p style={{ color: '#78716c', fontSize: '0.75rem' }}>All recent events in your flat & society</p>
      </div>

      {/* Filter pills */}
      <div className="scroll-x" style={{ padding: '0.75rem', gap: '0.5rem' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '2rem',
              background: activeFilter === f ? '#1c1917' : '#ffffff',
              color: activeFilter === f ? '#fff' : '#78716c',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: activeFilter === f ? '1px solid #1c1917' : '1px solid #e8e2d8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 36,
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
        <Filter size={14} style={{ color: '#a8a29e', alignSelf: 'center', flexShrink: 0 }} />
      </div>

      {/* Activity list */}
      <div style={{ padding: '0 0.75rem 1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#a8a29e' }}>
            <Bell size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.875rem' }}>No activity in this category</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e8e2d8', overflow: 'hidden' }}>
            {filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem', borderBottom: index < filtered.length - 1 ? '1px solid #f5f5f4' : 'none' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', color: '#292524', lineHeight: 1.4, margin: 0 }}>{item.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Clock size={10} style={{ color: '#a8a29e' }} />
                      <span style={{ fontSize: '0.6875rem', color: '#a8a29e' }}>{item.time}</span>
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

