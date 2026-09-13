import React, { useState } from 'react';
import { UserCheck, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { staffService } from '../../../services/staffService';
import type { DomesticWorkerProfile, WorkerType } from '../../../types/staff';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';

export const DomesticHelpHubPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const currentResidentId = 'res-1'; // Vikram Joshi (B-1204)
  const currentFlatCode = 'B-1204';

  const [workers, setWorkers] = useState<DomesticWorkerProfile[]>(
    staffService.getWorkers(currentSocietyId).filter((w) => w.assignedFlatCodes.includes(currentFlatCode))
  );

  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedWorkerForReport, setSelectedWorkerForReport] = useState<DomesticWorkerProfile | null>(null);

  // Hire Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [workerType, setWorkerType] = useState<WorkerType>('MAID');

  // Report Form State
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const refreshData = () => {
    setWorkers(
      staffService.getWorkers(currentSocietyId).filter((w) => w.assignedFlatCodes.includes(currentFlatCode))
    );
  };

  const handleHireWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    staffService.createWorkerProfile(
      {
        societyId: currentSocietyId,
        name,
        phone,
        workerType,
        emergencyContactName: 'Family',
        emergencyContactPhone: phone,
        assignedFlatCodes: [currentFlatCode],
      },
      { id: currentResidentId, name: 'Vikram Joshi', role: 'RESIDENT' }
    );

    refreshData();
    setIsHireModalOpen(false);
    setName('');
    setPhone('');
  };

  const handleRevokeFlat = (workerId: string) => {
    staffService.revokeFlatAccess(workerId, currentFlatCode, { id: currentResidentId, name: 'Vikram Joshi', role: 'RESIDENT' });
    refreshData();
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerForReport || !reason) return;

    staffService.reportWorkerIncident(
      {
        societyId: currentSocietyId,
        workerId: selectedWorkerForReport.id,
        workerName: selectedWorkerForReport.name,
        residentId: currentResidentId,
        residentName: 'Vikram Joshi',
        flatCode: currentFlatCode,
        reason,
        severity,
      },
      { id: currentResidentId, name: 'Vikram Joshi', role: 'RESIDENT' }
    );

    alert('Misconduct report logged with Security & Society Administration.');
    setSelectedWorkerForReport(null);
    setReason('');
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Household Staff & Domestic Help</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Flat B-1204 • Manage household maids, cooks, drivers, and track live gate attendance.
          </p>
        </div>
        <button
          onClick={() => setIsHireModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Request / Add Worker
        </button>
      </header>

      {/* Household Staff Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {workers.map((worker) => (
          <div key={worker.id} style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={worker.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                  alt={worker.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, color: '#0f172a' }}>{worker.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>{worker.workerType}</div>
                </div>
              </div>
              <StatusBadge
                label={worker.attendanceStatus === 'IN' ? 'IN COMPLEX' : 'OUTSIDE'}
                variant={worker.attendanceStatus === 'IN' ? 'success' : 'neutral'}
              />
            </div>

            <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
              <div>Phone: <strong>{worker.phone}</strong></div>
              <div>Gate Passcode: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{worker.passCode}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                <ShieldCheck size={14} /> Police Verification: {worker.verificationStatus}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <button
                onClick={() => setSelectedWorkerForReport(worker)}
                style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Report Misconduct
              </button>
              <button
                onClick={() => handleRevokeFlat(worker.id)}
                style={{ padding: '0.45rem 0.65rem', borderRadius: '6px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}
                title="Revoke Access to Flat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hire Modal */}
      <Modal isOpen={isHireModalOpen} onClose={() => setIsHireModalOpen(false)} title="Register Household Worker Access">
        <Form onSubmit={handleHireWorker}>
          <FormField label="Worker Full Name" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunita Devi"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Mobile Number" required>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>

            <FormField label="Role / Category">
              <select
                value={workerType}
                onChange={(e) => setWorkerType(e.target.value as WorkerType)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="MAID">Housemaid / Housekeeping</option>
                <option value="COOK">Cook / Chef</option>
                <option value="NANNY">Nanny / Babysitter</option>
                <option value="DRIVER">Personal Driver</option>
                <option value="CLEANER">Cleaner</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsHireModalOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>Register Access</button>
          </div>
        </Form>
      </Modal>

      {/* Report Misconduct Modal */}
      {selectedWorkerForReport && (
        <Modal isOpen={!!selectedWorkerForReport} onClose={() => setSelectedWorkerForReport(null)} title={`Report Incident — ${selectedWorkerForReport.name}`}>
          <Form onSubmit={handleReportIncident}>
            <FormField label="Incident Description / Reason" required>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe reason for report..."
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
              />
            </FormField>

            <FormField label="Severity Level">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="LOW">Low (Minor Delay / Absence)</option>
                <option value="MEDIUM">Medium (Misconduct / Dispute)</option>
                <option value="HIGH">High (Security Concern / Theft Alert)</option>
              </select>
            </FormField>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setSelectedWorkerForReport(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600 }}>Log Incident Report</button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
};
