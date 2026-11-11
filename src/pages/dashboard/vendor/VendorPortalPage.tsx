import React from 'react';
import { SocietyServicesHub } from '../../../domains/services';

export const VendorPortalPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* Page Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: 'var(--aarizo-gold, #E5B842)', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Service Partner Hub</p>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Vendor Work Orders & Contract Portal
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Society work orders, service staff dispatch & contract milestone tracking
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <SocietyServicesHub userRoleOverride="VENDOR" />
      </div>
    </div>
  );
};

export default VendorPortalPage;
