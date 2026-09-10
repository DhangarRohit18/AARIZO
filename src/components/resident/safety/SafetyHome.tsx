import React, { useState } from 'react';
import { mockEmergencyContacts, mockSafetyInstructions } from '../../../mockData/safety/safetyData';
import { Modal, Button } from '../../common';
import { AlertOctagon, PhoneCall, ShieldAlert, ArrowLeft, Info } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface SafetyHomeProps {
  onBackToMore: () => void;
}

export const SafetyHome: React.FC<SafetyHomeProps> = ({ onBackToMore }) => {
  const [isSOSConfirmModalOpen, setIsSOSConfirmModalOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosTimestamp, setSosTimestamp] = useState<string | null>(null);

  const handleTriggerSOS = () => {
    setIsSOSConfirmModalOpen(false);
    setIsSOSActive(true);
    setSosTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleResolveSOS = () => {
    setIsSOSActive(false);
    setSosTimestamp(null);
  };

  return (
    <div className="res-safety-container">
      {/* Header */}
      <div className="res-screen-header">
        <button className="vis-back-icon-btn" onClick={onBackToMore} aria-label="Back to More">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="vis-screen-title">Safety & Emergency</h2>
          <p className="vis-screen-subtitle">Emergency contacts & gate safety protocols</p>
        </div>
      </div>

      {/* Active SOS Banner if triggered */}
      {isSOSActive && (
        <div className="res-sos-active-card">
          <div className="res-sos-active-header">
            <ShieldAlert size={24} className="sos-active-ic" />
            <div>
              <span className="sos-active-badge">SIMULATED EMERGENCY SOS ACTIVE</span>
              <h3 className="sos-active-title">Security Team & Gate Officer Notified</h3>
            </div>
          </div>
          <p className="sos-active-desc">
            Triggered at {sosTimestamp} from Flat 1204. Main Security Gate #1 and Property Manager have received an automated priority alert.
          </p>
          <div className="sos-active-actions">
            <Button variant="outline" size="sm" onClick={handleResolveSOS}>
              Cancel / Resolve Emergency Alert
            </Button>
          </div>
        </div>
      )}

      {/* Main SOS Trigger Section */}
      <section className="res-sos-trigger-card">
        <div className="res-sos-left">
          <div className="res-sos-icon-bg">
            <AlertOctagon size={28} />
          </div>
          <div>
            <h3 className="res-sos-title">Emergency SOS Alert</h3>
            <p className="res-sos-subtitle">Instantly broadcast alert to Gate Security & RWA Desk</p>
          </div>
        </div>
        <Button
          variant="danger"
          size="md"
          onClick={() => setIsSOSConfirmModalOpen(true)}
          disabled={isSOSActive}
        >
          {isSOSActive ? 'SOS Active' : 'Broadcast SOS'}
        </Button>
      </section>

      {/* Emergency Contacts List */}
      <section className="res-safety-section">
        <h3 className="res-section-heading">Emergency Contacts</h3>
        <div className="res-contacts-list">
          {mockEmergencyContacts.map((contact) => (
            <div key={contact.id} className="res-contact-card">
              <div className="res-contact-left">
                <div className="res-contact-icon">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h4 className="res-contact-name">{contact.name}</h4>
                  <span className="res-contact-role">{contact.role}</span>
                  <span className="res-contact-hours">{contact.availableHours}</span>
                </div>
              </div>
              <a href={`tel:${contact.phone}`} className="res-contact-phone-btn">
                <span>{contact.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Instructions & Guidelines */}
      <section className="res-safety-section">
        <h3 className="res-section-heading">Safety Procedures & Guidelines</h3>
        <div className="res-instructions-list">
          {mockSafetyInstructions.map((item) => (
            <div key={item.id} className="res-instruction-card">
              <div className="res-instruction-header">
                <Info size={16} className="instruction-ic" />
                <h4 className="res-instruction-title">{item.title}</h4>
              </div>
              <p className="res-instruction-detail">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Confirmation Modal to Prevent Casual Accidental Taps */}
      <Modal
        isOpen={isSOSConfirmModalOpen}
        onClose={() => setIsSOSConfirmModalOpen(false)}
        title="Trigger Emergency SOS Alert?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsSOSConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleTriggerSOS}>
              Confirm SOS Alert
            </Button>
          </>
        }
      >
        <p className="vis-modal-text">
          Are you sure you want to broadcast a simulated Emergency SOS from <strong>Tower B · Flat 1204</strong>?
        </p>
        <p className="vis-modal-subtext">
          (Note: This is a prototype laboratory simulation only. No real phone calls or external SMS services will be dispatched.)
        </p>
      </Modal>
    </div>
  );
};
