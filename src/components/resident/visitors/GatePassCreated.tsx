import React, { useState } from 'react';
import { CheckCircle2, QrCode, Share2, Copy, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import type { VisitorPass } from '../../../domains/visitors';
import { Badge, Button } from '../../common';
import '../resident.css';
import './visitor.css';

export interface GatePassCreatedProps {
  pass: VisitorPass;
  onDone: () => void;
  onCancelPass?: () => void;
}

export const GatePassCreated: React.FC<GatePassCreatedProps> = ({ pass, onDone, onCancelPass }) => {
  const [showPasscode, setShowPasscode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(pass.passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="vis-pass-created-container">
      <div className="vis-pass-success-header">
        <div className="vis-success-icon-wrapper">
          <CheckCircle2 size={44} className="vis-success-ic" />
        </div>
        <h2 className="vis-screen-title">Gate Pass Generated</h2>
        <p className="vis-screen-subtitle">Pre-approved entry for Flat 1204</p>
      </div>

      <div className="vis-pass-ticket-card">
        <div className="vis-ticket-header">
          <div>
            <span className="vis-ticket-type">{pass.visitorType.toUpperCase()} PASS</span>
            <h3 className="vis-ticket-name">{pass.visitorName}</h3>
          </div>
          <Badge variant="success">ACTIVE</Badge>
        </div>

        {/* Mock QR Visual */}
        <div className="vis-qr-box">
          <div className="vis-mock-qr-graphic">
            <QrCode size={110} className="qr-graphic-ic" />
          </div>
          <p className="vis-qr-caption">Mock Security Gate QR Code</p>
        </div>

        {/* Passcode Area */}
        <div className="vis-passcode-reveal-box">
          <div className="vis-passcode-meta">
            <span className="vis-passcode-label">Gate Passcode</span>
            {showPasscode ? (
              <span className="vis-passcode-big">{pass.passcode}</span>
            ) : (
              <span className="vis-passcode-big-masked">••••</span>
            )}
          </div>
          <button
            className="res-passcode-toggle-btn"
            onClick={() => setShowPasscode(!showPasscode)}
          >
            {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showPasscode ? 'Hide Pass' : 'Show Pass'}</span>
          </button>
        </div>

        {/* Pass Details Table */}
        <div className="vis-ticket-details">
          <div className="vis-detail-row">
            <span className="vis-detail-label">Expected Time</span>
            <span className="vis-detail-value">{pass.expectedTimeSlot}</span>
          </div>
          <div className="vis-detail-row">
            <span className="vis-detail-label">Valid Until</span>
            <span className="vis-detail-value">{pass.validUntil}</span>
          </div>
          <div className="vis-detail-row">
            <span className="vis-detail-label">Designated Gate</span>
            <span className="vis-detail-value">{pass.gateName}</span>
          </div>
          {pass.notes && (
            <div className="vis-detail-row">
              <span className="vis-detail-label">Note</span>
              <span className="vis-detail-value">{pass.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Share / Copy Actions */}
      <div className="vis-action-btn-row">
        <Button variant="outline" size="sm" onClick={handleCopy} leftIcon={<Copy size={14} />}>
          {copied ? 'Copied!' : 'Copy Code'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => alert(`Simulated Pass Share link for ${pass.visitorName}`)}
          leftIcon={<Share2 size={14} />}
        >
          Share Pass
        </Button>
      </div>

      <div className="vis-pass-footer-actions">
        <Button variant="primary" fullWidth onClick={onDone} leftIcon={<ShieldCheck size={16} />}>
          View Active Passes
        </Button>
        {onCancelPass && (
          <button className="vis-text-danger-btn" onClick={onCancelPass}>
            Cancel Gate Pass
          </button>
        )}
      </div>
    </div>
  );
};
