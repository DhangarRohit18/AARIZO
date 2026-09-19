import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, AlertCircle, Clock, TrendingUp, Users,
  Car, CreditCard, Zap, BarChart3, ShieldAlert, ChevronRight,
} from 'lucide-react';

const METRIC_CARDS = [
  { label: 'Pending Approvals', value: '7', icon: CheckSquare, color: '#f59e0b', bg: '#fffbeb', path: '/admin/residents', trend: '+2 today' },
  { label: 'Open Complaints', value: '12', icon: AlertCircle, color: '#ef4444', bg: '#fef2f2', path: '/admin/requests', trend: '3 SLA breach' },
  { label: 'SLA Breaches', value: '3', icon: Clock, color: '#dc2626', bg: '#fef2f2', path: '/admin/intelligence', trend: 'Critical' },
  { label: 'AMC Expiring', value: '2', icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff', path: '/admin/compliance', trend: 'Next 30 days' },
  { label: 'Staff Present', value: '18/23', icon: Users, color: '#10b981', bg: '#f0fdf4', path: '/admin/staff', trend: '78% attendance' },
  { label: 'Parking Violations', value: '4', icon: Car, color: '#f97316', bg: '#fff7ed', path: '/admin/parking', trend: 'This week' },
  { label: 'Payments Due', value: 'â‚¹1.2L', icon: CreditCard, color: '#3b82f6', bg: '#eff6ff', path: '/admin/billing', trend: '14 residents' },
  { label: 'Active Outages', value: '1', icon: Zap, color: '#f59e0b', bg: '#fffbeb', path: '/admin/realtime', trend: 'Tower B power' },
];

const QUICK_ADMIN = [
  { label: 'Residents', path: '/admin/residents', icon: Users, color: '#3b82f6' },
  { label: 'Billing', path: '/admin/billing', icon: CreditCard, color: '#10b981' },
  { label: 'Security', path: '/admin/security-audit', icon: ShieldAlert, color: '#ef4444' },
  { label: 'Analytics', path: '/admin/intelligence', icon: BarChart3, color: '#8b5cf6' },
];

export const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f7f4ee', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1c1917, #292524)', padding: '1.25rem 1rem 1.5rem' }}>
        <p style={{ color: '#a8a29e', fontSize: '0.75rem' }}>Society Operations</p>
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Admin Overview</h1>
        <p style={{ color: '#78716c', fontSize: '0.6875rem' }}>Green Valley Housing Society</p>
      </div>

      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Quick access buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {QUICK_ADMIN.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '0.875rem 0.25rem', borderRadius: '0.875rem', background: '#fff', border: '1px solid #e8e2d8', cursor: 'pointer', minHeight: 72 }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#44403c' }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Metric cards */}
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
            Operational Status
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
            {METRIC_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  onClick={() => navigate(card.path)}
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.875rem', borderRadius: '0.875rem', background: '#fff', border: '1px solid #e8e2d8', cursor: 'pointer', textAlign: 'left', minHeight: 90, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  aria-label={`${card.label}: ${card.value}`}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} style={{ color: card.color }} />
                    </div>
                    <ChevronRight size={14} style={{ color: '#d6d3d1' }} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.375rem', color: card.color, lineHeight: 1 }}>{card.value}</div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#78716c', marginTop: '0.25rem' }}>{card.label}</div>
                  <div style={{ fontSize: '0.5625rem', color: '#a8a29e', marginTop: '0.125rem' }}>{card.trend}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent operations */}
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
            Recent Operations
          </h2>
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e8e2d8', overflow: 'hidden' }}>
            {[
              { text: 'Move-in request: Flat C-504 approved', time: '15 min ago', color: '#10b981' },
              { text: 'Vendor contract: AquaFresh renewal due', time: '2 hrs ago', color: '#f59e0b' },
              { text: 'Complaint #1047 escalated to SLA breach', time: '3 hrs ago', color: '#ef4444' },
              { text: 'Parking: Unauthorized vehicle in B-22 flagged', time: '4 hrs ago', color: '#f97316' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem', borderBottom: i < arr.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', color: '#292524', lineHeight: 1.4, margin: 0 }}>{item.text}</p>
                  <span style={{ fontSize: '0.6875rem', color: '#a8a29e' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

