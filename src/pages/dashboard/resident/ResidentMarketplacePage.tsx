import React from 'react';
import { CommunityMarketplaceHub } from '../../../domains/community';

export const ResidentMarketplacePage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <CommunityMarketplaceHub userRole="RESIDENT" initialTab="MARKETPLACE" />
    </div>
  );
};

export default ResidentMarketplacePage;
