import React, { useState } from 'react';
import { Users, Plus, QrCode, Share2, Clock, Trash2 } from 'lucide-react';
import { visitorService } from '../../../services/visitorService';
import type { SmartVisitorPass, VisitorCategory, PassLifecycleType } from '../../../types/visitor';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { QRGenerator } from '../../../components/ui/QRGenerator';

import { useAuth } from '../../../context/AuthContext';

export const VisitorPassHubPage: React.FC = () => {
  const { currentUser } = useAuth();
  const currentSocietyId = (currentUser as any)?.societyId || 'soc-gvs';
  const currentResidentId = currentUser?.id || 'res-1';
  const currentFlat = currentUser?.flatNumber || 'B-1204';
  const residentName = currentUser?.name || 'Sarvesh Kulkarni';

  const filterMyPasses = (allPasses: SmartVisitorPass[]) => {
    return allPasses.filter(
      (p) =>
        p.societyId === currentSocietyId &&
        (p.residentId === currentResidentId || p.residentId === 'res-1' || p.flatCode === currentFlat)
    );
  };

  const [passes, setPasses] = useState<SmartVisitorPass[]>(
    filterMyPasses(visitorService.getPasses(currentSocietyId))
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPassForQR, setSelectedPassForQR] = useState<SmartVisitorPass | null>(null);

  // Form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [category, setCategory] = useState<VisitorCategory>('GUEST');
  const [passLifecycle, setPassLifecycle] = useState<PassLifecycleType>('ONE_TIME');
  const [companyName, setCompanyName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [groupCount, setGroupCount] = useState<number>(1);

  const refreshData = () => {
    setPasses(filterMyPasses(visitorService.getPasses(currentSocietyId)));
  };

  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) return;

    const newPass = visitorService.createVisitorPass(
      {
        societyId: currentSocietyId,
        residentId: currentResidentId,
        residentName,
        flatCode: currentFlat,
        towerName: 'Tower B',
        visitorName,
        visitorPhone,
        category,
        passLifecycle,
        companyName,
        vehicleNumber,
        purpose,
        groupCount: Number(groupCount),
      },
      { id: currentResidentId, name: residentName, role: 'resident' }
    );

    refreshData();
    setIsCreateModalOpen(false);
    setSelectedPassForQR(newPass);

    // Reset Form
    setVisitorName('');
    setVisitorPhone('');
    setCompanyName('');
    setVehicleNumber('');
    setPurpose('');
    setGroupCount(1);
  };

  const handleRevoke = (passId: string) => {
    visitorService.revokePass(passId, { id: currentResidentId, name: residentName, role: 'resident' });
    refreshData();
  };

  return (
    <div style={{ background: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%' }}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 space-y-6">
        {/* Aarizo Gradient Header */}
        <div
          className="p-5 md:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
          style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)' }}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <Users className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
              <h1 className="text-xl md:text-2xl font-extrabold text-white">Visitor &amp; Gate Pass Hub</h1>
            </div>
            <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
              Pre-approve expected guests, deliveries, cabs, and event group entry passes for Flat {currentFlat}.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              background: 'var(--aarizo-blue, #176B91)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            <Plus size={18} /> Pre-Approve Visitor
          </button>
        </div>

        {/* Active & Expected Passes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--aarizo-navy, #083B56)' }}>
              Active &amp; Pre-Approved Gate Passes ({passes.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {passes.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                }}
              >
                <Users size={40} style={{ color: 'var(--aarizo-blue, #176B91)', margin: '0 auto 0.75rem', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>No Expected Visitors</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-muted, #657785)', margin: '0.25rem 0 0' }}>
                  Generate a quick gate pass to pre-authorize your guests at the main gate.
                </p>
              </div>
            ) : (
              passes.map((pass) => (
                <div
                  key={pass.id}
                  style={{
                    padding: '1.25rem',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                    boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            color: 'var(--aarizo-blue, #176B91)',
                            background: 'var(--aarizo-light-blue, #EAF6FC)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {pass.category.replace(/_/g, ' ')}
                        </span>
                        <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.125rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>
                          {pass.visitorName}
                        </h3>
                      </div>
                      <StatusBadge
                        label={pass.status.replace(/_/g, ' ')}
                        variant={pass.status === 'EXPECTED' ? 'info' : pass.status === 'CHECKED_IN' ? 'success' : pass.status === 'REVOKED' ? 'danger' : 'neutral'}
                      />
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      <div>Phone: <strong style={{ color: 'var(--aarizo-navy, #083B56)' }}>{pass.visitorPhone}</strong></div>
                      {pass.companyName && <div>Company: <strong style={{ color: 'var(--aarizo-navy, #083B56)' }}>{pass.companyName}</strong></div>}
                      {pass.purpose && <div>Purpose: <span style={{ color: '#657785' }}>{pass.purpose}</span></div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#657785', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        <Clock size={14} /> Pass Code: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--aarizo-blue, #176B91)', fontSize: '0.85rem' }}>{pass.passCode}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <button
                      onClick={() => setSelectedPassForQR(pass)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: 'var(--aarizo-navy, #083B56)',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                      }}
                    >
                      <QrCode size={16} color="var(--aarizo-blue, #176B91)" /> View QR Pass
                    </button>
                    {pass.status === 'EXPECTED' && (
                      <button
                        onClick={() => handleRevoke(pass.id)}
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#fef2f2',
                          color: '#dc2626',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                        }}
                        title="Revoke Pass"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Pre-Approve Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Generate Visitor Gate Pass">
        <Form onSubmit={handleCreatePass}>
          <FormField label="Visitor Pass Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VisitorCategory)}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="GUEST">Guest Visit</option>
              <option value="DELIVERY">Delivery (Zomato, Swiggy, Amazon)</option>
              <option value="CAB">Cab / Driver (Uber, Ola)</option>
              <option value="DOMESTIC_WORKER">Domestic Worker / Staff</option>
              <option value="SERVICE_PROVIDER">Service Provider (Plumber, AC Repair)</option>
              <option value="EVENT_GROUP">Event / Party Group Pass</option>
            </select>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Visitor / Contact Name" required>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>

            <FormField label="Mobile Number" required>
              <input
                type="tel"
                required
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                placeholder="10-digit number"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Pass Validity Type">
              <select
                value={passLifecycle}
                onChange={(e) => setPassLifecycle(e.target.value as PassLifecycleType)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="ONE_TIME">One-Time Entry (Single Use)</option>
                <option value="REUSABLE">Reusable Pass (Frequent Entry)</option>
                <option value="SCHEDULED">Scheduled Date Window</option>
              </select>
            </FormField>

            <FormField label="Company / Service (Optional)">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon, Uber, UrbanCompany"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          {category === 'EVENT_GROUP' && (
            <FormField label="Expected Group Size (Count)">
              <input
                type="number"
                min={1}
                max={100}
                value={groupCount}
                onChange={(e) => setGroupCount(Number(e.target.value))}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          )}

          <FormField label="Purpose / Remarks">
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Weekend Dinner / Plumbing Repair"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: 'var(--aarizo-blue, #176B91)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Generate QR Pass
            </button>
          </div>
        </Form>
      </Modal>

      {/* QR Pass Preview Modal */}
      {selectedPassForQR && (
        <Modal isOpen={!!selectedPassForQR} onClose={() => setSelectedPassForQR(null)} title="Gate Entry QR Pass">
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{selectedPassForQR.visitorName}</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              Present QR code or share 4-digit code <strong>{selectedPassForQR.passCode}</strong> with gate security.
            </p>

            <QRGenerator value={selectedPassForQR.qrDataString} label={selectedPassForQR.passCode} size={180} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => {
                  alert(`Gate Passcode ${selectedPassForQR.passCode} copied to clipboard for sharing via WhatsApp!`);
                }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem', borderRadius: '10px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                <Share2 size={16} /> Share Pass via WhatsApp
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

