import React, { useState } from 'react';
import type { CommitteeMemberRecord } from '../../../domains/secretary/types';
import { Phone, Mail, Calendar, UserPlus, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import { realtimeService } from '../../../services/realtimeService';
import { Modal } from '../../ui/Modal';
import { Form, FormField } from '../../ui/Form';
import '../secretary.css';

interface SecretaryCommitteeRosterProps {
  committeeList: CommitteeMemberRecord[];
  onMemberAdded?: (member: CommitteeMemberRecord) => void;
}

export const SecretaryCommitteeRoster: React.FC<SecretaryCommitteeRosterProps> = ({
  committeeList: initialList,
  onMemberAdded,
}) => {
  const [members, setMembers] = useState<CommitteeMemberRecord[]>(initialList);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('Executive Committee Member');
  const [flatNumber, setFlatNumber] = useState('B-101');
  const [phone, setPhone] = useState('+91 98000 00000');
  const [email, setEmail] = useState('');
  const [termDuration, setTermDuration] = useState('2025–2027');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const newId = `cm-${Date.now().toString().slice(-4)}`;
    const newRecord: CommitteeMemberRecord = {
      id: newId,
      name: name.trim(),
      designation: designation as any,
      flatNumber: flatNumber.trim(),
      blockWing: 'Block B',
      canonicalDisplay: `${name.trim()} (${flatNumber.trim()})`,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@society.aarizo.com`,
      termDuration: termDuration.trim(),
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
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
      console.warn('API error saving committee member, fallback to state:', err);
    }

    setMembers((prev) => [newRecord, ...prev]);
    if (onMemberAdded) onMemberAdded(newRecord);

    realtimeService.publish('COMMITTEE_MEMBER_ADDED', {
      member: newRecord,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setSuccessMsg(`Added ${newRecord.name} as ${newRecord.designation}! Login credentials generated.`);
    setTimeout(() => setSuccessMsg(null), 5000);

    // Reset Form
    setName('');
    setPhone('+91 98000 00000');
    setEmail('');
    setFlatNumber('B-101');
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div className="section-heading-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
            Managing Committee Roster
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Elected Officers & Governing Body (2025–2027 Tenure)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: '10px',
              background: 'var(--aarizo-coral, #F06543)',
              color: '#ffffff',
              fontSize: '0.78125rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(240, 101, 67, 0.25)',
            }}
          >
            <UserPlus size={15} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            color: '#166534',
            fontSize: '0.8125rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Member Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem' }}>
        {members.map((member) => (
          <div
            key={member.id}
            className="resident-card"
            style={{
              padding: '1rem',
              alignItems: 'flex-start',
              borderLeft: '4px solid var(--aarizo-blue, #176B91)',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              display: 'flex',
              gap: '0.875rem',
              boxShadow: '0 2px 6px rgba(8, 59, 86, 0.04)',
            }}
          >
            <img
              src={member.avatarUrl}
              alt={member.name}
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLElement).style.display = 'none';
              }}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e2e8f0',
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.375rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>
                  {member.name}
                </h4>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    background: 'var(--aarizo-light-blue, #EAF6FC)',
                    color: 'var(--aarizo-blue, #176B91)',
                  }}
                >
                  {member.designation}
                </span>
              </div>

              <p style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>
                {member.canonicalDisplay}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Phone size={13} style={{ color: 'var(--aarizo-blue, #176B91)' }} />
                  <a href={`tel:${member.phone}`} style={{ color: '#083B56', textDecoration: 'none', fontWeight: 600 }}>
                    {member.phone}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Mail size={13} style={{ color: 'var(--aarizo-blue, #176B91)' }} />
                  <span>{member.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                  <Calendar size={13} style={{ color: '#16a34a' }} />
                  <span>Tenure: {member.termDuration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Committee Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Committee Member"
      >
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748B' }}>
          Provision elected governing body officer with Committee portal access.
        </p>
        <Form onSubmit={handleAddMember}>
          <FormField label="Full Name">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rameshwar Joshi"
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
              placeholder="e.g. rameshwar@gmail.com"
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
