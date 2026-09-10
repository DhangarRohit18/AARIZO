import React, { useState } from 'react';
import type { GuardVisitor } from '../../../domains/guard/types';
import { LogOut, Clock, User, Car, X } from 'lucide-react';
import '../guard.css';

interface InsideVisitorsProps {
  insideList: GuardVisitor[];
  onCheckOut: (visitor: GuardVisitor) => void;
}

export const InsideVisitors: React.FC<InsideVisitorsProps> = ({ insideList, onCheckOut }) => {
  const [selectedForCheckout, setSelectedForCheckout] = useState<GuardVisitor | null>(null);

  const handleConfirmCheckout = () => {
    if (selectedForCheckout) {
      onCheckOut(selectedForCheckout);
      setSelectedForCheckout(null);
    }
  };

  return (
    <div>
      <div className="section-heading-row">
        <h3 className="section-title">Visitors Inside Community</h3>
        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
          {insideList.length} Currently Inside
        </span>
      </div>

      {insideList.length === 0 ? (
        <div className="onboarding-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <User size={32} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>No Visitors Currently Inside</h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            All approved visitors have checked out of the premises.
          </p>
        </div>
      ) : (
        insideList.map((item) => (
          <div key={item.id} className="guard-visitor-card">
            <div className="guard-visitor-header">
              <h4 className="guard-visitor-title">{item.name}</h4>
              <span
                className="banner-role-tag"
                style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #6ee7b7' }}
              >
                INSIDE COMMUNITY
              </span>
            </div>

            <p className="guard-visitor-resident">
              Visiting <strong>{item.residentName}</strong> ({item.tower} • {item.flatCode})
            </p>

            <div className="guard-visitor-meta-row">
              <span>
                <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} />
                Checked In: {item.checkedInAt || 'Today, 11:20 AM'}
              </span>
              {item.vehicleNumber && (
                <span>
                  <Car size={13} style={{ display: 'inline', marginRight: '3px' }} />
                  {item.vehicleNumber}
                </span>
              )}
            </div>

            <button
              className="btn-guard-action-outline"
              style={{ width: '100%', borderColor: '#fca5a5', color: '#dc2626', background: '#fff1f2' }}
              onClick={() => setSelectedForCheckout(item)}
            >
              <LogOut size={16} />
              <span>Check Out Visitor</span>
            </button>
          </div>
        ))
      )}

      {/* Checkout Confirmation Modal */}
      {selectedForCheckout && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card">
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }}
              onClick={() => setSelectedForCheckout(null)}
            >
              <X size={18} style={{ color: '#94a3b8' }} />
            </div>

            <div className="otp-icon-header" style={{ background: '#fff1f2', color: '#e11d48' }}>
              <LogOut size={28} />
            </div>

            <h3 className="otp-title">Check Out Visitor?</h3>
            <p className="otp-desc">
              Confirm exit timestamp for <strong>{selectedForCheckout.name}</strong> departing from{' '}
              <strong>{selectedForCheckout.residentName}</strong> ({selectedForCheckout.flatCode}).
            </p>

            <div className="onboarding-features-list" style={{ marginBottom: '1.25rem' }}>
              <div className="onboarding-feature-item">
                <Clock size={16} style={{ color: '#e11d48' }} />
                <span>Exit Gate: Gate #1 Main Entrance</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-onboarding-secondary"
                style={{ flex: 1 }}
                onClick={() => setSelectedForCheckout(null)}
              >
                Cancel
              </button>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#dc2626' }}
                onClick={handleConfirmCheckout}
              >
                Confirm Check-Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
