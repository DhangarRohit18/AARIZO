import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Wrench,
  Clock,
  ClipboardList,
  Zap,
  Hammer,
  Phone,
  Mail,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  CheckCircle2,
  Building2,
  Calendar,
} from 'lucide-react';

export const FacilityProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const quickNav = [
    { label: 'Staff Shifts & Roster', icon: Clock, path: '/facility/tasks', desc: '18 staff on duty today' },
    { label: 'Maintenance Tickets', icon: Wrench, path: '/facility/maintenance', desc: '7 open work orders' },
    { label: 'AMC & Asset Compliance', icon: ClipboardList, path: '/facility/amc', desc: '12 active contracts' },
    { label: 'Utilities & Power Ops', icon: Zap, path: '/facility/utilities', desc: 'Water, DG, STP status' },
    { label: 'Cleaning & Waste Logs', icon: Hammer, path: '/facility/cleaning', desc: 'Daily sanitization records' },
    { label: 'Notification Center', icon: Bell, path: '/notifications', desc: 'System alerts & dispatches' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%' }} className="p-3 sm:p-6 max-w-5xl mx-auto pb-24 font-sans text-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column (5 cols on desktop): Profile & Contact */}
        <div className="md:col-span-5 space-y-4">
          {/* Facility Manager Profile Header Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              padding: '1.5rem 1rem',
              boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'var(--aarizo-light-blue, #EAF6FC)',
                border: '2px solid var(--aarizo-border, #DCE8EF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--aarizo-navy, #083B56)',
                fontWeight: 900,
                fontSize: '1.75rem',
              }}
            >
              {(currentUser?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
                {currentUser?.name || 'Suresh Patil'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.25rem 0 0', fontWeight: 500 }}>
                Facility & Operations Manager
              </p>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ECFDF5',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  <CheckCircle2 size={12} /> Verified FM
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#176B91',
                    background: '#EAF6FC',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    border: '1px solid #DCE8EF',
                  }}
                >
                  <Shield size={12} /> Operations Lead
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              padding: '1.25rem',
              boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B9AA5', margin: 0 }}>
              Contact Information
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EAF6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#176B91', flexShrink: 0 }}>
                <Phone size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8B9AA5', fontWeight: 600 }}>Official Phone</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#083B56' }}>+91 98112 23344</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EAF6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#176B91', flexShrink: 0 }}>
                <Mail size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8B9AA5', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#083B56' }}>facility@greenvalley.com</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EAF6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#176B91', flexShrink: 0 }}>
                <Calendar size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8B9AA5', fontWeight: 600 }}>Employee Code</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#083B56' }}>FM-GVS-2024-01</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols on desktop): Coverage & Navigation */}
        <div className="md:col-span-7 space-y-4">
          {/* Operational Shift & Scope */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              padding: '1.25rem',
              boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
            }}
          >
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B9AA5', margin: '0 0 0.75rem' }}>
              Duty &amp; Coverage
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div style={{ background: '#F7FBFE', border: '1px solid #DCE8EF', borderRadius: '12px', padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#176B91', marginBottom: '0.25rem' }}>
                  <Clock size={14} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Active Shift</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#083B56' }}>09:00 AM - 06:00 PM</div>
                <div style={{ fontSize: '0.7rem', color: '#657785' }}>General Shift A</div>
              </div>
              <div style={{ background: '#F7FBFE', border: '1px solid #DCE8EF', borderRadius: '12px', padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', marginBottom: '0.25rem' }}>
                  <Building2 size={14} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Assigned Society</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#083B56' }}>Green Valley</div>
                <div style={{ fontSize: '0.7rem', color: '#657785' }}>Towers A, B, C &amp; Club</div>
              </div>
            </div>
          </div>

          {/* Operational Functions Navigation */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
            }}
          >
            <div style={{ padding: '0.875rem 1rem 0.5rem', borderBottom: '1px solid #EBF5FA' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8B9AA5', margin: 0 }}>
                Operational Management Hub
              </h4>
            </div>
            <div>
              {quickNav.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(item.path)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      border: 'none',
                      borderBottom: idx < quickNav.length - 1 ? '1px solid #F1F5F9' : 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    className="hover:bg-slate-50 transition"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#F4FAFE', border: '1px solid #DCE8EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#176B91', flexShrink: 0 }}>
                        <Icon size={17} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#083B56' }}>{item.label}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#8B9AA5' }}>{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="#8B9AA5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '14px',
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
            className="hover:bg-red-100 transition"
          >
            <LogOut size={16} /> Sign Out of Facility Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilityProfilePage;
