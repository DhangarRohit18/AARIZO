import React from 'react';
import type { CommitteeMemberRecord } from '../../../domains/secretary/types';
import { Phone, Mail, Calendar } from 'lucide-react';
import '../secretary.css';

interface SecretaryCommitteeRosterProps {
  committeeList: CommitteeMemberRecord[];
}

export const SecretaryCommitteeRoster: React.FC<SecretaryCommitteeRosterProps> = ({ committeeList }) => {
  return (
    <div>
      <div className="section-heading-row">
        <div>
          <h3 className="section-title">Managing Committee Roster</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            Elected Officers & Governing Body (2025–2027 Tenure)
          </p>
        </div>
        <span className="banner-role-tag" style={{ background: '#f0fdf4', color: '#16a34a' }}>
          Registered Body
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.875rem' }}>
        {committeeList.map((member) => (
          <div
            key={member.id}
            className="resident-card"
            style={{
              padding: '1rem',
              alignItems: 'flex-start',
              borderLeft: '4px solid #2563eb',
            }}
          >
            <img
              src={member.avatarUrl}
              alt={member.name}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e2e8f0',
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800 }}>{member.name}</h4>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    background: '#eff6ff',
                    color: '#2563eb',
                  }}
                >
                  {member.designation}
                </span>
              </div>

              <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>
                {member.canonicalDisplay}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Phone size={13} style={{ color: '#2563eb' }} />
                  <span>{member.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Mail size={13} style={{ color: '#2563eb' }} />
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
    </div>
  );
};
