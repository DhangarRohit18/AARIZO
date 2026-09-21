import React from 'react';
import { AssetComplianceHub } from '../../../domains/compliance';

export const AdminCompliancePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <p style={{ color: '#c4b5fd', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>Asset Audit</p>
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>
          AMC & Compliance Engine
        </h1>
        <p style={{ color: '#ddd6fe', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Track contracts, certifications & insurance
        </p>
      </div>
      <div style={{ padding: '1rem' }}>
        <AssetComplianceHub userRoleOverride="SOCIETY_ADMIN" />
      </div>
    </div>
  );
};

export default AdminCompliancePage;
