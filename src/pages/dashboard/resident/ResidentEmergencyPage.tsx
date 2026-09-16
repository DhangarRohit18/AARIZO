import React from 'react';
import { SafetyCommandHub } from '../../../domains/safety';

export const ResidentEmergencyPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <SafetyCommandHub />
    </div>
  );
};

export default ResidentEmergencyPage;
