import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Staff, StaffType, DomesticWorker } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';

export const StaffManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const [staff, setStaff] = useState<Staff[]>(societyService.getStaff(currentSocietyId));
  const [domesticWorkers, setDomesticWorkers] = useState<DomesticWorker[]>(
    societyService.getDomesticWorkers(currentSocietyId)
  );

  const [activeTab, setActiveTab] = useState<'STAFF' | 'DOMESTIC'>('STAFF');
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  // New staff form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [staffType, setStaffType] = useState<StaffType>('GUARD');
  const [gateAssigned, setGateAssigned] = useState('Main Gate 1');
  const [shiftTiming, setShiftTiming] = useState('08:00 AM - 08:00 PM');

  const refreshData = () => {
    setStaff(societyService.getStaff(currentSocietyId));
    setDomesticWorkers(societyService.getDomesticWorkers(currentSocietyId));
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    societyService.createStaff(
      {
        societyId: currentSocietyId,
        name,
        phone,
        staffType,
        gateAssigned,
        shiftTiming,
        status: 'ON_DUTY',
      },
      { id: 'sec-admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' }
    );

    refreshData();
    setIsAddStaffModalOpen(false);
    setName('');
    setPhone('');
  };

  const staffColumns: Column<Staff>[] = [
    { key: 'name', header: 'Staff Member Name', sortable: true },
    { key: 'phone', header: 'Phone Number' },
    { key: 'staffType', header: 'Role' },
    { key: 'gateAssigned', header: 'Assigned Gate / Shift' },
    {
      key: 'status',
      header: 'Duty Status',
      render: (s) => (
        <StatusBadge
          label={s.status}
          variant={s.status === 'ON_DUTY' ? 'success' : 'neutral'}
        />
      ),
    },
  ];

  const domesticColumns: Column<DomesticWorker>[] = [
    { key: 'name', header: 'Worker Name', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'workRole', header: 'Service Role' },
    { key: 'passCode', header: 'Gate Passcode' },
    {
      key: 'status',
      header: 'Current Location',
      render: (dw) => (
        <StatusBadge
          label={dw.status === 'INSIDE' ? 'INSIDE COMPLEX' : 'OUTSIDE'}
          variant={dw.status === 'INSIDE' ? 'success' : 'neutral'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Security Guards & Staff Roster</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage security personnel, facility technicians, and domestic household helpers.
          </p>
        </div>
        {activeTab === 'STAFF' && (
          <button
            onClick={() => setIsAddStaffModalOpen(true)}
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
            <Plus size={18} /> Register Staff
          </button>
        )}
      </header>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('STAFF')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: activeTab === 'STAFF' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'STAFF' ? '#eff6ff' : '#fff',
            color: activeTab === 'STAFF' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Security & Facility Staff ({staff.length})
        </button>
        <button
          onClick={() => setActiveTab('DOMESTIC')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: activeTab === 'DOMESTIC' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'DOMESTIC' ? '#eff6ff' : '#fff',
            color: activeTab === 'DOMESTIC' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Domestic Workers & Maids ({domesticWorkers.length})
        </button>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        {activeTab === 'STAFF' ? (
          <DataTable columns={staffColumns} data={staff} keyExtractor={(s) => s.id} />
        ) : (
          <DataTable columns={domesticColumns} data={domesticWorkers} keyExtractor={(dw) => dw.id} />
        )}
      </div>

      <Modal isOpen={isAddStaffModalOpen} onClose={() => setIsAddStaffModalOpen(false)} title="Register Security Guard / Staff">
        <Form onSubmit={handleCreateStaff}>
          <FormField label="Full Name" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Officer R. Singh"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <FormField label="Phone Number" required>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Staff Role">
              <select
                value={staffType}
                onChange={(e) => setStaffType(e.target.value as StaffType)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="GUARD">Security Guard</option>
                <option value="ELECTRICIAN">Electrician</option>
                <option value="PLUMBER">Plumber</option>
                <option value="CLEANER">Cleaner</option>
                <option value="SUPERVISOR">Supervisor</option>
              </select>
            </FormField>

            <FormField label="Gate Assigned">
              <input
                type="text"
                value={gateAssigned}
                onChange={(e) => setGateAssigned(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <FormField label="Shift Timing">
            <input
              type="text"
              value={shiftTiming}
              onChange={(e) => setShiftTiming(e.target.value)}
              placeholder="e.g. 08:00 AM - 08:00 PM"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(false)}
              style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}
            >
              Register Staff
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};


