import React, { useState } from 'react';
import { Shield, Plus, Users, Home } from 'lucide-react';
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
    <div className="p-3 sm:p-6 max-w-6xl mx-auto font-sans text-slate-800">
      {/* Aarizo Gradient Header Banner */}
      <header
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
        }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-lg sm:text-xl font-bold text-white">Security Guards & Staff Roster</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            Manage security personnel, facility technicians, and domestic household helpers.
          </p>
        </div>
        <button
          onClick={() => setIsAddStaffModalOpen(true)}
          style={{
            background: 'var(--aarizo-blue, #176B91)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition"
        >
          <Plus size={16} /> Assign Staff
        </button>
      </header>

      {/* Tabs */}
      <div
        style={{
          background: '#EBF3F7',
          borderRadius: '16px',
          padding: '0.375rem',
          display: 'flex',
          gap: '0.375rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          boxShadow: 'inset 0 1px 3px rgba(8, 59, 86, 0.06)',
          marginBottom: '1.25rem',
        }}
      >
        {[
          { key: 'STAFF', label: `Facility Staff (${staff.length})`, icon: Users },
          { key: 'DOMESTIC', label: `Domestic Workers (${domesticWorkers.length})`, icon: Home },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: isActive ? 'none' : '1px solid #DCE8EF',
                background: isActive ? 'var(--aarizo-navy, #083B56)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 3px 10px rgba(8, 59, 86, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
            >
              <Icon size={15} color={isActive ? 'var(--aarizo-sky, #83CBEA)' : 'var(--aarizo-blue, #176B91)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
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
      </div>

      <Modal isOpen={isAddStaffModalOpen} onClose={() => setIsAddStaffModalOpen(false)} title="Assign New Staff Member">
        <Form onSubmit={handleCreateStaff}>
          <div className="space-y-4">
            <FormField label="Staff Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
              />
            </FormField>
            <FormField label="Phone Number">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Role">
                <select
                  value={staffType}
                  onChange={(e) => setStaffType(e.target.value as StaffType)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                >
                  <option value="Main Gate 1">Main Gate 1</option>
                  <option value="Main Gate 2">Main Gate 2</option>
                  <option value="Basement - A">Basement - A</option>
                </select>
              </FormField>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(false)}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: 'var(--aarizo-blue, #176B91)' }}
                className="px-4 py-2 border-none text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
