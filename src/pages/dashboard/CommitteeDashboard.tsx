import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileCheck,
  DollarSign,
  ShieldCheck,
  Activity,
  BookOpen,
  Users,
  UploadCloud,
  Download,
  Plus
} from 'lucide-react';
import { UnifiedRequestCenter } from '../../domains/requests/components/UnifiedRequestCenter';
import { SocietyExpenseHub } from '../../domains/expenses';
import { realtimeService } from '../../services/realtimeService';
import { FileUpload } from '../../components/ui/FileUpload';
import { Modal } from '../../components/ui/Modal';

export const CommitteeDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'AGM_MINUTES' | 'RESOLUTION' | 'BYE_LAWS' | 'AUDIT_REPORT'>('RESOLUTION');
  const [uploadedDocUrl, setUploadedDocUrl] = useState('');
  const [governanceDocs, setGovernanceDocs] = useState([
    { id: 'GD-1', title: 'AGM 2026 Annual General Meeting Minutes', category: 'AGM_MINUTES', date: '15 Aug 2026', url: '#' },
    { id: 'GD-2', title: 'Resolution 2026/04: EV Charging Tariff Approval', category: 'RESOLUTION', date: '28 Jul 2026', url: '#' },
    { id: 'GD-3', title: 'Model Bye-Laws Revision 5 Compliance Pack', category: 'BYE_LAWS', date: '10 Jan 2026', url: '#' },
  ]);

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

  useEffect(() => {
    const unsub = realtimeService.subscribe('*', (event) => {
      if (
        event.type === 'GOVERNANCE_DOC_UPLOADED' ||
        event.type === 'EXPENSE_APPROVED' ||
        event.type === 'EXPENSE_REJECTED' ||
        event.type === 'MOVE_REQUEST_UPDATED' ||
        event.type === 'RENOVATION_REQUEST_UPDATED'
      ) {
        if (event.type === 'GOVERNANCE_DOC_UPLOADED' && event.payload?.doc) {
          setGovernanceDocs(prev => [event.payload.doc, ...prev]);
        }
      }
    });
    return () => unsub();
  }, []);

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
        <div
          style={{
            background: '#EBF3F7',
            borderRadius: '16px',
            padding: '0.375rem',
            display: 'flex',
            gap: '0.375rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            boxShadow: 'inset 0 1px 3px rgba(8, 59, 86, 0.06)',
            marginBottom: '1.25rem',
          }}
        >
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '12px',
                  border: active ? 'none' : '1px solid #DCE8EF',
                  background: active ? 'var(--aarizo-navy, #083B56)' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 3px 10px rgba(8, 59, 86, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} color={active ? 'var(--aarizo-sky, #83CBEA)' : 'var(--aarizo-blue, #176B91)'} />
                <span>{tab.label}</span>
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
                { label: 'Submitted', value: '1', color: '#176B91', bg: '#EAF6FC' },
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
                { label: 'Society Health', value: '98/100', color: '#176B91', bg: '#EAF6FC' },
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
                { label: 'Digital Voting', value: 'Active', color: '#176B91', bg: '#EAF6FC' },
                { label: 'Disputes', value: '0 Open', color: '#059669', bg: '#ECFDF5' },
              ].map((g, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '0.875rem 1rem', boxShadow: '0 2px 8px rgba(8,59,86,0.03)' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: g.color, lineHeight: 1.1 }}>{g.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#657785', fontWeight: 600, marginTop: '0.2rem' }}>{g.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DCE8EF', padding: '1.25rem', boxShadow: '0 2px 10px rgba(8,59,86,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 800, color: '#083B56', margin: '0 0 0.25rem', fontSize: '0.9375rem' }}>Governance &amp; Bye-Laws Enforcement</h3>
                  <p style={{ color: '#657785', fontSize: '0.8125rem', margin: 0 }}>
                    Society operations strictly adhere to Model Cooperative Housing Society Bye-Laws.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  style={{
                    background: '#176B91',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.5rem 0.875rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>Upload Doc</span>
                </button>
              </div>

              {/* Document List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {governanceDocs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#EAF6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#176B91' }}>
                        <UploadCloud size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{doc.category} · {doc.date}</div>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#176B91',
                        textDecoration: 'none',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid #CBD5E1',
                      }}
                    >
                      <Download size={13} />
                      <span>View</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Document Modal */}
            <Modal
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              title="Upload Governance Document"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!docTitle) return;
                  const newDoc = {
                    id: `GD-${Date.now()}`,
                    title: docTitle,
                    category: docCategory,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    url: uploadedDocUrl || '#',
                  };
                  setGovernanceDocs((prev) => [newDoc, ...prev]);
                  realtimeService.publish({
                    type: 'GOVERNANCE_DOC_UPLOADED',
                    payload: { doc: newDoc },
                  });
                  setDocTitle('');
                  setUploadedDocUrl('');
                  setShowUploadModal(false);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Resolution 2026/05: Solar Rooftop Grid Tie"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8125rem', background: '#fff' }}
                  >
                    <option value="AGM_MINUTES">AGM Minutes</option>
                    <option value="RESOLUTION">Managing Committee Resolution</option>
                    <option value="BYE_LAWS">Society Bye-Laws</option>
                    <option value="AUDIT_REPORT">Financial Audit Report</option>
                  </select>
                </div>
                <div>
                  <FileUpload
                    label="Attach PDF or Certified Scan"
                    category="general"
                    onUploadSuccess={(url) => setUploadedDocUrl(url)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    style={{ padding: '0.5rem 0.875rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#176B91', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Save &amp; Publish
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteeDashboard;
