import React from 'react';
import { QRParkingHub } from '../../../domains/parking';

export const ResidentParkingPage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <QRParkingHub />
    </div>
  );
};

export default ResidentParkingPage;
