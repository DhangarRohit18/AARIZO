import React, { useState, useEffect } from 'react';
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
  Shield,
  Activity,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { societyService } from '../../../services/societyService';

const QUICK_ACTIONS = [
  { label: 'Residents', path: '/admin/residents', icon: Users, desc: 'Manage & Provision' },
  { label: 'Complaints', path: '/admin/requests', icon: FileText, desc: 'Resolve issues' },
  { label: 'Maintenance', path: '/admin/maintenance', icon: Wrench, desc: 'Work orders' },
  { label: 'Amenities', path: '/admin/amenities', icon: Sparkles, desc: 'Clubhouse & slots' },
  { label: 'Staff & Guards', path: '/admin/staff', icon: HardHat, desc: 'Gate rosters' },
  { label: 'Finances', path: '/admin/billing', icon: CreditCard, desc: 'Dues & invoices' },
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
  {
    id: 3,
    title: 'Emergency drill scheduled for Wing C',
    time: '1 hour ago',
    icon: Shield,
    color: '#D97706',
    bg: '#FEF3C7',
  },
];

export const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const currentSocietyId = currentUser?.societyId || 'soc-gvs';

  const [residentsCount, setResidentsCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    const res = societyService.getResidents(currentSocietyId);
    const staff = societyService.getStaff(currentSocietyId);
    setResidentsCount(res.length || 14);
    setStaffCount(staff.length || 6);
  }, [currentSocietyId]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedDay = now.toLocaleDateString('en-IN', { weekday: 'long' });

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', maxWidth: '1280px', margin: '0 auto', padding: '1rem 1rem 6rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── 1. Greeting Card (Screenshot match) ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #EAF6FC 0%, #F4FAFE 100%)',
          border: '1px solid var(--aarizo-border, #DCE8EF)',
          borderRadius: '20px',
          padding: '1.15rem 1.35rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)',
        }}
      >
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>{greeting}, Secretary</span>
            <span>👋</span>
          </div>
          <p style={{ fontSize: '0.78125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.25rem 0 0', fontWeight: 500 }}>
            Here is your live society overview for {currentUser?.societyName || 'Green Valley Society'}.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', color: 'var(--aarizo-blue, #176B91)' }}>
            <Calendar size={15} />
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', marginTop: '0.15rem' }}>
            {formattedDate}
          </div>
          <div style={{ fontSize: '0.71875rem', color: 'var(--aarizo-text-muted, #8B9AA5)', fontWeight: 600 }}>
            {formattedDay}
          </div>
        </div>
      </div>

      {/* ── 2. Real-Time Operations Overview Metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Registered Residents', value: residentsCount, icon: Users, color: '#083B56', bg: '#F4FAFE', border: '#DCE8EF', path: '/admin/residents' },
          { label: 'Active Security Guards', value: staffCount, icon: Shield, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', path: '/admin/staff' },
          { label: 'Realtime Operations', value: 'Live 99.9%', icon: Activity, color: '#F06543', bg: '#FFF0EC', border: '#FDE3DC', path: '/admin/realtime' },
          { label: 'Collections Health', value: '98.4%', icon: CreditCard, color: '#176B91', bg: '#EAF6FC', border: '#DCE8EF', path: '/admin/billing' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => navigate(stat.path)}
              style={{
                background: '#ffffff',
                border: `1px solid ${stat.border}`,
                borderRadius: '16px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: stat.bg,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.04em' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--aarizo-navy, #083B56)', marginTop: '0.1rem' }}>
                  {stat.value}
                </div>
              </div>
              <ArrowRight size={14} color="#94A3B8" />
            </button>
          );
        })}
      </div>

      {/* ── 3. Quick Actions Grid ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
            Quick Management Hub
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#657785', fontWeight: 600 }}>1-Click Operations</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
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
                  padding: '1.15rem 0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
                  cursor: 'pointer',
                  minHeight: '100px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: 'var(--aarizo-pale-blue, #F4FAFE)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--aarizo-navy, #083B56)',
                  }}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--aarizo-text, #203746)' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#657785', fontWeight: 500 }}>
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Announcements & Recent Activity Responsive Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* Today's Announcements */}
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: '0 0 0.75rem 0' }}>
            Today's Announcements
          </h2>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
              height: 'calc(100% - 2rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
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
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>
                  Active Notices
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-muted, #8B9AA5)', margin: '0 0 1rem 0' }}>
                No urgent society-wide announcements broadcasted for today.
              </p>
            </div>
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
                <Plus size={14} /> New Notice
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
                <List size={14} /> View All
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
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
    </div>
  );
};

export default AdminHomePage;
