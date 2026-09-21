import React from 'react';
import { QRParkingHub } from '../../../domains/parking';

export const ParkingManagementPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa', padding: '1.5rem' }}>
      <QRParkingHub />
    </div>
  );
};

export default ParkingManagementPage;
