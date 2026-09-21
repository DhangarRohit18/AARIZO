import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  Calendar,
  Trash2,
  Zap,
  UserCheck,
  Settings,
} from 'lucide-react';
import { AssetComplianceHub } from '../../domains/compliance';
import { StaffShiftHub } from '../../domains/staff';
import { SocietyOperationsBoard } from '../../domains/utilities';

export const FacilityManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'maintenance' | 'shifts' | 'amc' | 'cleaning' | 'utilities'>('maintenance');

  const tabs = [
    { key: 'maintenance', label: 'Maintenance', icon: Wrench },
    { key: 'shifts', label: 'Staff Shifts', icon: Clock },
    { key: 'amc', label: 'AMC Contracts', icon: Calendar },
    { key: 'cleaning', label: 'Housekeeping', icon: Trash2 },
    { key: 'utilities', label: 'Utilities', icon: Zap },
  ] as const;

  const stats = [
    { label: 'Open Tickets', value: '7', color: '#D97706', bg: '#FFFBEB', icon: Wrench },
    { label: 'Staff On Duty', value: '18/20', color: '#059669', bg: '#ECFDF5', icon: UserCheck },
    { label: 'Active AMCs', value: '12', color: '#7C3AED', bg: '#F5F3FF', icon: Calendar },
    { label: 'Utility Status', value: 'OK', color: '#176B91', bg: '#EBF5FA', icon: Zap },
  ];

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* ── Aarizo Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Settings size={14} color="#83CBEA" />
            <p style={{ color: '#83CBEA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Facility Operations
            </p>
          </div>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Facility Manager Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Maintenance, staff shifts, AMC contracts &amp; utilities
          </p>
        </div>
        <span style={{
          background: 'rgba(255,183,77,0.2)', borderRadius: '20px',
          padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', fontWeight: 700, color: '#FBD38D', flexShrink: 0,
        }}>
          <Wrench size={13} /> FM Access
        </span>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF',
                padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(8,59,86,0.06)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56', lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#657785', lineHeight: 1.3 }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.55rem 0.875rem',
                  borderRadius: '10px', border: active ? 'none' : '1px solid #DCE8EF',
                  background: active ? '#083B56' : '#ffffff',
                  color: active ? '#ffffff' : '#657785',
                  fontWeight: 700, fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: active ? '0 2px 8px rgba(8,59,86,0.25)' : '0 1px 3px rgba(8,59,86,0.08)',
                }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {activeTab === 'maintenance' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #EBF5FA' }}>
              <h3 style={{ fontWeight: 800, color: '#083B56', margin: 0, fontSize: '1rem' }}>Assigned Maintenance Tasks</h3>
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'TKT-801', title: 'Elevator B2 Noise Inspection', assignedTo: 'Otis Elevator AMC', priority: 'HIGH', status: 'IN_PROGRESS', statusColor: '#D97706', statusBg: '#FFFBEB' },
                { id: 'TKT-802', title: 'Clubhouse AC Gas Refill', assignedTo: 'CoolCare Servicing', priority: 'MEDIUM', status: 'PENDING', statusColor: '#176B91', statusBg: '#EBF5FA' },
                { id: 'TKT-803', title: 'Basement P2 Lighting', assignedTo: 'Suresh Kumar (Electrician)', priority: 'LOW', status: 'COMPLETED', statusColor: '#059669', statusBg: '#ECFDF5' },
              ].map((t) => (
                <div key={t.id} style={{
                  background: '#F7FBFE', borderRadius: '10px', border: '1px solid #DCE8EF',
                  padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ flex: 1, marginRight: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: '#083B56', fontSize: '0.875rem' }}>{t.title}</span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '20px',
                        background: t.priority === 'HIGH' ? '#FEE2E2' : '#F1F5F9',
                        color: t.priority === 'HIGH' ? '#DC2626' : '#64748b',
                      }}>{t.priority}</span>
                    </div>
                    <p style={{ color: '#8B9AA5', fontSize: '0.75rem', margin: 0 }}>
                      {t.assignedTo} · #{t.id}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: t.statusColor, background: t.statusBg, padding: '0.25rem 0.6rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shifts' && <StaffShiftHub />}
        {activeTab === 'amc' && <AssetComplianceHub userRoleOverride="FACILITY_MANAGER" />}

        {activeTab === 'cleaning' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1.25rem', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <h3 style={{ fontWeight: 800, color: '#083B56', margin: '0 0 0.75rem', fontSize: '1rem' }}>Cleaning &amp; Waste Disposal Log</h3>
            <p style={{ color: '#657785', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
              Garbage collection completed for Towers A, B &amp; C at 09:30 AM. All common areas sanitized.
            </p>
          </div>
        )}

        {activeTab === 'utilities' && <SocietyOperationsBoard />}
      </div>
    </div>
  );
};

export default FacilityManagerDashboard;
