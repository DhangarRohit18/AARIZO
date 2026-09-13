import React from 'react';
import { SocietyServicesHub } from '../../../domains/services';

export const ResidentMarketplacePage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SocietyServicesHub userRoleOverride="RESIDENT" />
    </div>
  );
};

export default ResidentMarketplacePage;
