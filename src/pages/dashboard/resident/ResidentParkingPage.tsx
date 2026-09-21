import React from 'react';
import { QRParkingHub } from '../../../domains/parking';

export const ResidentParkingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <QRParkingHub />
    </div>
  );
};

export default ResidentParkingPage;
