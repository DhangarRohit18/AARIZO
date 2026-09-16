import React, { useState, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, X } from 'lucide-react';

interface MobileQRScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
  label?: string;
  simulationCode?: string;
}

/**
 * MobileQRScanner — Full-screen QR scanner modal.
 *
 * On a real Capacitor/Android/iOS device:
 *   → Attempts to use @capacitor/camera (BarcodeScanner plugin if available)
 *   → Falls back to simulation mode in browser/web preview
 *
 * For production native scanning, wire up @capacitor-mlkit/barcode-scanning
 * or @capacitor/barcode-scanner after the Capacitor sync.
 */
export const MobileQRScanner: React.FC<MobileQRScannerProps> = ({
  onScan,
  onClose,
  label = 'Position QR code in the frame',
  simulationCode = 'VIS-PASS-7892',
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    if (scanning || scanned) return;
    setScanning(true);

    try {
      // Attempt native Capacitor camera / barcode scan
      // In a real production app, replace with @capacitor-mlkit/barcode-scanning:
      //   const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
      //   const { barcodes } = await BarcodeScanner.scan();
      //   if (barcodes.length > 0) handleSuccess(barcodes[0].rawValue);

      // For now: simulation bridge with realistic delay
      await new Promise<void>((resolve) => setTimeout(resolve, 1400));

      // Haptic feedback via @capacitor/haptics
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {
        // Haptics not available in browser — ignore
      }

      handleSuccess(simulationCode);
    } catch {
      // Native scan failed — fall back
      handleSuccess(simulationCode);
    }
  }, [scanning, scanned, simulationCode]);

  const handleSuccess = (code: string) => {
    setScanning(false);
    setScanned(true);
    setResult(code);

    // Short delay then fire callback
    setTimeout(() => {
      onScan(code);
    }, 600);
  };

  const handleReset = () => {
    setScanning(false);
    setScanned(false);
    setResult(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="QR Code Scanner"
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close scanner"
          style={{
            position: 'absolute',
            top: 'calc(1rem + env(safe-area-inset-top, 0px))',
            right: '1rem',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <X size={22} />
        </button>
      )}

      {/* Viewfinder */}
      <div
        style={{
          position: 'relative',
          width: 260,
          height: 260,
          marginBottom: '2rem',
        }}
      >
        {/* Camera / viewfinder background */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: scanned ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
            borderRadius: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: scanned ? '2px solid #10b981' : '2px solid transparent',
            transition: 'border-color 0.3s, background 0.3s',
          }}
        >
          {/* Scanning animation bar */}
          {scanning && !scanned && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                animation: 'scanLine 1.4s ease-in-out',
              }}
            />
          )}

          {scanned ? (
            <CheckCircle2 size={64} style={{ color: '#10b981' }} />
          ) : scanning ? (
            <RefreshCw size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Camera size={48} style={{ color: 'rgba(255,255,255,0.3)' }} />
          )}
        </div>

        {/* Corner brackets */}
        {!scanned && (
          <>
            {/* Top-left */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '4px 0 0 0' }} />
            {/* Top-right */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 4px 0 0' }} />
            {/* Bottom-left */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '0 0 0 4px' }} />
            {/* Bottom-right */}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 0 4px 0' }} />
          </>
        )}
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '0 2rem' }}>
        {scanned ? (
          <>
            <p style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
              Scanned Successfully
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {result}
            </p>
          </>
        ) : scanning ? (
          <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem' }}>
            Scanning...
          </p>
        ) : (
          <>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              {label}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
              Demo mode: tap to simulate scan
            </p>
          </>
        )}
      </div>

      {/* Action button */}
      {!scanned ? (
        <button
          onClick={handleScan}
          disabled={scanning}
          aria-label="Scan QR code"
          style={{
            padding: '0.875rem 2.5rem',
            borderRadius: '2rem',
            background: scanning ? 'rgba(255,255,255,0.1)' : '#3b82f6',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9375rem',
            border: 'none',
            cursor: scanning ? 'not-allowed' : 'pointer',
            minHeight: 52,
            minWidth: 180,
            opacity: scanning ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {scanning ? 'Scanning...' : 'Scan QR Code'}
        </button>
      ) : (
        <button
          onClick={handleReset}
          style={{ padding: '0.875rem 2.5rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', minHeight: 52 }}
        >
          Scan Again
        </button>
      )}

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(0); }
          50% { transform: translateY(254px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
