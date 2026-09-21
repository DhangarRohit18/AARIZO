import React, { useState, useEffect } from 'react';
import { Package, QrCode } from 'lucide-react';
import { parcelRoomService } from '../services/parcelRoomService';
import type { Parcel } from '../types';
import { realtimeService } from '../../../services/realtimeService';

export const ResidentParcelWidget: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedQrParcel, setSelectedQrParcel] = useState<Parcel | null>(null);

  const loadResidentParcels = () => {
    const list = parcelRoomService.getAllParcels('soc-gvs');
    setParcels(list.filter((p) => p.residentId === 'res-1' || p.residentName.includes('Vikram')));
  };

  useEffect(() => {
    loadResidentParcels();

    const unsubscribe = realtimeService.subscribe('DELIVERY_STATUS', () => {
      loadResidentParcels();
    });

    return () => unsubscribe();
  }, []);

  const activeParcels = parcels.filter((p) => p.status !== 'COLLECTED');

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '1rem',
      border: '1px solid #e2e8f0',
      padding: '1rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '0.625rem',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Package size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              Parcel & Courier Pass
            </h3>
            <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: '0.125rem 0 0' }}>
              Live parcel status & pickup OTP/QR codes
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: '#047857',
          background: '#d1fae5',
          border: '1px solid #a7f3d0',
          borderRadius: '9999px',
          padding: '0.2rem 0.625rem',
          flexShrink: 0,
        }}>
          {activeParcels.length} Active
        </span>
      </div>

      {/* Active Parcels List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {activeParcels.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0', margin: 0 }}>
            No active parcels awaiting pickup.
          </p>
        ) : (
          activeParcels.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.875rem',
                background: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    {p.courierCompany}
                  </span>
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    background: '#e2e8f0',
                    color: '#475569',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                  }}>
                    {p.storageLocation}
                  </span>
                </div>
                <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: '0.25rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Arrived {p.ageHours}h ago • #{p.trackingNumber}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '0.5625rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Pickup OTP
                  </span>
                  <span style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    letterSpacing: '0.08em',
                  }}>
                    {p.pickupOtp}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedQrParcel(p)}
                  aria-label="Show Digital QR Code"
                  title="Show Digital QR Code"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '0.5rem',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <QrCode size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Modal */}
      {selectedQrParcel && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 300,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            maxWidth: '320px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Gate Pickup Digital Pass
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              {selectedQrParcel.courierCompany} • {selectedQrParcel.storageLocation}
            </p>
            <div style={{
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <QrCode size={140} color="#0f172a" />
            </div>
            <div style={{
              padding: '0.625rem',
              background: '#ecfdf5',
              borderRadius: '0.5rem',
              border: '1px solid #a7f3d0',
            }}>
              <span style={{ fontSize: '0.6875rem', color: '#047857', display: 'block', fontWeight: 600 }}>
                SHOW OTP TO GUARD
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', letterSpacing: '0.12em' }}>
                {selectedQrParcel.pickupOtp}
              </span>
            </div>
            <button
              onClick={() => setSelectedQrParcel(null)}
              style={{
                width: '100%',
                padding: '0.625rem',
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '0.625rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentParcelWidget;
