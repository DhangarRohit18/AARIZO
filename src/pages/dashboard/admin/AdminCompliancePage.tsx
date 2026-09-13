import React from 'react';
import { AssetComplianceHub } from '../../../domains/compliance';

export const AdminCompliancePage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AMC & Asset Compliance Audit Engine</h1>
        <p className="text-slate-500 text-sm">
          Track society assets, vendor maintenance contracts, safety certifications, and insurance compliance.
        </p>
      </div>

      <AssetComplianceHub userRoleOverride="SOCIETY_ADMIN" />
    </div>
  );
};

export default AdminCompliancePage;
