import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import { realtimeService } from '../../../services/realtimeService';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { INITIAL_COMMITTEE_ROSTER } from '../../../domains/secretary/states';
import type { CommitteeMemberRecord } from '../../../domains/secretary/types';

export const CommitteeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<CommitteeMemberRecord[]>(INITIAL_COMMITTEE_ROSTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Executive Committee Member');
  const [flatNumber, setFlatNumber] = useState('B-101');
  const [phone, setPhone] = useState('+91 98000 00000');
  const [email, setEmail] = useState('');
  const [termDuration, setTermDuration] = useState('2025–2027');

  const loadData = async () => {
    try {
      const apiMembers = await apiClient.getCommitteeMembers();
      if (apiMembers && Array.isArray(apiMembers) && apiMembers.length > 0) {
        const mapped: CommitteeMemberRecord[] = apiMembers.map((m: any, idx: number) => ({
          id: m.id || `cm-${idx}`,
          name: m.user?.name || m.name || 'Committee Officer',
          designation: m.metadata?.committeeDesignation || m.designation || 'Executive Member',
          flatNumber: m.flatNumber || 'B-1204',
          blockWing: 'Block B',
          canonicalDisplay: `${m.user?.name || m.name} (${m.flatNumber || 'B-1204'})`,
          phone: m.user?.phone || m.phone || '+91 98000 00000',
          email: m.user?.email || m.email || 'committee@aarizo.com',
          termDuration: '2025–2027',
          avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + (idx * 37)}?w=150&auto=format&fit=crop&q=80`,
        }));
        // Merge without losing initial roster
        setMembers((prev) => {
          const ids = new Set(prev.map(p => p.name.toLowerCase()));
          const newOnes = mapped.filter(p => !ids.has(p.name.toLowerCase()));
          return [...prev, ...newOnes];
        });
      }
    } catch (err) {
      console.warn('Fallback to local committee roster:', err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = realtimeService.subscribe('*', (event) => {
      if (event.type === 'COMMITTEE_MEMBER_ADDED') {
        loadData();
      }
    });
    return () => unsub();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const newRecord: CommitteeMemberRecord = {
      id: `cm-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      designation: designation as any,
      flatNumber: flatNumber.trim(),
      blockWing: 'Block B',
      canonicalDisplay: `${name.trim()} (${flatNumber.trim()})`,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@society.aarizo.com`,
      termDuration: termDuration.trim(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80`,
    };

    try {
      await apiClient.createCommitteeMember({
        societyId: 'soc-gvs',
        name: newRecord.name,
        email: newRecord.email,
        phone: newRecord.phone,
        designation: newRecord.designation,
        flatNumber: newRecord.flatNumber,
      });
    } catch (err) {
      console.warn('API error, saving locally:', err);
    }

    setMembers((prev) => [newRecord, ...prev]);

    realtimeService.publish('COMMITTEE_MEMBER_ADDED', {
      member: newRecord,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setSuccessToast(`Successfully added ${newRecord.name} as ${newRecord.designation}!`);
    setTimeout(() => setSuccessToast(null), 5000);

    setName('');
    setEmail('');
    setPhone('+91 98000 00000');
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q) ||
      m.flatNumber.toLowerCase().includes(q) ||
      m.phone.includes(q);

    const matchesFilter =
      designationFilter === 'ALL' ||
      (designationFilter === 'OFFICERS' && ['Society Chairman', 'Secretary', 'Treasurer'].includes(m.designation)) ||
      (designationFilter === 'MEMBERS' && !['Society Chairman', 'Secretary', 'Treasurer'].includes(m.designation));

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: '6rem' }}>
      {/* ── Page Hero Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          padding: '1.25rem 1rem 1.5rem',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <button
                  onClick={() => navigate('/admin')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px',
                    color: '#ffffff',
                    display: 'flex',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={16} />
                </button>
                <span style={{ color: 'var(--aarizo-gold, #E5B842)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Society Administration & Governance
                </span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                Managing Committee Management
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.85)', margin: '0.25rem 0 0' }}>
                Provision elected officers, assign portfolios & manage governing body access
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                background: 'var(--aarizo-coral, #F06543)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8125rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(240, 101, 67, 0.35)',
              }}
            >
              <UserPlus size={16} />
              <span>Add Committee Member</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)' }}>Total Members</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>{members.length}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)' }}>Elected Officers</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px', color: '#86EFAC' }}>3 Active</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)' }}>Tenure Period</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px', color: '#FDE047' }}>2025–2027</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)' }}>Governance Status</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px', color: '#93C5FD' }}>Registered</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        {successToast && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              color: '#166534',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              background: '#ffffff',
              border: '1px solid var(--aarizo-border, #DCE8EF)',
              borderRadius: '12px',
              padding: '0 0.875rem',
              height: '46px',
              boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)',
            }}
          >
            <Search size={18} color="var(--aarizo-text-secondary, #657785)" />
            <input
              type="text"
              placeholder="Search committee member by name, designation, flat or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.8125rem',
                color: 'var(--aarizo-text, #203746)',
                background: 'transparent',
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              { id: 'ALL', label: `All Members (${members.length})` },
              { id: 'OFFICERS', label: 'Primary Officers' },
              { id: 'MEMBERS', label: 'Executive Committee' },
            ].map((tab) => {
              const isActive = designationFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDesignationFilter(tab.id)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: isActive ? 'var(--aarizo-coral, #F06543)' : 'var(--aarizo-border, #DCE8EF)',
                    background: isActive ? 'var(--aarizo-coral, #F06543)' : '#ffffff',
                    color: isActive ? '#ffffff' : 'var(--aarizo-text, #203746)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Member Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
                borderTop: ['Society Chairman', 'Secretary', 'Treasurer'].includes(m.designation)
                  ? '3px solid var(--aarizo-coral, #F06543)'
                  : '3px solid var(--aarizo-blue, #176B91)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #E2E8F0',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.name}
                    </h3>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: 'var(--aarizo-light-blue, #EAF6FC)',
                        color: 'var(--aarizo-blue, #176B91)',
                      }}
                    >
                      {m.designation}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78125rem', color: '#475569', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Assigned Unit:</span>
                  <span style={{ fontWeight: 700, color: '#083B56' }}>{m.flatNumber}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Phone:</span>
                  <a href={`tel:${m.phone}`} style={{ fontWeight: 600, color: 'var(--aarizo-blue, #176B91)', textDecoration: 'none' }}>
                    {m.phone}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Email:</span>
                  <span style={{ fontWeight: 500, color: '#083B56', fontSize: '0.72rem' }}>{m.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Tenure Term:</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>{m.termDuration}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <a
                  href={`tel:${m.phone}`}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem',
                    borderRadius: '10px',
                    border: '1px solid var(--aarizo-border, #DCE8EF)',
                    background: '#ffffff',
                    color: 'var(--aarizo-navy, #083B56)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={13} color="var(--aarizo-blue, #176B91)" />
                  <span>Call Officer</span>
                </a>
                <a
                  href={`mailto:${m.email}`}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem',
                    borderRadius: '10px',
                    border: '1px solid var(--aarizo-border, #DCE8EF)',
                    background: '#ffffff',
                    color: 'var(--aarizo-navy, #083B56)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <Mail size={13} color="var(--aarizo-coral, #F06543)" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Committee Member"
      >
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748B' }}>
          Provision elected governing body officer with Committee portal access.
        </p>
        <Form onSubmit={handleCreateMember}>
          <FormField label="Full Name">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anand K. Patil"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F06543]"
            />
          </FormField>

          <FormField label="Designation / Portfolio">
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F06543]"
            >
              <option value="Society Chairman">Society Chairman</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Joint Secretary">Joint Secretary</option>
              <option value="Executive Committee Member">Executive Committee Member</option>
              <option value="Cultural Committee Head">Cultural Committee Head</option>
              <option value="Maintenance Committee Head">Maintenance Committee Head</option>
              <option value="Women Representative">Women's Representative</option>
            </select>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <FormField label="Flat / Unit Number">
              <input
                type="text"
                required
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. B-1204"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F06543]"
              />
            </FormField>
            <FormField label="Tenure Period">
              <input
                type="text"
                value={termDuration}
                onChange={(e) => setTermDuration(e.target.value)}
                placeholder="e.g. 2025–2027"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F06543]"
              />
            </FormField>
          </div>

          <FormField label="Mobile Phone">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98200 12345"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F06543]"
            />
          </FormField>

          <FormField label="Email Address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. anand.patil@society.aarizo.com"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#F06543]"
            />
          </FormField>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ background: 'var(--aarizo-coral, #F06543)' }}
              className="px-4 py-2 border-none text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition cursor-pointer"
            >
              {isSubmitting ? 'Registering...' : 'Provision Member'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
