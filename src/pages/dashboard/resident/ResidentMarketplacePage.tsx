import React from 'react';
import { CommunityMarketplaceHub } from '../../../domains/community';

export const ResidentMarketplacePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa' }}>
      <CommunityMarketplaceHub userRole="RESIDENT" initialTab="MARKETPLACE" />
    </div>
  );
};

export default ResidentMarketplacePage;
