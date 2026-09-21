import React from 'react';
import { Activity } from 'lucide-react';
import { PrivacyAuditHub } from '../../../domains/security';

export const AuditLogsPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* ── Aarizo Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Activity size={14} color="#83CBEA" />
          <p style={{ color: '#83CBEA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Security Compliance
          </p>
        </div>
        <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>
          Security &amp; CRUD Audit Trail
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Immutable audit log of all admin actions, approvals &amp; status changes
        </p>
      </div>

      <div style={{ padding: '1rem' }}>
        <PrivacyAuditHub />
      </div>
    </div>
  );
};

export default AuditLogsPage;
