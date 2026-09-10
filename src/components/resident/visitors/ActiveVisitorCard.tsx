import React, { useState } from 'react';
import type { VisitorPass, VisitorPassStatus } from '../../../domains/visitors';
import { getStatusBadgeVariant, getStatusLabel } from '../../../domains/visitors';
import { StatusBadge, Modal, Button } from '../../common';
import { VisitorLifecycle } from './VisitorLifecycle';
import { QrCode, Eye, EyeOff, Clock, Trash2 } from 'lucide-react';
import '../resident.css';
import './visitor.css';

export interface ActiveVisitorCardProps {
  pass: VisitorPass;
  onStatusChange: (passId: string, newStatus: VisitorPassStatus) => void;
  onCancelPass: (passId: string) => void;
}

export const ActiveVisitorCard: React.FC<ActiveVisitorCardProps> = ({
  pass,
  onStatusChange,
  onCancelPass,
}) => {
  const [showPasscode, setShowPasscode] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const statusVariant = getStatusBadgeVariant(pass.status);

  return (
    <div className={`vis-active-card vis-card-status-${pass.status}`}>
      {/* Top Header */}
      <div className="vis-active-card-header">
        <div>
          <span className="vis-active-type">{pass.visitorType.toUpperCase()} PASS</span>
          <h3 className="vis-active-name">{pass.visitorName}</h3>
        </div>
        <StatusBadge status={statusVariant === 'warning' ? 'pending' : statusVariant === 'success' ? 'active' : 'offline'} label={getStatusLabel(pass.status)} />
      </div>

      <div className="vis-active-sub">
        <Clock size={12} />
        <span>{pass.expectedTimeSlot}</span>
      </div>

      {/* Masked Passcode Bar */}
      {pass.status !== 'checked_out' && pass.status !== 'cancelled' && (
        <div className="res-passcode-compact">
          <div className="res-passcode-left">
            <QrCode size={15} className="passcode-icon" />
            <span>Entry Passcode</span>
          </div>
          <div className="res-passcode-reveal-area">
            {showPasscode ? (
              <span className="res-passcode-code">{pass.passcode}</span>
            ) : (
              <span className="res-passcode-masked">••••</span>
            )}
            <button
              className="res-passcode-toggle-btn"
              onClick={() => setShowPasscode(!showPasscode)}
            >
              {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showPasscode ? 'Hide Pass' : 'Show Pass'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Prototype Lifecycle Simulator Controls */}
      <VisitorLifecycle
        currentStatus={pass.status}
        onStatusChange={(newSt) => onStatusChange(pass.id, newSt)}
      />

      {/* Card Footer Actions */}
      {pass.status !== 'checked_out' && pass.status !== 'cancelled' && (
        <div className="vis-active-card-footer">
          <button
            className="vis-cancel-pass-btn"
            onClick={() => setIsCancelModalOpen(true)}
          >
            <Trash2 size={13} />
            <span>Cancel Pass</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal for Cancel Pass */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Gate Pass?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Keep Pass
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsCancelModalOpen(false);
                onCancelPass(pass.id);
              }}
            >
              Cancel Pass
            </Button>
          </>
        }
      >
        <p className="vis-modal-text">
          Are you sure you want to cancel the gate pass for <strong>{pass.visitorName}</strong>? Once cancelled, the entry passcode <strong>{pass.passcode}</strong> will be invalidated at security gates.
        </p>
      </Modal>
    </div>
  );
};
