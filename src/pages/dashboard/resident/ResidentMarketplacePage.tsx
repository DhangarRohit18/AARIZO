import React from 'react';
import { CommunityMarketplaceHub } from '../../../domains/community';

export const ResidentMarketplacePage: React.FC = () => {
  return (
    <div style={{ background: '#F7FBFE', minHeight: '100%', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Page Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: 'var(--aarizo-gold, #E5B842)', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Resident Commerce</p>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Community Marketplace & Local Directory
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Buy, sell, share rides, find pets, and connect with verified neighbours
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-44">
        <CommunityMarketplaceHub userRole="RESIDENT" initialTab="MARKETPLACE" hideHeaderBanner={true} />
      </div>
    </div>
  );
};

export default ResidentMarketplacePage;
