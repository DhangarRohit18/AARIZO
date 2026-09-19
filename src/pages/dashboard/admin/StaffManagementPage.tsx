import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Staff, StaffType, DomesticWorker } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

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
  const [shiftTiming] = useState('08:00 AM - 08:00 PM');

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Security Guards & Staff Roster</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage security personnel, facility technicians, and domestic household helpers.
          </p>
        </div>
        <button
          onClick={() => setIsAddStaffModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Assign Staff
        </button>
      </header>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('STAFF')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'STAFF' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'STAFF' ? '#1d4ed8' : '#64748b',
            fontWeight: activeTab === 'STAFF' ? 600 : 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Facility Staff ({staff.length})
        </button>
        <button
          onClick={() => setActiveTab('DOMESTIC')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'DOMESTIC' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'DOMESTIC' ? '#1d4ed8' : '#64748b',
            fontWeight: activeTab === 'DOMESTIC' ? 600 : 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Domestic Workers ({domesticWorkers.length})
        </button>
      </div>

      {activeTab === 'STAFF' ? (
        <DataTable
          columns={staffColumns}
          data={staff}
          keyExtractor={(s) => s.id}
          pageSize={10}
          mobileRender={(s) => (
            <MobileDataCard
              title={s.name}
              subtitle={s.phone}
              status={<StatusBadge label={s.status} variant={s.status === 'ON_DUTY' ? 'success' : 'neutral'} />}
              attributes={[
                { label: 'Role', value: s.staffType },
                { label: 'Assigned', value: s.gateAssigned }
              ]}
            />
          )}
        />
      ) : (
        <DataTable
          columns={domesticColumns}
          data={domesticWorkers}
          keyExtractor={(dw) => dw.id}
          pageSize={10}
          mobileRender={(dw) => (
            <MobileDataCard
              title={dw.name}
              subtitle={dw.phone}
              status={<StatusBadge label={dw.status === 'INSIDE' ? 'INSIDE COMPLEX' : 'OUTSIDE'} variant={dw.status === 'INSIDE' ? 'success' : 'neutral'} />}
              attributes={[
                { label: 'Service Role', value: dw.workRole },
                { label: 'Passcode', value: dw.passCode }
              ]}
            />
          )}
        />
      )}

      <Modal isOpen={isAddStaffModalOpen} onClose={() => setIsAddStaffModalOpen(false)} title="Assign New Staff Member">
        <Form onSubmit={handleCreateStaff}>
          <FormField label="Staff Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <FormField label="Phone Number">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FormField label="Role">
              <select
                value={staffType}
                onChange={(e) => setStaffType(e.target.value as StaffType)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              >
                <option value="GUARD">Security Guard</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </FormField>
            <FormField label="Gate Assigned">
              <select
                value={gateAssigned}
                onChange={(e) => setGateAssigned(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              >
                <option value="Main Gate 1">Main Gate 1</option>
                <option value="Main Gate 2">Main Gate 2</option>
                <option value="Basement - A">Basement - A</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAddStaffModalOpen(false)}
              style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.65rem 1rem', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Confirm Assignment
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
