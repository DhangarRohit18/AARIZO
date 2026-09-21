import React, { useState } from 'react';
import { Shield, Search as SearchIcon, AlertTriangle, Lock, Unlock, CheckCircle2, XCircle, LogOut, QrCode } from 'lucide-react';
import { visitorService } from '../../../services/visitorService';
import type { SmartVisitorPass, BlacklistEntry, PassValidationResult } from '../../../types/visitor';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { QRScanner } from '../../../components/ui/QRScanner';
import { Form, FormField } from '../../../components/ui/Form';

import { useAuth } from '../../../context/AuthContext';

export const SecurityTerminalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const currentSocietyId = currentUser?.societyId || 'soc-gvs';
  const officerActor = {
    id: currentUser?.uid || 'guard-1',
    name: currentUser?.name || 'Officer R. Singh',
    role: currentUser?.role?.toUpperCase() || 'SECURITY',
  };

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
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)', padding: '1.25rem 1rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Shield size={18} style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
          <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.75rem', margin: 0 }}>Gate Security Terminal</p>
        </div>
        <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>Main Gate 1</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.6875rem', margin: 0 }}>Officer R. Singh • On Duty</p>
      </div>

      {/* Lockdown Alert */}
      {lockdown.isLockdownActive && (
        <div style={{ margin: '0.75rem', background: '#FFF0F1', border: '1px solid #fecaca', borderLeft: '4px solid #D9535B', borderRadius: '0.875rem', padding: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <AlertTriangle size={18} style={{ color: '#D9535B', flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#b91c1c' }}>EMERGENCY LOCKDOWN ACTIVE</div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.125rem' }}>All new visitor entries are restricted.</div>
          </div>
        </div>
      )}

      <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', marginTop: '0.75rem' }}>
          {[
            { label: 'Expected', value: expectedCount, color: 'var(--aarizo-blue, #176B91)' },
            { label: 'Inside', value: insideCount, color: '#3F8F58' },
            { label: 'Watchlist', value: blacklist.length, color: '#D99A2B' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ padding: '0.875rem', background: '#FFFFFF', borderRadius: '0.875rem', border: '1px solid var(--aarizo-border, #E8F1F5)', textAlign: 'center', boxShadow: '0 1px 3px rgba(8, 59, 86, 0.04)' }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.375rem', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--aarizo-text-muted, #657785)', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
          <button
            onClick={() => setIsScannerOpen(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '0.875rem 0.5rem', borderRadius: '0.875rem', background: 'var(--aarizo-blue-light, #EAF6FC)', border: '1px solid var(--aarizo-border, #E8F1F5)', cursor: 'pointer', minHeight: 80 }}
            aria-label="Scan QR Code"
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={20} style={{ color: 'var(--aarizo-blue, #176B91)' }} />
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--aarizo-navy, #083B56)' }}>Scan QR</span>
          </button>

          <button
            onClick={() => setIsBlacklistModalOpen(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '0.875rem 0.5rem', borderRadius: '0.875rem', background: '#fffbeb', border: '1.5px solid #fde68a', cursor: 'pointer', minHeight: 80 }}
            aria-label="Watchlist"
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} style={{ color: '#d97706' }} />
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e' }}>Watchlist</span>
          </button>

          <button
            onClick={handleToggleLockdown}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '0.875rem 0.5rem', borderRadius: '0.875rem', background: lockdown.isLockdownActive ? '#FFF0F1' : '#FFFFFF', border: lockdown.isLockdownActive ? '1px solid #fecaca' : '1px solid var(--aarizo-border, #E8F1F5)', cursor: 'pointer', minHeight: 80 }}
            aria-label={lockdown.isLockdownActive ? 'Deactivate Lockdown' : 'Emergency Lockdown'}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: lockdown.isLockdownActive ? '#fee2e2' : 'var(--aarizo-page, #F7FBFE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {lockdown.isLockdownActive ? <Lock size={20} style={{ color: '#D9535B' }} /> : <Unlock size={20} style={{ color: 'var(--aarizo-text-muted, #657785)' }} />}
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: lockdown.isLockdownActive ? '#D9535B' : 'var(--aarizo-text-dark, #203746)' }}>
              {lockdown.isLockdownActive ? 'End Lock' : 'Lockdown'}
            </span>
          </button>
        </div>

        {/* Code Verification */}
        <section>
          <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--aarizo-text-muted, #657785)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
            Pass Code Verification
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Enter code e.g. GVS-4092"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleValidateCode(codeInput)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e8e2d8', fontSize: '0.875rem', fontFamily: 'monospace', background: '#fff', minHeight: 48 }}
            />
            <button
              onClick={() => handleValidateCode(codeInput)}
              style={{ padding: '0.75rem 1.25rem', background: 'var(--aarizo-blue, #176B91)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.8125rem', minHeight: 48, whiteSpace: 'nowrap' }}
            >
              Verify Code
            </button>
          </div>
        </section>

        {/* Live Visitors List */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Live Gate Log
            </h2>
            <span style={{ fontSize: '0.625rem', color: '#a8a29e', fontWeight: 600 }}>{filteredPasses.length} passes</span>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.625rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #e8e2d8', marginBottom: '0.75rem' }}>
            <SearchIcon size={16} style={{ color: '#a8a29e', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search visitor, flat, pass..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8125rem', width: '100%', color: '#1c1917', minHeight: 28 }}
            />
          </div>

          {/* Visitor Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredPasses.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', background: '#fff', borderRadius: '0.875rem', border: '1px solid #e8e2d8' }}>
                <p style={{ fontSize: '0.8125rem', color: '#a8a29e', margin: 0 }}>No passes found</p>
              </div>
            ) : (
              filteredPasses.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '0.875rem',
                    background: p.status === 'CHECKED_IN' ? '#f0fdf4' : '#fff',
                    borderRadius: '0.875rem',
                    border: p.status === 'CHECKED_IN' ? '1px solid #bbf7d0' : '1px solid #e8e2d8',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1917' }}>{p.visitorName}</span>
                        <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: '#f1f5f9', fontWeight: 600, color: '#64748b' }}>
                          {p.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.25rem' }}>
                        <strong>{p.flatCode}</strong> • {p.residentName}
                      </div>
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#ef4444', marginTop: '0.125rem' }}>{p.passCode}</div>
                    </div>
                    <StatusBadge
                      label={p.status.replace('_', ' ')}
                      variant={p.status === 'CHECKED_IN' ? 'success' : p.status === 'EXPECTED' ? 'info' : 'neutral'}
                    />
                  </div>

                  {p.status === 'EXPECTED' && (
                    <button
                      onClick={() => handleCheckIn(p)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.625rem',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.625rem',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        minHeight: 44,
                      }}
                    >
                      <CheckCircle2 size={16} /> Allow Entry
                    </button>
                  )}

                  {p.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleCheckOut(p.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        padding: '0.625rem',
                        background: '#78716c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.625rem',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        minHeight: 44,
                      }}
                    >
                      <LogOut size={16} /> Check Out
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Verification Result Modal */}
      {validationResult && (
        <Modal isOpen={!!validationResult} onClose={() => setValidationResult(null)} title="Pass Validation Result">
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
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

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: validationResult.isValid ? '#065f46' : '#991b1b' }}>
              {validationResult.isValid ? 'PASS VALIDATED' : 'ENTRY REJECTED'}
            </h3>

            {validationResult.pass && (
              <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '0.75rem', margin: '0.75rem 0', textAlign: 'left', fontSize: '0.8125rem' }}>
                <div style={{ marginBottom: '0.25rem' }}>Visitor: <strong>{validationResult.pass.visitorName}</strong></div>
                <div style={{ marginBottom: '0.25rem' }}>Destination: <strong>{validationResult.pass.flatCode}</strong> ({validationResult.pass.residentName})</div>
                <div>Category: {validationResult.pass.category}</div>
              </div>
            )}

            {!validationResult.isValid && (
              <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.875rem', margin: '0.5rem 0 1rem 0' }}>
                {validationResult.reason}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem' }}>
              <button
                onClick={() => setValidationResult(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e8e2d8', background: '#fff', fontWeight: 600, fontSize: '0.8125rem', minHeight: 44, cursor: 'pointer' }}
              >
                Dismiss
              </button>
              {validationResult.isValid && validationResult.pass && (
                <button
                  onClick={() => handleCheckIn(validationResult.pass!)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '0.8125rem', minHeight: 44, cursor: 'pointer' }}
                >
                  Approve Entry
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* QR Scanner Modal */}
      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="QR Scanner">
        <QRScanner
          onScan={(code) => {
            handleValidateCode(code);
          }}
        />
      </Modal>

      {/* Blacklist Modal */}
      <Modal isOpen={isBlacklistModalOpen} onClose={() => setIsBlacklistModalOpen(false)} title="Watchlist Management">
        <Form onSubmit={handleAddBlacklist}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <FormField label="Visitor Name" required>
              <input
                type="text"
                required
                value={blName}
                onChange={(e) => setBlName(e.target.value)}
                placeholder="e.g. Karan Mehra"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e8e2d8', fontSize: '0.875rem' }}
              />
            </FormField>
            <FormField label="Phone Number" required>
              <input
                type="tel"
                required
                value={blPhone}
                onChange={(e) => setBlPhone(e.target.value)}
                placeholder="10-digit phone"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e8e2d8', fontSize: '0.875rem' }}
              />
            </FormField>
            <FormField label="Reason for Blacklisting" required>
              <input
                type="text"
                required
                value={blReason}
                onChange={(e) => setBlReason(e.target.value)}
                placeholder="e.g. Altercation with gate staff"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e8e2d8', fontSize: '0.875rem' }}
              />
            </FormField>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, marginTop: '1rem', cursor: 'pointer', minHeight: 48, fontSize: '0.875rem' }}
          >
            Add to Blacklist
          </button>
        </Form>

        {/* Existing blacklist items */}
        {blacklist.length > 0 && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid #f5f5f4', paddingTop: '0.75rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Watchlist</h4>
            {blacklist.map((bl, i) => (
              <div key={i} style={{ padding: '0.625rem', background: '#fffbeb', borderRadius: '0.625rem', marginBottom: '0.375rem', border: '1px solid #fef3c7' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#92400e' }}>{bl.name}</div>
                <div style={{ fontSize: '0.6875rem', color: '#a16207' }}>{bl.phone} • {bl.reason}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
