import React from 'react';
import { QRParkingHub } from '../../../domains/parking';

export const ResidentParkingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f7f8fa' }}>
      <QRParkingHub />
    </div>
  );
};

export default ResidentParkingPage;
