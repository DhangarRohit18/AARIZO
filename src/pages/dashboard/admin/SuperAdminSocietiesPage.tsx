import React, { useState } from 'react';
import { Building2, Plus, Power } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Society, SubscriptionTier } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

export const SuperAdminSocietiesPage: React.FC = () => {
  const [societies, setSocieties] = useState<Society[]>(societyService.getSocieties());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState<{ open: boolean; society?: Society; newStatus?: Society['status'] }>({ open: false });

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('PRO');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const refreshData = () => {
    setSocieties(societyService.getSocieties());
  };

  const handleCreateSociety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    societyService.createSociety(
      {
        name,
        code,
        address,
        city,
        state,
        pincode,
        status: 'ACTIVE',
        subscriptionTier,
        adminName: adminName || 'Assigned Admin',
        adminEmail: adminEmail || 'admin@society.org',
      },
      { id: 'super-admin-1', name: 'System Super Admin', role: 'SUPER_ADMIN' }
    );

    refreshData();
    setIsAddModalOpen(false);
    // Reset form
    setName('');
    setCode('');
    setAddress('');
    setAdminName('');
    setAdminEmail('');
  };

  const handleToggleStatus = () => {
    if (!confirmStatusModal.society || !confirmStatusModal.newStatus) return;
    societyService.updateSocietyStatus(
      confirmStatusModal.society.id,
      confirmStatusModal.newStatus,
      { id: 'super-admin-1', name: 'System Super Admin', role: 'SUPER_ADMIN' }
    );
    refreshData();
  };

  const columns: Column<Society>[] = [
    { key: 'code', header: 'Society Code', width: '110px' },
    {
      key: 'name',
      header: 'Society Name',
      sortable: true,
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.address}, {s.city}</div>
        </div>
      ),
    },
    {
      key: 'adminName',
      header: 'Assigned Admin',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 500 }}>{s.adminName || 'Unassigned'}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.adminEmail}</div>
        </div>
      ),
    },
    {
      key: 'subscriptionTier',
      header: 'Subscription',
      render: (s) => (
        <StatusBadge
          label={s.subscriptionTier}
          variant={s.subscriptionTier === 'ENTERPRISE' ? 'purple' : s.subscriptionTier === 'PRO' ? 'info' : 'neutral'}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <StatusBadge
          label={s.status}
          variant={s.status === 'ACTIVE' ? 'success' : s.status === 'SUSPENDED' ? 'danger' : 'warning'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setConfirmStatusModal({ open: true, society: s, newStatus: s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
            style={{
              padding: '0.35rem 0.6rem',
              border: 'none',
              borderRadius: '6px',
              background: s.status === 'ACTIVE' ? '#fef2f2' : '#ecfdf5',
              color: s.status === 'ACTIVE' ? '#dc2626' : '#059669',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            title={s.status === 'ACTIVE' ? 'Suspend Society' : 'Activate Society'}
          >
            <Power size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-6 pb-24 max-w-7xl mx-auto font-sans text-slate-800">
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
            <Building2 className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-lg sm:text-xl font-bold text-white">Super Admin — Multi-Society Directory</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            Provision and manage society accounts, subscription tiers, and assigned administrators.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: 'var(--aarizo-blue, #176B91)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition"
        >
          <Plus size={16} /> Add New Society
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <DataTable columns={columns} data={societies} keyExtractor={(s) => s.id} />
      </div>

      {/* Add Society Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Provision New Society Account">
        <Form onSubmit={handleCreateSociety}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Society Name" required>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Skyline Residency"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
              <FormField label="Society Code" required>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SKL-01"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
            </div>

            <FormField label="Street Address" required>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 15, Sector 4, Vashi"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="City">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
              <FormField label="State">
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
              <FormField label="Pincode">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Subscription Tier">
                <select
                  value={subscriptionTier}
                  onChange={(e) => setSubscriptionTier(e.target.value as SubscriptionTier)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                >
                  <option value="BASIC">Basic (Up to 100 flats)</option>
                  <option value="PRO">Pro (Up to 300 flats)</option>
                  <option value="ENTERPRISE">Enterprise (Unlimited)</option>
                </select>
              </FormField>
              <FormField label="Assigned Admin Name">
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
            </div>

            <FormField label="Assigned Admin Email">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="e.g. admin@skylineresidency.org"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: 'var(--aarizo-blue, #176B91)' }}
                className="px-4 py-2 border-none text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition"
              >
                Create Society
              </button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Confirm Status Change Dialog */}
      <ConfirmDialog
        isOpen={confirmStatusModal.open}
        onClose={() => setConfirmStatusModal({ open: false })}
        onConfirm={handleToggleStatus}
        title={`${confirmStatusModal.newStatus === 'ACTIVE' ? 'Activate' : 'Suspend'} Society`}
        message={`Are you sure you want to change status of ${confirmStatusModal.society?.name} to ${confirmStatusModal.newStatus}?`}
        variant={confirmStatusModal.newStatus === 'SUSPENDED' ? 'danger' : 'info'}
      />
    </div>
  );
};

