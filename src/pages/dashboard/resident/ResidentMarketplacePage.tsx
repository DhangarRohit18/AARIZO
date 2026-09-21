import React from 'react';
import { CommunityMarketplaceHub } from '../../../domains/community';

export const ResidentMarketplacePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <CommunityMarketplaceHub userRole="RESIDENT" initialTab="MARKETPLACE" />
    </div>
  );
};

export default ResidentMarketplacePage;
