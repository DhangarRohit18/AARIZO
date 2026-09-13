import React, { useState } from 'react';
import { Car, Camera, CheckCircle2, XCircle } from 'lucide-react';
import { parkingService } from '../../../services/parkingService';
import type { ParkingSlot, ParkingQRValidationResult } from '../../../types/parking';
import { Modal } from '../../../components/ui/Modal';
import { QRScanner } from '../../../components/ui/QRScanner';

export const ParkingGateScannerPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const officerActor = { id: 'guard-1', name: 'Officer R. Singh', role: 'SECURITY' };

  const [inputCode, setInputCode] = useState('');
  const [validationResult, setValidationResult] = useState<ParkingQRValidationResult | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleValidate = (code: string) => {
    const res = parkingService.validateParkingQR(currentSocietyId, code);
    setValidationResult(res);
  };

  const handleEntry = (slot: ParkingSlot) => {
    parkingService.scanEntry(slot.id, slot.assignedVehicleNumber || 'VISITOR', officerActor);
    alert(`Vehicle entry recorded for Slot ${slot.slotNumber}. Occupancy state updated to OCCUPIED.`);
    setValidationResult(null);
    setIsScannerOpen(false);
  };

  const handleExit = (slot: ParkingSlot) => {
    parkingService.scanExit(slot.id, officerActor);
    alert(`Vehicle exit recorded for Slot ${slot.slotNumber}. Slot returns to ${slot.slotType === 'VISITOR' ? 'VISITOR' : 'AVAILABLE'}.`);
    setValidationResult(null);
    setIsScannerOpen(false);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Car size={28} />
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Gate Parking QR Verification</h1>
        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Scan vehicle permit QR tag to validate slot allocation & toggle entry/exit.
        </p>
      </header>

      {/* Code Input Card */}
      <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Enter Slot Code or Vehicle Tag</h3>
        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
          <input
            type="text"
            placeholder="e.g. B1-P12 or MH-02-CB-4092"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate(inputCode)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'monospace' }}
          />
          <button
            onClick={() => handleValidate(inputCode)}
            style={{ padding: '0.75rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Verify
          </button>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Camera size={18} /> Open Camera QR Scanner
        </button>
      </div>

      {/* Validation Result Modal */}
      {validationResult && (
        <Modal isOpen={!!validationResult} onClose={() => setValidationResult(null)} title="Parking Tag Validation">
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: validationResult.isValid ? '#ecfdf5' : '#fef2f2',
                color: validationResult.isValid ? '#10b981' : '#ef4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              {validationResult.isValid ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', color: validationResult.isValid ? '#065f46' : '#991b1b' }}>
              {validationResult.isValid ? 'VALID PARKING PERMIT' : 'PERMIT REJECTED'}
            </h3>

            {validationResult.slot && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', margin: '1rem 0', textAlign: 'left', fontSize: '0.9rem' }}>
                <div>Parking Bay: <strong>{validationResult.slot.slotNumber}</strong> ({validationResult.slot.level})</div>
                <div>Assigned Flat: <strong>{validationResult.slot.assignedFlatCode || 'N/A'}</strong> ({validationResult.slot.assignedResidentName})</div>
                <div>Vehicle: <strong>{validationResult.slot.assignedVehicleNumber || 'N/A'}</strong></div>
                <div>Current State: <strong>{validationResult.slot.occupancyState}</strong></div>
              </div>
            )}

            {!validationResult.isValid && (
              <p style={{ color: '#dc2626', fontWeight: 600 }}>{validationResult.reason}</p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setValidationResult(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Dismiss</button>
              {validationResult.isValid && validationResult.slot && (
                <>
                  {validationResult.slot.occupancyState !== 'OCCUPIED' && (
                    <button
                      onClick={() => handleEntry(validationResult.slot!)}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Scan Entry (Occupied)
                    </button>
                  )}
                  {validationResult.slot.occupancyState === 'OCCUPIED' && (
                    <button
                      onClick={() => handleExit(validationResult.slot!)}
                      style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#64748b', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Scan Exit (Available)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* QR Scanner Modal */}
      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Camera Parking QR Scanner">
        <QRScanner onScan={(code) => handleValidate(code)} />
      </Modal>
    </div>
  );
};
