import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePrototype } from '../../context/PrototypeContext';
import {
  UserCheck,
  Car,
  CreditCard,
  MessageSquare,
  Package,
  ShieldAlert,
  Bell,
  ChevronRight,
  Droplets,
  Shield,
  Trash2,
  Sparkles,
  Zap,
  Clock,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { ResidentParcelWidget } from '../../domains/deliveries/components/ResidentParcelWidget';
import { Skeleton, EmptyState, ErrorState } from '../common';
import {
  mockUrgentAlert,
  mockAnnouncements,
} from '../../mockData/residentHomeData';
import './resident.css';

const QUICK_ACTIONS = [
  { id: 'visitors', label: 'Visitors', icon: UserCheck, path: '/resident/visitors', color: '#0284c7', bg: '#f0f9ff' },
  { id: 'parking', label: 'Parking', icon: Car, path: '/resident/parking', color: '#0369a1', bg: '#e0f2fe' },
  { id: 'pay', label: 'Pay', icon: CreditCard, path: '/resident/billing', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'complaint', label: 'Complaint', icon: MessageSquare, path: '/resident/requests', color: '#d97706', bg: '#fffbeb' },
  { id: 'parcel', label: 'Parcel', icon: Package, path: '/resident/visitors', color: '#0284c7', bg: '#f0f9ff' },
  { id: 'sos', label: 'SOS', icon: ShieldAlert, path: '/resident/emergency', color: '#dc2626', bg: '#fef2f2' },
];

const SOCIETY_STATUS = [
  { label: 'Water', icon: Droplets, status: 'normal', statusText: 'Normal' },
  { label: 'Security', icon: Shield, status: 'good', statusText: 'Active' },
  { label: 'Garbage', icon: Trash2, status: 'normal', statusText: 'On time' },
  { label: 'Cleaning', icon: Sparkles, status: 'good', statusText: 'Done' },
  { label: 'Power', icon: Zap, status: 'warning', statusText: 'Outage at B2' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  good: { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' },
  normal: { bg: '#f0f9ff', text: '#0284c7', dot: '#38bdf8' },
  warning: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  alert: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
};

const PENDING_ACTIONS = [
  { id: 1, label: 'Parcel pickup at gate', type: 'parcel', path: '/resident/visitors', urgent: true },
  { id: 2, label: 'Maintenance bill due in 3 days', type: 'payment', path: '/resident/billing', urgent: false },
  { id: 3, label: 'Gym booking approval pending', type: 'request', path: '/resident/amenities', urgent: false },
];

const RECENT_ACTIVITY = [
  { id: 1, text: 'Rajesh Singh checked in — Visitor pass used', time: '2 min ago', icon: UserCheck, color: '#3b82f6' },
  { id: 2, text: 'Water tank cleaned — Maintenance complete', time: '1 hr ago', icon: CheckCircle2, color: '#0284c7' },
  { id: 3, text: 'Notice: Society AGM on 25 Sep at 6PM', time: '3 hrs ago', icon: AlertCircle, color: '#f59e0b' },
  { id: 4, text: 'Monthly levy auto-paid ₹2,400', time: 'Yesterday', icon: CreditCard, color: '#8b5cf6' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const ResidentHome: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { uiState } = usePrototype();
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Handle Prototype UI States
  if (uiState === 'loading') {
    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton height="60px" width="100%" />
        <Skeleton height="120px" width="100%" borderRadius="1rem" />
        <Skeleton height="160px" width="100%" borderRadius="1rem" />
        <Skeleton height="140px" width="100%" borderRadius="1rem" />
      </div>
    );
  }

  if (uiState === 'empty') {
    return (
      <div style={{ padding: '1.5rem' }}>
        <EmptyState
          title="All Clear Today"
          description="No expected visitors, no pending dues, no open tickets."
          actionLabel="Pre-approve a Guest"
          onAction={() => navigate('/resident/visitors')}
        />
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div style={{ padding: '1.5rem' }}>
        <ErrorState
          title="Could Not Load Feed"
          message="A connection error occurred. Please try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const firstName = currentUser?.name?.split(' ')[0] || 'Resident';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', backgroundColor: '#f8fafc', minHeight: '100%' }}>

      {/* ── Greeting Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          padding: '1.25rem 1rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background accent */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -10, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#e0f2fe', fontSize: '0.75rem', marginBottom: '0.125rem', fontWeight: 500 }}>{getGreeting()},</p>
            <h1 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, marginBottom: '0.25rem' }}>{firstName}</h1>
            <p style={{ color: '#bae6fd', fontSize: '0.6875rem', fontWeight: 500 }}>
              {currentUser?.flatDetails || 'Tower B · Flat 301 · Green Valley'}
            </p>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#38bdf8', borderRadius: '50%', border: '1.5px solid #0284c7' }} />
          </button>
        </div>
      </div>

      {/* ── Urgent Alert ── */}
      {mockUrgentAlert && !alertDismissed && (
        <div
          style={{
            margin: '0.75rem',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderLeft: '4px solid #f97316',
            borderRadius: '0.875rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
          }}
        >
          <AlertCircle size={18} style={{ color: '#f97316', flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#c2410c' }}>{mockUrgentAlert.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#9a3412', marginTop: '0.125rem' }}>{mockUrgentAlert.message}</div>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            style={{ color: '#fb923c', background: 'none', display: 'flex', padding: '0.25rem', minHeight: 32, minWidth: 32, alignItems: 'center', justifyContent: 'center' }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content area */}
      <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>

        {/* ── Quick Actions Grid ── */}
        <section>
          <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
            Quick Actions
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.625rem',
            }}
          >
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isSOS = action.id === 'sos';
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(action.path)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.875rem 0.5rem',
                    borderRadius: '0.875rem',
                    background: isSOS ? '#fef2f2' : '#ffffff',
                    border: isSOS ? '1px solid #fecaca' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    minHeight: 80,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'transform 0.1s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  aria-label={action.label}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: action.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} style={{ color: action.color }} />
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: isSOS ? '#dc2626' : '#44403c' }}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Live Society Status ── */}
        <section>
          <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
            Society Status
          </h2>
          <div className="scroll-x" style={{ paddingBottom: '0.25rem' }}>
            {SOCIETY_STATUS.map((item) => {
              const Icon = item.icon;
              const colors = STATUS_COLORS[item.status];
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.75rem 0.875rem',
                    borderRadius: '0.875rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    minWidth: 88,
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <Icon size={20} style={{ color: colors.text }} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#78716c' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.5625rem', color: colors.text, fontWeight: 600 }}>{item.statusText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Live Parcel Widget ── */}
        <ResidentParcelWidget />

        {/* ── Pending Actions ── */}
        {PENDING_ACTIONS.length > 0 && (
          <section>
            <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
              Action Required
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PENDING_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => navigate(action.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.875rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    minHeight: 52,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                  aria-label={action.label}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: action.urgent ? '#f59e0b' : '#3b82f6', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {action.label}
                  </span>
                  <ChevronRight size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Activity ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent Activity
            </h2>
            <button
              onClick={() => navigate('/resident/activity')}
              style={{ fontSize: '0.6875rem', color: '#0284c7', fontWeight: 700, background: 'none', display: 'flex', alignItems: 'center', gap: '2px', minHeight: 32 }}
            >
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            {RECENT_ACTIVITY.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.875rem',
                    borderBottom: index < RECENT_ACTIVITY.length - 1 ? '1px solid #f5f5f4' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `${item.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <Icon size={15} style={{ color: item.color }} />
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
        </section>

        {/* ── Society Announcements ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Announcements
            </h2>
            <button onClick={() => navigate('/resident/community')} style={{ fontSize: '0.6875rem', color: '#0284c7', fontWeight: 700, background: 'none', display: 'flex', alignItems: 'center', gap: '2px', minHeight: 32 }}>
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mockAnnouncements.slice(0, 2).map((ann, i) => (
              <div
                key={i}
                style={{ background: '#fff', borderRadius: '0.875rem', border: '1px solid #e8e2d8', padding: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <TrendingUp size={14} style={{ color: '#0284c7', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1c1917', marginBottom: '0.25rem' }}>
                      {'title' in ann ? (ann as { title: string }).title : String(ann)}
                    </div>
                    {'summary' in ann && (
                      <p style={{ fontSize: '0.75rem', color: '#78716c', margin: 0, lineHeight: 1.4 }}>
                        {(ann as { summary: string }).summary}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
