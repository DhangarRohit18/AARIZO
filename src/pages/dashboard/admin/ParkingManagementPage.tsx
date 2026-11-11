import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { QRParkingHub } from '../../../domains/parking';

export const ParkingManagementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: '2.5rem' }}>
      {/* ── Signature Aarizo Hero Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.25rem 1.5rem',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 4px 20px rgba(8, 59, 86, 0.15)',
          marginBottom: '1.25rem',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--aarizo-gold, #E5B842)' }}>
                  Vehicles &amp; Smart Gate
                </span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.15rem 0 0.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Society Parking &amp; Slot Management
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                Green Valley Society · Slot allocation, visitor QR passes, violations &amp; barrier gate controls
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-6 pb-24">
        <QRParkingHub />
      </div>
    </div>
  );
};

export default ParkingManagementPage;
