import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { childSafetyService } from '../../../services/childSafetyService';
import type {
  ChildProfile,
  ChildPickupQR,
  PickupLog,
} from '../../../types/childSafety';
import { Modal } from '../../../components/ui/Modal';
import {
  ShieldCheck,
  AlertTriangle,
  QrCode,
  UserPlus,
  Phone,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ResidentChildSafetyPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-gvs';
  const flatNumber = currentUser?.flatNumber || 'B-1204';

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [activeQRs, setActiveQRs] = useState<ChildPickupQR[]>([]);
  const [pickupLogs, setPickupLogs] = useState<PickupLog[]>([]);

  // Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [showAddEscortModal, setShowAddEscortModal] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [activeQrModal, setActiveQrModal] = useState<ChildPickupQR | null>(null);

  // Form states
  const [selectedEscortId, setSelectedEscortId] = useState('');
  const [validHours, setValidHours] = useState('4');

  const [escortForm, setEscortForm] = useState({
    name: '',
    phone: '',
    relationship: 'Family Caretaker / Nanny',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
  });

  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [societyId, flatNumber]);

  const loadData = () => {
    const all = childSafetyService.getChildren(societyId);
    const myChildren = all.filter((c) => c.flatNumber === flatNumber);
    setChildren(myChildren);
    if (myChildren.length > 0 && !selectedChild) {
      setSelectedChild(myChildren[0]);
    } else if (myChildren.length > 0) {
      const refreshed = myChildren.find((c) => c.id === selectedChild?.id) || myChildren[0];
      setSelectedChild(refreshed);
    }

    const qrs = childSafetyService.getPickupQRs(societyId);
    setActiveQRs(qrs.filter((q) => q.status === 'ACTIVE'));

    const logs = childSafetyService.getPickupLogs(societyId);
    setPickupLogs(logs.filter((l) => myChildren.some((c) => c.id === l.childId)));
  };

  const handleGeneratePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !selectedEscortId) return;

    const now = new Date();
    const expiry = new Date(now.getTime() + parseInt(validHours, 10) * 3600 * 1000);

    const newPass = childSafetyService.generatePickupQR(
      societyId,
      selectedChild.id,
      selectedEscortId,
      now.toISOString(),
      expiry.toISOString(),
      1
    );

    setShowPassModal(false);
    setActiveQrModal(newPass);
    loadData();
  };

  const handleAddEscort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !escortForm.name || !escortForm.phone) return;

    childSafetyService.addAuthorizedPickupPerson(
      societyId,
      selectedChild.id,
      escortForm.name,
      escortForm.phone,
      escortForm.relationship,
      escortForm.idProofType,
      escortForm.idProofNumber
    );

    setShowAddEscortModal(false);
    setEscortForm({
      name: '',
      phone: '',
      relationship: 'Family Caretaker / Nanny',
      idProofType: 'Aadhaar Card',
      idProofNumber: '',
    });
    loadData();
  };

  const handleTriggerMissingAlert = () => {
    if (!selectedChild) return;
    childSafetyService.triggerMissingChildAlert(
      societyId,
      selectedChild.id,
      currentUser?.name || 'Resident Guardian'
    );
    setShowMissingModal(false);
    setAlertSuccess('High-Priority Child Safety Alert dispatched to Main Gate security & guard terminal!');
    loadData();
    setTimeout(() => setAlertSuccess(null), 6000);
  };

  const currentChild = selectedChild || children[0];

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '1rem', paddingBottom: '6rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/resident')}
            aria-label="Back to Home"
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              border: '1px solid var(--aarizo-border, #E8F1F5)',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--aarizo-navy, #083B56)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>
              Child Safety Pass
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--aarizo-text-muted, #657785)' }}>
              Gate authorization & security escort verification for Flat {flatNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Success Banner */}
      {alertSuccess && (
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            padding: '0.875rem 1rem',
            borderRadius: '12px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{alertSuccess}</span>
        </div>
      )}

      {currentChild ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Child Identity Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #083B56 0%, #176B91 100%)',
              borderRadius: '20px',
              padding: '1.25rem',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(8, 59, 86, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.625rem', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>
                  PROTECTED CHILD PASS
                </span>
                <span style={{ fontSize: '0.6875rem', background: '#059669', color: '#ffffff', padding: '0.25rem 0.625rem', borderRadius: '20px', fontWeight: 700 }}>
                  ● SAFE ON PREMISES
                </span>
              </div>
              <ShieldCheck size={22} style={{ opacity: 0.9 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={currentChild.photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400&q=80'}
                alt={currentChild.fullName}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '18px',
                  objectFit: 'cover',
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {currentChild.fullName}
                </h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', opacity: 0.85 }}>
                  Flat {currentChild.flatNumber} · DOB: {currentChild.dateOfBirth}
                </p>
                {currentChild.medicalNotes && (
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.6875rem', background: 'rgba(0, 0, 0, 0.18)', padding: '0.25rem 0.5rem', borderRadius: '6px', display: 'inline-block' }}>
                    ⚕ {currentChild.medicalNotes}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <button
                onClick={() => setShowPassModal(true)}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  color: 'var(--aarizo-blue, #176B91)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <QrCode size={16} />
                <span>Generate Exit Pass</span>
              </button>

              <button
                onClick={() => setShowMissingModal(true)}
                style={{
                  background: 'rgba(225, 29, 72, 0.95)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                }}
              >
                <AlertTriangle size={16} />
                <span>Report Missing</span>
              </button>
            </div>
          </div>

          {/* Active Gate Passes Strip */}
          {activeQRs.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--aarizo-border-soft, #E8F1F5)', padding: '1rem', boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <QrCode size={16} style={{ color: 'var(--aarizo-blue, #176B91)' }} />
                  Active Gate Exit QR Passes ({activeQRs.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {activeQRs.map((qr) => {
                  const escort = currentChild.authorizedPickups.find((p) => p.id === qr.pickupPersonId);
                  return (
                    <div
                      key={qr.id}
                      onClick={() => setActiveQrModal(qr)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        background: 'var(--aarizo-card-blue, #F4FAFE)',
                        border: '1px solid #DCE8EF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--aarizo-navy, #083B56)' }}>
                            {escort?.name || 'Authorized Escort'}
                          </strong>
                          <span style={{ fontSize: '0.625rem', background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.4rem', borderRadius: '6px', fontWeight: 700 }}>
                            ACTIVE
                          </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #657785)' }}>
                          Valid until: {new Date(qr.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Code: {qr.qrCode}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-blue, #176B91)' }}>
                          View QR
                        </span>
                        <ChevronRight size={16} color="var(--aarizo-blue, #176B91)" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Authorized Escorts / Pickups Section */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--aarizo-border-soft, #E8F1F5)', padding: '1.25rem', boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
                  Authorized Pickups & Escorts
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #657785)' }}>
                  Only verified escorts with matching ID can pick up child from school gate or society entrance
                </p>
              </div>
              <button
                onClick={() => setShowAddEscortModal(true)}
                style={{
                  background: 'var(--aarizo-blue-light, #EAF6FC)',
                  color: 'var(--aarizo-blue, #176B91)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <UserPlus size={14} />
                <span>Add Escort</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentChild.authorizedPickups.map((escort) => (
                <div
                  key={escort.id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '1px solid var(--aarizo-border, #E8F1F5)',
                    background: '#FAFCFD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={escort.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                      alt={escort.name}
                      style={{ width: 44, height: 44, borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--aarizo-navy, #083B56)' }}>
                          {escort.name}
                        </span>
                        <span style={{ fontSize: '0.625rem', background: '#F1F5F9', color: '#475569', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 600 }}>
                          {escort.relationship}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                        <a
                          href={`tel:${escort.phone}`}
                          style={{ fontSize: '0.6875rem', color: 'var(--aarizo-blue, #176B91)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Phone size={11} /> {escort.phone}
                        </a>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #657785)' }}>
                          {escort.idProofType}: {escort.idProofNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedEscortId(escort.id);
                      setShowPassModal(true);
                    }}
                    style={{
                      background: 'var(--aarizo-blue, #176B91)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Generate Pass
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gate Movement Log */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--aarizo-border-soft, #E8F1F5)', padding: '1.25rem', boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.75rem' }}>
              Recent Gate Movements & Verification Log
            </h3>
            {pickupLogs.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--aarizo-text-muted, #657785)', fontSize: '0.8125rem' }}>
                No recent gate exit logs recorded today. Child is registered safe on premises.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {pickupLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #f1f5f9',
                      background: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--aarizo-navy, #083B56)' }}>{log.pickupPersonName}</strong>
                      <span style={{ color: 'var(--aarizo-text-muted, #657785)', marginLeft: '0.5rem' }}>
                        Gate {log.gateId} · Guard {log.securityGuardId}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: log.status === 'ALLOWED' ? '#059669' : '#E11D48', fontWeight: 700, background: log.status === 'ALLOWED' ? '#DCFCE7' : '#FFE4E6', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <ShieldCheck size={48} color="var(--aarizo-blue, #176B91)" />
          <h3 style={{ margin: '1rem 0 0.5rem', color: 'var(--aarizo-navy, #083B56)' }}>No Children Registered</h3>
          <p style={{ margin: 0, color: 'var(--aarizo-text-muted, #657785)', fontSize: '0.8125rem' }}>
            Register your child's profile to activate automated gate exit verification.
          </p>
        </div>
      )}

      {/* Modal: Generate Gate Exit Pass */}
      <Modal isOpen={showPassModal} onClose={() => setShowPassModal(false)} title="Generate Child Gate Exit Pass">
        <form onSubmit={handleGeneratePass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.35rem', display: 'block' }}>
              Select Escort / Pickup Person
            </label>
            <select
              value={selectedEscortId}
              onChange={(e) => setSelectedEscortId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '10px',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                fontSize: '0.8125rem',
                background: '#ffffff',
              }}
            >
              <option value="">-- Choose verified escort --</option>
              {currentChild?.authorizedPickups.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relationship}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.35rem', display: 'block' }}>
              Pass Validity Duration
            </label>
            <select
              value={validHours}
              onChange={(e) => setValidHours(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '10px',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                fontSize: '0.8125rem',
                background: '#ffffff',
              }}
            >
              <option value="1">1 Hour (Single immediate trip)</option>
              <option value="2">2 Hours (Standard pickup)</option>
              <option value="4">4 Hours (School bus / outing)</option>
              <option value="8">8 Hours (Full day excursion)</option>
            </select>
          </div>

          <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.6875rem', color: '#475569' }}>
            🔒 <strong>Gate Protocol:</strong> Security will scan this digital QR code and verify the escort's photo ID before allowing the child to exit society gates.
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowPassModal(false)}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--aarizo-blue, #176B91)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Create QR Pass
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Authorized Escort */}
      <Modal isOpen={showAddEscortModal} onClose={() => setShowAddEscortModal(false)} title="Register Authorized Escort">
        <form onSubmit={handleAddEscort} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.35rem', display: 'block' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={escortForm.name}
              onChange={(e) => setEscortForm({ ...escortForm, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '10px',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.35rem', display: 'block' }}>
              Mobile Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={escortForm.phone}
              onChange={(e) => setEscortForm({ ...escortForm, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '10px',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.35rem', display: 'block' }}>
                Relationship / Role
              </label>
              <select
                value={escortForm.relationship}
                onChange={(e) => setEscortForm({ ...escortForm, relationship: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '10px',
                  border: '1px solid var(--aarizo-border, #DCE8EF)',
                  fontSize: '0.8125rem',
                  background: '#ffffff',
                }}
              >
                <option value="Family Caretaker / Nanny">Nanny / Caretaker</option>
                <option value="School Bus Driver">School Bus Driver</option>
                <option value="Relative / Grandparent">Relative / Grandparent</option>
                <option value="Tutor / Home Instructor">Tutor</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.35rem', display: 'block' }}>
                Govt ID Proof Type
              </label>
              <select
                value={escortForm.idProofType}
                onChange={(e) => setEscortForm({ ...escortForm, idProofType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '10px',
                  border: '1px solid var(--aarizo-border, #DCE8EF)',
                  fontSize: '0.8125rem',
                  background: '#ffffff',
                }}
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)', marginBottom: '0.35rem', display: 'block' }}>
              ID Number / Masked Reference
            </label>
            <input
              type="text"
              required
              placeholder="e.g. XXXX-XXXX-4589"
              value={escortForm.idProofNumber}
              onChange={(e) => setEscortForm({ ...escortForm, idProofNumber: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '10px',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowAddEscortModal(false)}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--aarizo-blue, #176B91)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Escort Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: QR Display */}
      {activeQrModal && (
        <Modal isOpen={!!activeQrModal} onClose={() => setActiveQrModal(null)} title="Child Gate Exit QR Pass">
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '16px',
                display: 'inline-block',
                border: '2px dashed var(--aarizo-blue, #176B91)',
                marginBottom: '1rem',
              }}
            >
              <QrCode size={160} color="var(--aarizo-navy, #083B56)" />
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--aarizo-navy, #083B56)' }}>
                {activeQrModal.qrCode}
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #657785)' }}>
                Present at Gate Scanner Terminal
              </span>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', fontSize: '0.75rem', color: '#475569', textAlign: 'left', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Child:</span>
                <strong>{currentChild?.fullName} (Flat {currentChild?.flatNumber})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Escort:</span>
                <strong>{currentChild?.authorizedPickups.find((p) => p.id === activeQrModal.pickupPersonId)?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Valid Until:</span>
                <strong>{new Date(activeQrModal.validUntil).toLocaleString()}</strong>
              </div>
            </div>

            <button
              onClick={() => setActiveQrModal(null)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--aarizo-blue, #176B91)',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done / Close
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Missing Child Emergency Alert */}
      <Modal isOpen={showMissingModal} onClose={() => setShowMissingModal(false)} title="Dispatch Emergency Child Alert">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '1rem', borderRadius: '12px', color: '#9F1239', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <AlertTriangle size={18} color="#E11D48" />
              <span>HIGH PRIORITY SECURITY ALARM</span>
            </div>
            This will trigger an immediate audio alarm and gate lockdown notification on all Security Gate Terminals and broadcast an alert to Society Management for Flat {flatNumber} ({currentChild?.fullName}).
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowMissingModal(false)}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTriggerMissingAlert}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '10px',
                border: 'none',
                background: '#E11D48',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              DISPATCH GATE ALERT
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResidentChildSafetyPage;
