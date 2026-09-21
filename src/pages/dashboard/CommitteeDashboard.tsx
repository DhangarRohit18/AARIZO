import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'approvals' | 'financials' | 'compliance' | 'health' | 'governance'>('approvals');

  const tabs = [
    { key: 'approvals', label: 'Approvals', icon: FileCheck },
    { key: 'financials', label: 'Financials', icon: DollarSign },
    { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { key: 'health', label: 'Health', icon: Activity },
    { key: 'governance', label: 'Governance', icon: BookOpen },
  ] as const;

  const stats = [
    { label: 'Pending Approvals', value: '4', color: '#D97706', bg: '#FFFBEB', icon: FileCheck },
    { label: 'Collection Rate', value: '94.2%', color: '#059669', bg: '#ECFDF5', icon: DollarSign },
    { label: 'Society Health', value: '98/100', color: '#7C3AED', bg: '#F5F3FF', icon: Activity },
    { label: 'Compliance', value: '✓', color: '#176B91', bg: '#EBF5FA', icon: ShieldCheck },
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
            <Users size={14} color="#83CBEA" />
            <p style={{ color: '#83CBEA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Executive Oversight
            </p>
          </div>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Management Committee
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Financial approvals, compliance &amp; governance
          </p>
        </div>
        <span style={{
          background: 'rgba(131,203,234,0.2)', borderRadius: '20px',
          padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', fontWeight: 700, color: '#83CBEA', flexShrink: 0,
        }}>
          <ShieldCheck size={13} /> Committee
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
