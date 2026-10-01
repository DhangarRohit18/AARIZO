import React from 'react';
import { QRParkingHub } from '../../../domains/parking';

export const ResidentParkingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <QRParkingHub />
      </div>
    </div>
  );
};

export default ResidentParkingPage;
