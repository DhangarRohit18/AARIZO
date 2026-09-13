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
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Super Admin — Multi-Society Directory</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Provision and manage society accounts, subscription tiers, and assigned administrators.
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
          <Plus size={18} /> Add New Society
        </button>
      </header>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <DataTable columns={columns} data={societies} keyExtractor={(s) => s.id} />
      </div>

      {/* Add Society Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Provision New Society Account">
        <Form onSubmit={handleCreateSociety}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Society Name" required>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Skyline Residency"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
            <FormField label="Society Code" required>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SKL-01"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
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
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <FormField label="City">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
            <FormField label="State">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
            <FormField label="Pincode">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Subscription Tier">
              <select
                value={subscriptionTier}
                onChange={(e) => setSubscriptionTier(e.target.value as SubscriptionTier)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
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
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <FormField label="Assigned Admin Email">
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="e.g. admin@skylineresidency.org"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}
            >
              Create Society
            </button>
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
