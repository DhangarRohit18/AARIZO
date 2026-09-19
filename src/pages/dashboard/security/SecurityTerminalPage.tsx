import React, { useState } from 'react';
import { Shield, Search as SearchIcon, AlertTriangle, Lock, Unlock, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import { visitorService } from '../../../services/visitorService';
import type { SmartVisitorPass, BlacklistEntry, PassValidationResult } from '../../../types/visitor';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { QRScanner } from '../../../components/ui/QRScanner';
import { Form, FormField } from '../../../components/ui/Form';

export const SecurityTerminalPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const officerActor = { id: 'guard-1', name: 'Officer R. Singh', role: 'SECURITY' };

  const [passes, setPasses] = useState<SmartVisitorPass[]>(visitorService.getPasses(currentSocietyId));
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(visitorService.getBlacklist(currentSocietyId));
  const [lockdown, setLockdown] = useState(visitorService.getLockdownState(currentSocietyId));

  const [searchQuery, setSearchQuery] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [validationResult, setValidationResult] = useState<PassValidationResult | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);

  // Blacklist form state
  const [blName, setBlName] = useState('');
  const [blPhone, setBlPhone] = useState('');
  const [blReason, setBlReason] = useState('');

  const refreshData = () => {
    setPasses(visitorService.getPasses(currentSocietyId));
    setBlacklist(visitorService.getBlacklist(currentSocietyId));
    setLockdown(visitorService.getLockdownState(currentSocietyId));
  };

  const handleValidateCode = (code: string) => {
    const res = visitorService.validatePassCode(currentSocietyId, code);
    setValidationResult(res);
  };

  const handleCheckIn = (pass: SmartVisitorPass) => {
    visitorService.checkInVisitor(pass.id, { gateName: 'Main Gate 1', officerName: officerActor.name }, officerActor);
    refreshData();
    setValidationResult(null);
    setIsScannerOpen(false);
  };

  const handleCheckOut = (passId: string) => {
    visitorService.checkOutVisitor(passId, officerActor);
    refreshData();
  };

  const handleToggleLockdown = () => {
    const newState = !lockdown.isLockdownActive;
    visitorService.toggleLockdown(
      currentSocietyId,
      newState,
      newState ? 'Activated emergency gate lockdown by security officer' : 'Deactivated lockdown',
      officerActor
    );
    refreshData();
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blName || !blPhone) return;

    visitorService.addBlacklist(
      {
        societyId: currentSocietyId,
        name: blName,
        phone: blPhone,
        reason: blReason || 'Added by Security Officer',
        blacklistedBy: officerActor.name,
      },
      officerActor
    );

    refreshData();
    setIsBlacklistModalOpen(false);
    setBlName('');
    setBlPhone('');
    setBlReason('');
  };

  const filteredPasses = passes.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.visitorName.toLowerCase().includes(q) ||
      p.flatCode.toLowerCase().includes(q) ||
      p.passCode.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const insideCount = passes.filter((p) => p.status === 'CHECKED_IN').length;
  const expectedCount = passes.filter((p) => p.status === 'EXPECTED').length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Top Header & Emergency Lockdown Controls */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={26} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Gate Security Operations Terminal</h1>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Main Gate 1 â€¢ Officer R. Singh â€¢ Real-Time Gate Pass Verification & Check-In
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsBlacklistModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              background: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={16} color="#d97706" /> Watchlist ({blacklist.length})
          </button>

          <button
            onClick={handleToggleLockdown}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              border: 'none',
              borderRadius: '8px',
              background: lockdown.isLockdownActive ? '#dc2626' : '#f1f5f9',
              color: lockdown.isLockdownActive ? '#fff' : '#475569',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {lockdown.isLockdownActive ? <Lock size={16} /> : <Unlock size={16} />}
            {lockdown.isLockdownActive ? 'LOCKDOWN ACTIVE' : 'Emergency Lockdown'}
          </button>
        </div>
      </header>

      {/* Emergency Lockdown Alert Banner */}
      {lockdown.isLockdownActive && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            color: '#991b1b',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={24} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>SECURITY ALERT: EMERGENCY LOCKDOWN ACTIVE</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>All new unapproved visitor entries are restricted by {lockdown.activatedBy}.</p>
          </div>
        </div>
      )}

      {/* Live Operations Cards & Passcode Input */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Passcode Quick Scan Bar */}
        <div style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #2563eb' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>QR / Code Verification</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="text"
              placeholder="Enter Pass Code e.g. GVS-4092"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleValidateCode(codeInput)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'monospace' }}
            />
            <button
              onClick={() => handleValidateCode(codeInput)}
              style={{ padding: '0.6rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Verify
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              style={{ padding: '0.6rem 1rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Scan QR
            </button>
          </div>
        </div>

        <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb' }}>{expectedCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Expected Today</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{insideCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Inside Complex</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#d97706' }}>{blacklist.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Watchlisted</div>
        </div>
      </div>

      {/* Visitor Directory & Live Activity */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Live Gate Visitors & Passes Log</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <SearchIcon size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search visitor, flat, pass..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredPasses.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: p.status === 'CHECKED_IN' ? '#f0fdf4' : '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.visitorName}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#e2e8f0', fontWeight: 600 }}>
                    {p.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#2563eb' }}>{p.passCode}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Destination: <strong>{p.flatCode}</strong> ({p.residentName}) {p.companyName ? `â€¢ ${p.companyName}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <StatusBadge
                  label={p.status.replace('_', ' ')}
                  variant={p.status === 'CHECKED_IN' ? 'success' : p.status === 'EXPECTED' ? 'info' : 'neutral'}
                />

                {p.status === 'EXPECTED' && (
                  <button
                    onClick={() => handleCheckIn(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.4rem 0.75rem',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={14} /> Allow Entry
                  </button>
                )}

                {p.status === 'CHECKED_IN' && (
                  <button
                    onClick={() => handleCheckOut(p.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.4rem 0.75rem',
                      background: '#64748b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} /> Check Out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Result Modal */}
      {validationResult && (
        <Modal isOpen={!!validationResult} onClose={() => setValidationResult(null)} title="Pass Validation Check Result">
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
              {validationResult.isValid ? 'PASS VALIDATED â€” ENTRY PERMITTED' : 'ENTRY REJECTED'}
            </h3>

            {validationResult.pass && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', margin: '1rem 0', textAlign: 'left', fontSize: '0.9rem' }}>
                <div>Visitor: <strong>{validationResult.pass.visitorName}</strong> ({validationResult.pass.visitorPhone})</div>
                <div>Destination: <strong>{validationResult.pass.flatCode}</strong> ({validationResult.pass.residentName})</div>
                <div>Category: {validationResult.pass.category}</div>
              </div>
            )}

            {!validationResult.isValid && (
              <p style={{ color: '#dc2626', fontWeight: 600, margin: '0.5rem 0 1.25rem 0' }}>
                {validationResult.reason}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setValidationResult(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Dismiss</button>
              {validationResult.isValid && validationResult.pass && (
                <button
                  onClick={() => handleCheckIn(validationResult.pass!)}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 600 }}
                >
                  Approve Entry & Check In
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* QR Scanner Modal */}
      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Security Camera QR Scanner">
        <QRScanner
          onScan={(code) => {
            handleValidateCode(code);
          }}
        />
      </Modal>

      {/* Blacklist Modal */}
      <Modal isOpen={isBlacklistModalOpen} onClose={() => setIsBlacklistModalOpen(false)} title="Security Watchlist & Blacklist Directory">
        <Form onSubmit={handleAddBlacklist}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Visitor Name" required>
              <input
                type="text"
                required
                value={blName}
                onChange={(e) => setBlName(e.target.value)}
                placeholder="e.g. Karan Mehra"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
            <FormField label="Phone Number" required>
              <input
                type="tel"
                required
                value={blPhone}
                onChange={(e) => setBlPhone(e.target.value)}
                placeholder="10-digit phone"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>
          <FormField label="Reason for Blacklisting" required>
            <input
              type="text"
              required
              value={blReason}
              onChange={(e) => setBlReason(e.target.value)}
              placeholder="e.g. Altercation with gate staff"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <button type="submit" style={{ padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, marginTop: '0.5rem', cursor: 'pointer' }}>
            Add to Blacklist
          </button>
        </Form>
      </Modal>
    </div>
  );
};

