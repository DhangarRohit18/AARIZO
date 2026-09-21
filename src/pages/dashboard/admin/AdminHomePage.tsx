import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Wrench,
  Sparkles,
  HardHat,
  Calendar,
  Plus,
  List,
  Megaphone,
} from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Residents', path: '/admin/residents', icon: Users },
  { label: 'Complaints', path: '/admin/requests', icon: FileText },
  { label: 'Maintenance', path: '/admin/maintenance', icon: Wrench },
  { label: 'Amenities', path: '/admin/amenities', icon: Sparkles },
  { label: 'Staff', path: '/admin/staff', icon: HardHat },
  { label: 'Events', path: '/admin/community', icon: Calendar },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Visitor approved for A-204',
    time: '5 mins ago',
    icon: Users,
    color: '#3F8F58',
    bg: '#EDF8F0',
  },
  {
    id: 2,
    title: 'Maintenance paid by B-302',
    time: '20 mins ago',
    icon: Wrench,
    color: '#176B91',
    bg: '#EAF6FC',
  },
];

export const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* ── 1. Greeting Card (Screenshot match) ── */}
      <div
        style={{
          background: 'var(--aarizo-light-blue, #EAF6FC)',
          border: '1px solid var(--aarizo-border, #DCE8EF)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(8, 59, 86, 0.03)',
        }}
      >
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>Good Morning, Secretary</span>
            <span>👋</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.25rem 0 0' }}>
            Here's what's happening in your society today.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', color: 'var(--aarizo-text-secondary, #657785)' }}>
            <Calendar size={14} />
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginTop: '0.125rem' }}>
            07 Sept 2026
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
            Monday
          </div>
        </div>
      </div>

      {/* ── 2. Today's Announcements Card (Screenshot match) ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--aarizo-light-blue, #EAF6FC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--aarizo-blue, #176B91)',
            }}
          >
            <Megaphone size={18} />
          </div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
            Today's Announcements
          </h3>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-muted, #8B9AA5)', margin: '0 0 0.875rem 0' }}>
          No announcements for today.
        </p>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            onClick={() => navigate('/admin/community')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.875rem',
              background: 'var(--aarizo-navy, #083B56)',
              color: '#ffffff',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> New
          </button>
          <button
            onClick={() => navigate('/admin/community')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.875rem',
              background: 'var(--aarizo-light-blue, #EAF6FC)',
              color: 'var(--aarizo-navy, #083B56)',
              border: '1px solid var(--aarizo-border, #DCE8EF)',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <List size={14} /> All
          </button>
        </div>
      </div>

      {/* ── 3. Quick Actions 3x2 Grid (Screenshot match) ── */}
      <div>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: '0 0 0.75rem 0' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {QUICK_ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  borderRadius: '16px',
                  padding: '1.25rem 0.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.625rem',
                  boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
                  cursor: 'pointer',
                  minHeight: '94px',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    background: 'var(--aarizo-pale-blue, #F4FAFE)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--aarizo-navy, #083B56)',
                  }}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Recent Activity (Screenshot match) ── */}
      <div>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: '0 0 0.75rem 0' }}>
          Recent Activity
        </h2>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
            boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
            overflow: 'hidden',
          }}
        >
          {RECENT_ACTIVITIES.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                style={{
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderBottom: idx < RECENT_ACTIVITIES.length - 1 ? '1px solid var(--aarizo-border-soft, #E8F1F5)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: act.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: act.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--aarizo-text-muted, #8B9AA5)', marginTop: '0.125rem' }}>
                    {act.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
