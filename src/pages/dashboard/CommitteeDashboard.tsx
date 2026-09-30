import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  DollarSign,
  ShieldCheck,
  Activity,
  BookOpen,
  Users,
} from 'lucide-react';
import { UnifiedRequestCenter } from '../../domains/requests/components/UnifiedRequestCenter';
import { SocietyExpenseHub } from '../../domains/expenses';

export const CommitteeDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = (): 'approvals' | 'financials' | 'compliance' | 'health' | 'governance' => {
    if (location.pathname.includes('/financials')) return 'financials';
    if (location.pathname.includes('/compliance')) return 'compliance';
    if (location.pathname.includes('/health')) return 'health';
    if (location.pathname.includes('/governance')) return 'governance';
    return 'approvals';
  };

  const [activeTab, setActiveTab] = useState<'approvals' | 'financials' | 'compliance' | 'health' | 'governance'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const tabs = [
    { key: 'approvals', label: 'Approvals', icon: FileCheck, path: '/committee/approvals' },
    { key: 'financials', label: 'Financials', icon: DollarSign, path: '/committee/financials' },
    { key: 'compliance', label: 'Compliance', icon: ShieldCheck, path: '/committee/compliance' },
    { key: 'health', label: 'Health', icon: Activity, path: '/committee/health' },
    { key: 'governance', label: 'Governance', icon: BookOpen, path: '/committee/governance' },
  ] as const;

  const stats = [
    { label: 'Pending Approvals', value: '4', tab: 'approvals' as const, path: '/committee/approvals', color: '#D97706', bg: '#FFFBEB', icon: FileCheck },
    { label: 'Collection Rate', value: '94.2%', tab: 'financials' as const, path: '/committee/financials', color: '#059669', bg: '#ECFDF5', icon: DollarSign },
    { label: 'Society Health', value: '98/100', tab: 'health' as const, path: '/committee/health', color: '#7C3AED', bg: '#F5F3FF', icon: Activity },
    { label: 'Compliance Status', value: '✓ Verified', tab: 'compliance' as const, path: '/committee/compliance', color: '#176B91', bg: '#EBF5FA', icon: ShieldCheck },
  ];

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '0.75rem 0.5rem 5rem' }}>
      {/* ── Compact Aarizo Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
        padding: '0.875rem 1rem',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
        boxShadow: '0 4px 14px rgba(8,59,86,0.08)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
            <Users size={13} color="#83CBEA" />
            <p style={{ color: '#83CBEA', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              Executive Oversight
            </p>
          </div>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.125rem', margin: 0, letterSpacing: '-0.01em' }}>
            Management Committee
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: '0.15rem 0 0' }}>
            Financial approvals, compliance &amp; governance
          </p>
        </div>
        <span style={{
          background: 'rgba(131,203,234,0.2)', borderRadius: '20px',
          padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.72rem', fontWeight: 700, color: '#83CBEA', flexShrink: 0,
        }}>
          <ShieldCheck size={12} /> Committee
        </span>
      </div>

      <div>
        {/* ── Interactive 4-Card Stat Counters Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem', marginBottom: '0.75rem' }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            const isSelected = activeTab === s.tab;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveTab(s.tab);
                  navigate(s.path);
                }}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${s.color}` : '1px solid #DCE8EF',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 10px rgba(8,59,86,0.12)' : '0 2px 6px rgba(8,59,86,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56', lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#657785', fontWeight: 600, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                </div>
              </button>
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
                onClick={() => {
                  setActiveTab(tab.key);
                  navigate(tab.path);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.55rem 0.875rem',
                  borderRadius: '10px',
                  background: active ? '#083B56' : '#ffffff',
                  color: active ? '#ffffff' : '#657785',
                  fontWeight: 700, fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: active ? '0 2px 8px rgba(8,59,86,0.25)' : '0 1px 3px rgba(8,59,86,0.08)',
                  border: active ? 'none' : '1px solid #DCE8EF',
                }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {activeTab === 'approvals' && <UnifiedRequestCenter />}

        {activeTab === 'financials' && (
          <SocietyExpenseHub userRole="COMMITTEE_MEMBER" />
        )}

        {activeTab === 'compliance' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #EBF5FA' }}>
              <h3 style={{ fontWeight: 800, color: '#083B56', margin: 0, fontSize: '1rem' }}>Society Statutory Compliance Checklist</h3>
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { title: 'Fire Safety Audit 2026', status: 'VALID', statusColor: '#059669', statusBg: '#ECFDF5', date: 'Expires Dec 2026' },
                { title: 'Lift Safety Inspection', status: 'VALID', statusColor: '#059669', statusBg: '#ECFDF5', date: 'Expires Oct 2026' },
                { title: 'AGM Minutes Filed', status: 'SUBMITTED', statusColor: '#176B91', statusBg: '#EBF5FA', date: 'Filed Aug 2026' },
                { title: 'Water Tank Quality Cert', status: 'DUE SOON', statusColor: '#D97706', statusBg: '#FFFBEB', date: 'Renewal Due 30 Sep' },
              ].map((c, i) => (
                <div key={i} style={{
                  background: '#F7FBFE', borderRadius: '10px', border: '1px solid #DCE8EF',
                  padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#083B56', margin: 0, fontSize: '0.875rem' }}>{c.title}</p>
                    <p style={{ color: '#8B9AA5', fontSize: '0.75rem', margin: '0.15rem 0 0' }}>{c.date}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c.statusColor, background: c.statusBg, padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1.25rem', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <h3 style={{ fontWeight: 800, color: '#083B56', margin: '0 0 1rem', fontSize: '1rem' }}>Society Health &amp; Operational Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Complaint Resolution (24h)', value: '92%', color: '#059669', bg: '#ECFDF5' },
                { label: 'Resident Satisfaction', value: '4.8/5.0', color: '#176B91', bg: '#EBF5FA' },
              ].map((m, i) => (
                <div key={i} style={{ background: m.bg, borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#083B56', marginTop: '0.25rem', fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1.25rem', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <h3 style={{ fontWeight: 800, color: '#083B56', margin: '0 0 0.75rem', fontSize: '1rem' }}>Governance &amp; Bye-Laws Enforcement</h3>
            <p style={{ color: '#657785', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
              Model bye-laws are compliant. Digital voting &amp; notice management enabled. Society AGM proceedings archived digitally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteeDashboard;
