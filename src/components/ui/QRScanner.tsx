import React, { useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (code: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScan('VIS-PASS-7892');
    }, 1200);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        border: '2px dashed #94a3b8',
        borderRadius: '16px',
        background: scanning ? '#f0f9ff' : '#f8fafc',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: scanning ? '#dbeafe' : '#e2e8f0',
          color: scanning ? '#2563eb' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        {scanning ? <RefreshCw size={28} className="spin" /> : <Camera size={28} />}
      </div>
      <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>
        {scanning ? 'Scanning Gate Pass QR Code...' : 'Position Pass QR Code in Camera'}
      </h4>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
        Align the visitor pass QR code within frame
      </p>
      <button
        onClick={handleSimulateScan}
        disabled={scanning}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: 'none',
          background: '#2563eb',
          color: '#ffffff',
          fontWeight: 600,
          cursor: scanning ? 'not-allowed' : 'pointer',
        }}
      >
        {scanning ? 'Scanning...' : 'Simulate QR Scan'}
      </button>
    </div>
  );
};
