import React, { useState } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Vendor, VendorCategory } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { VendorPerformanceHub } from '../../../domains/vendors';

export const VendorManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const [vendors, setVendors] = useState<Vendor[]>(societyService.getVendors(currentSocietyId));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('WATER_SUPPLY');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');

  const refreshData = () => {
    setVendors(societyService.getVendors(currentSocietyId));
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson) return;

    societyService.createVendor(
      {
        societyId: currentSocietyId,
        companyName,
        category,
        contactPerson,
        phone,
        contractStatus: 'ACTIVE',
        contractExpiryDate: '2026-12-31',
      },
      { id: 'sec-admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' }
    );

    refreshData();
    setIsAddModalOpen(false);
    setCompanyName('');
    setContactPerson('');
    setPhone('');
  };

  const columns: Column<Vendor>[] = [
    { key: 'companyName', header: 'Vendor / Company', sortable: true },
    { key: 'category', header: 'Service Category' },
    {
      key: 'contactPerson',
      header: 'Contact Representative',
      render: (v) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v.contactPerson}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.phone}</div>
        </div>
      ),
    },
    { key: 'contractExpiryDate', header: 'Contract Expiry' },
    {
      key: 'contractStatus',
      header: 'Contract Status',
      render: (v) => (
        <StatusBadge
          label={v.contractStatus}
          variant={v.contractStatus === 'ACTIVE' ? 'success' : 'danger'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Approved Vendors & Service Providers</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage commercial supply vendors, maintenance contracts, and gate dispatch permissions.
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
          <Plus size={18} /> Register Vendor
        </button>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <VendorPerformanceHub />
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
          Vendor Directory & Dispatch Roster
        </h2>
        <DataTable columns={columns} data={vendors} keyExtractor={(v) => v.id} />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Approved Society Vendor">
        <Form onSubmit={handleCreateVendor}>
          <FormField label="Company / Vendor Name" required>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. AquaPure Mineral Water"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Service Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="WATER_SUPPLY">Water Supply</option>
                <option value="WASTE_MANAGEMENT">Waste Management</option>
                <option value="INTERNET">ISP / Telecom</option>
                <option value="ELEVATOR_MAINTENANCE">Elevator Maintenance</option>
                <option value="SECURITY_AGENCY">Security Agency</option>
              </select>
            </FormField>

            <FormField label="Contact Person" required>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ramesh Gupta"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <FormField label="Phone Number" required>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone"
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
              Register Vendor
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

