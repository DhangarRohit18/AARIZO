import React, { useState } from 'react';
import { Camera, QrCode } from 'lucide-react';
import { MobileQRScanner } from './MobileQRScanner';

interface QRScannerProps {
  onScan: (code: string) => void;
  label?: string;
  simulationCode?: string;
  fullScreen?: boolean;
}

/**
 * QRScanner — Inline trigger that opens the full-screen MobileQRScanner.
 * Replaces the old desktop-only simulation button with a mobile-native pattern.
 */
export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  label = 'Scan Gate Pass QR Code',
  simulationCode = 'VIS-PASS-7892',
  fullScreen = false,
}) => {
  const [open, setOpen] = useState(fullScreen);

  const handleScan = (code: string) => {
    setOpen(false);
    onScan(code);
  };

  if (open) {
    return (
      <MobileQRScanner
        onScan={handleScan}
        onClose={() => setOpen(false)}
        label={label}
        simulationCode={simulationCode}
      />
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.875rem',
        padding: '2rem 1.5rem',
        borderRadius: '1.25rem',
        background: '#0c0a09',
        border: '2px dashed rgba(255,255,255,0.15)',
        cursor: 'pointer',
        width: '100%',
        color: '#fff',
        minHeight: 140,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <QrCode size={30} style={{ color: '#3b82f6' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'center' }}>
          <Camera size={12} /> Tap to open camera scanner
        </div>
      </div>
    </button>
  );
};
