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
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--aarizo-blue, #176B91)" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Visitor & Gate Pass Hub</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Pre-approve expected guests, deliveries, cabs, and event group entry passes for Flat {currentFlat}.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            background: 'var(--aarizo-blue, #176B91)',
            color: '#fff',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Pre-Approve Visitor
        </button>
      </header>

      {/* Active & Expected Passes */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Active & Pre-Approved Gate Passes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {passes.map((pass) => (
            <div
              key={pass.id}
              style={{
                padding: '1.25rem',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                      {pass.category.replace('_', ' ')}
                    </span>
                    <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', color: '#0f172a' }}>{pass.visitorName}</h4>
                  </div>
                  <StatusBadge
                    label={pass.status.replace('_', ' ')}
                    variant={pass.status === 'EXPECTED' ? 'info' : pass.status === 'CHECKED_IN' ? 'success' : pass.status === 'REVOKED' ? 'danger' : 'neutral'}
                  />
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                  <div>Phone: <strong>{pass.visitorPhone}</strong></div>
                  {pass.companyName && <div>Company: <strong>{pass.companyName}</strong></div>}
                  {pass.purpose && <div>Purpose: {pass.purpose}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    <Clock size={14} /> Pass Code: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{pass.passCode}</span>
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
                    gap: '0.35rem',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  <QrCode size={16} color="#2563eb" /> View QR
                </button>
                {pass.status === 'EXPECTED' && (
                  <button
                    onClick={() => handleRevoke(pass.id)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                    title="Revoke Pass"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

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

