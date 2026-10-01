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

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '0.5rem 0 3rem' }}>
      {/* ── Compact Aarizo Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        boxShadow: '0 4px 16px rgba(8,59,86,0.08)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <Users size={14} color="#83CBEA" />
            <p style={{ color: '#83CBEA', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              Executive Oversight
            </p>
          </div>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0, letterSpacing: '-0.01em' }}>
            Management Committee
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78125rem', margin: '0.2rem 0 0' }}>
            Executive financial approvals, statutory compliance &amp; governance
          </p>
        </div>
        <span style={{
          background: 'rgba(131,203,234,0.2)', borderRadius: '20px',
          padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.75rem', fontWeight: 700, color: '#83CBEA', flexShrink: 0,
        }}>
          <ShieldCheck size={14} /> Committee
        </span>
      </div>

      <div>
        {/* ── Tabs Bar ── */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  navigate(tab.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  background: active ? '#083B56' : '#ffffff',
                  color: active ? '#ffffff' : '#657785',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: active ? '0 3px 10px rgba(8,59,86,0.25)' : '0 1px 4px rgba(8,59,86,0.06)',
                  border: active ? 'none' : '1px solid #DCE8EF',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {activeTab === 'approvals' && <UnifiedRequestCenter hideHeaderBanner={true} />}

        {activeTab === 'financials' && (
          <SocietyExpenseHub userRole="COMMITTEE_MEMBER" />
        )}

        {activeTab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 4 Compliance KPI Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Total Audits', value: '4', color: '#176B91', bg: '#EBF5FA' },
                { label: 'Valid Certs', value: '2', color: '#059669', bg: '#ECFDF5' },
                { label: 'Submitted', value: '1', color: '#7C3AED', bg: '#F5F3FF' },
                { label: 'Renewal Due', value: '1', color: '#D97706', bg: '#FFFBEB' },
              ].map((st, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '0.875rem 1rem', boxShadow: '0 2px 8px rgba(8,59,86,0.03)' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: st.color, lineHeight: 1.1 }}>{st.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#657785', fontWeight: 600, marginTop: '0.2rem' }}>{st.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DCE8EF', overflow: 'hidden', boxShadow: '0 2px 10px rgba(8,59,86,0.05)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #EBF5FA' }}>
                <h3 style={{ fontWeight: 800, color: '#083B56', margin: 0, fontSize: '0.9375rem' }}>Society Statutory Compliance Checklist</h3>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { title: 'Fire Safety Audit 2026', status: 'VALID', statusColor: '#059669', statusBg: '#ECFDF5', date: 'Expires Dec 2026' },
                  { title: 'Lift Safety Inspection', status: 'VALID', statusColor: '#059669', statusBg: '#ECFDF5', date: 'Expires Oct 2026' },
                  { title: 'AGM Minutes Filed', status: 'SUBMITTED', statusColor: '#176B91', statusBg: '#EBF5FA', date: 'Filed Aug 2026' },
                  { title: 'Water Tank Quality Cert', status: 'DUE SOON', statusColor: '#D97706', statusBg: '#FFFBEB', date: 'Renewal Due 30 Sep' },
                ].map((c, i) => (
                  <div key={i} style={{
                    background: '#F7FBFE', borderRadius: '12px', border: '1px solid #DCE8EF',
                    padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ fontWeight: 700, color: '#083B56', margin: 0, fontSize: '0.8125rem' }}>{c.title}</p>
                      <p style={{ color: '#8B9AA5', fontSize: '0.6875rem', margin: '0.15rem 0 0' }}>{c.date}</p>
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: c.statusColor, background: c.statusBg, padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 4 Health KPI Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Society Health', value: '98/100', color: '#7C3AED', bg: '#F5F3FF' },
                { label: 'Resolution (24h)', value: '92%', color: '#059669', bg: '#ECFDF5' },
                { label: 'Satisfaction', value: '4.8/5.0', color: '#176B91', bg: '#EBF5FA' },
                { label: 'Active Tickets', value: '2', color: '#D97706', bg: '#FFFBEB' },
              ].map((m, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '0.875rem 1rem', boxShadow: '0 2px 8px rgba(8,59,86,0.03)' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: m.color, lineHeight: 1.1 }}>{m.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#657785', fontWeight: 600, marginTop: '0.2rem' }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DCE8EF', padding: '1.25rem', boxShadow: '0 2px 10px rgba(8,59,86,0.05)' }}>
              <h3 style={{ fontWeight: 800, color: '#083B56', margin: '0 0 0.5rem', fontSize: '0.9375rem' }}>Society Operational Performance</h3>
              <p style={{ color: '#657785', fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
                All systems operating normally. Preventive maintenance scheduled for Tower B water filtration pumps on 5th Oct 2026.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 4 Governance KPI Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Model Bye-Laws', value: '100%', color: '#059669', bg: '#ECFDF5' },
                { label: 'AGM Minutes', value: 'Archived', color: '#176B91', bg: '#EBF5FA' },
                { label: 'Digital Voting', value: 'Active', color: '#7C3AED', bg: '#F5F3FF' },
                { label: 'Disputes', value: '0 Open', color: '#059669', bg: '#ECFDF5' },
              ].map((g, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '0.875rem 1rem', boxShadow: '0 2px 8px rgba(8,59,86,0.03)' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: g.color, lineHeight: 1.1 }}>{g.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#657785', fontWeight: 600, marginTop: '0.2rem' }}>{g.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DCE8EF', padding: '1.25rem', boxShadow: '0 2px 10px rgba(8,59,86,0.05)' }}>
              <h3 style={{ fontWeight: 800, color: '#083B56', margin: '0 0 0.5rem', fontSize: '0.9375rem' }}>Governance &amp; Bye-Laws Enforcement</h3>
              <p style={{ color: '#657785', fontSize: '0.8125rem', margin: 0, lineHeight: 1.5 }}>
                Society operations strictly adhere to Model Cooperative Housing Society Bye-Laws. Digital notice circulation and audit trail verification active.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteeDashboard;
