import React, { useState } from 'react';
import { UserCheck, Plus, FileText } from 'lucide-react';
import { staffService } from '../../../services/staffService';
import type { DomesticWorkerProfile, WorkerType, VerificationStatus, AccessStatus } from '../../../types/staff';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { FilterBar } from '../../../components/ui/FilterBar';

export const DomesticWorkerManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const adminActor = { id: 'admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' };

  const [workers, setWorkers] = useState<DomesticWorkerProfile[]>(staffService.getWorkers(currentSocietyId));
  const [incidents] = useState(staffService.getIncidents(currentSocietyId));
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ATTENDANCE' | 'INCIDENTS'>('DIRECTORY');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWorkerForDocs, setSelectedWorkerForDocs] = useState<DomesticWorkerProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [workerType, setWorkerType] = useState<WorkerType>('MAID');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [assignedFlatCode, setAssignedFlatCode] = useState('B-1204');

  const refreshData = () => {
    setWorkers(staffService.getWorkers(currentSocietyId));
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    staffService.createWorkerProfile(
      {
        societyId: currentSocietyId,
        name,
        phone,
        workerType,
        emergencyContactName: emergencyName || 'Family Contact',
        emergencyContactPhone: emergencyPhone || phone,
        assignedFlatCodes: [assignedFlatCode],
      },
      adminActor
    );

    refreshData();
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
  };

  const handleVerify = (workerId: string, status: VerificationStatus) => {
    staffService.updateVerificationStatus(workerId, status, adminActor);
    refreshData();
    setSelectedWorkerForDocs(null);
  };

  const handleUpdateAccess = (workerId: string, status: AccessStatus) => {
    staffService.updateAccessStatus(workerId, status, adminActor);
    refreshData();
    setSelectedWorkerForDocs(null);
  };

  const filteredWorkers = workers.filter((w) => {
    if (categoryFilter === 'ALL') return true;
    return w.workerType === categoryFilter;
  });

  const columns: Column<DomesticWorkerProfile>[] = [
    {
      key: 'name',
      header: 'Worker Profile',
      sortable: true,
      render: (w) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src={w.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
            alt={w.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{w.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.phone} • Code: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{w.passCode}</span></div>
          </div>
        </div>
      ),
    },
    { key: 'workerType', header: 'Category', sortable: true },
    {
      key: 'assignedFlatCodes',
      header: 'Assigned Flats',
      render: (w) => (
        <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>
          {w.assignedFlatCodes.join(', ') || 'Unassigned'}
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      header: 'Verification',
      render: (w) => (
        <StatusBadge
          label={w.verificationStatus}
          variant={w.verificationStatus === 'VERIFIED' ? 'success' : w.verificationStatus === 'PENDING' ? 'warning' : 'danger'}
        />
      ),
    },
    {
      key: 'attendanceStatus',
      header: 'Attendance',
      render: (w) => (
        <StatusBadge
          label={w.attendanceStatus === 'IN' ? 'INSIDE COMPLEX' : 'OUTSIDE'}
          variant={w.attendanceStatus === 'IN' ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (w) => (
        <button
          onClick={() => setSelectedWorkerForDocs(w)}
          style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Manage / Verify
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Domestic Staff & Verification Hub</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage background verification, police clearances, access statuses, and live attendance for household staff.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
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
          <Plus size={18} /> Register Household Staff
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: activeTab === 'DIRECTORY' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'DIRECTORY' ? '#eff6ff' : '#fff',
            color: activeTab === 'DIRECTORY' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Worker Directory ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('INCIDENTS')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: activeTab === 'INCIDENTS' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'INCIDENTS' ? '#eff6ff' : '#fff',
            color: activeTab === 'INCIDENTS' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Resident Incident Reports ({incidents.length})
        </button>
      </div>

      {activeTab === 'DIRECTORY' && (
        <div style={{ marginBottom: '1.25rem' }}>
          <FilterBar
            options={[
              { id: 'ALL', label: 'All Categories', count: workers.length },
              { id: 'MAID', label: 'Maids / Housekeeping', count: workers.filter((w) => w.workerType === 'MAID').length },
              { id: 'COOK', label: 'Cooks / Chefs', count: workers.filter((w) => w.workerType === 'COOK').length },
              { id: 'DRIVER', label: 'Drivers', count: workers.filter((w) => w.workerType === 'DRIVER').length },
              { id: 'TECHNICIAN', label: 'Technicians', count: workers.filter((w) => w.workerType === 'TECHNICIAN').length },
            ]}
            activeFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
          />
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        {activeTab === 'DIRECTORY' && (
          <DataTable columns={columns} data={filteredWorkers} keyExtractor={(w) => w.id} />
        )}

        {activeTab === 'INCIDENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {incidents.map((inc) => (
              <div key={inc.id} style={{ padding: '1rem', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: '#9f1239' }}>{inc.workerName} • Reported by {inc.residentName} ({inc.flatCode})</span>
                  <StatusBadge label={inc.severity} variant="danger" size="sm" />
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#be123c' }}>{inc.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Worker Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Household Worker Profile">
        <Form onSubmit={handleCreateWorker}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            <FormField label="Mobile Phone" required>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Category / Role">
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
                <option value="ELECTRICIAN">Electrician</option>
                <option value="PLUMBER">Plumber</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </FormField>

            <FormField label="Initial Assigned Flat">
              <input
                type="text"
                value={assignedFlatCode}
                onChange={(e) => setAssignedFlatCode(e.target.value)}
                placeholder="e.g. B-1204"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Emergency Contact Person">
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Spouse / Parent Name"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>

            <FormField label="Emergency Phone">
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Phone number"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>Create Profile</button>
          </div>
        </Form>
      </Modal>

      {/* Verify Documents & Access Status Modal */}
      {selectedWorkerForDocs && (
        <Modal isOpen={!!selectedWorkerForDocs} onClose={() => setSelectedWorkerForDocs(null)} title={`Verify Documents — ${selectedWorkerForDocs.name}`}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Category: <strong>{selectedWorkerForDocs.workerType}</strong> • Phone: <strong>{selectedWorkerForDocs.phone}</strong>
            </div>

            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Verification Documents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {selectedWorkerForDocs.documents.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="#2563eb" />
                    <span>{doc.name}</span>
                  </div>
                  <StatusBadge label={doc.isVerified ? 'VERIFIED' : 'PENDING'} variant={doc.isVerified ? 'success' : 'warning'} size="sm" />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => handleVerify(selectedWorkerForDocs.id, 'VERIFIED')}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Approve Verification
              </button>
              <button
                onClick={() => handleUpdateAccess(selectedWorkerForDocs.id, 'SUSPENDED')}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Suspend Access
              </button>
              <button
                onClick={() => handleUpdateAccess(selectedWorkerForDocs.id, 'BLACK_LISTED')}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Blacklist
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
