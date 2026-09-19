import React from 'react';
import { Activity } from 'lucide-react';
import { PrivacyAuditHub } from '../../../domains/security';

export const AuditLogsPage: React.FC = () => {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Security & CRUD Audit Trail</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Immutable audit log recording all administrative modifications, resident approvals, and status changes.
          </p>
        </div>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <PrivacyAuditHub />
      </div>
    </div>
  );
};

export default AuditLogsPage;

