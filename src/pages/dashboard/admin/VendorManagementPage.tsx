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
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={24} color="#8b5cf6" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Vendor Management & Procurement</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage society suppliers, contractors, and service partners.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Onboard Vendor
        </button>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <DataTable
          columns={columns}
          data={vendors}
          keyExtractor={(v) => v.id}
          pageSize={10}
          mobileRender={(v) => (
            <MobileDataCard
              title={v.companyName}
              subtitle={v.category}
              status={<StatusBadge label={v.contractStatus} variant={v.contractStatus === 'ACTIVE' ? 'success' : 'danger'} />}
              attributes={[
                { label: 'Contact', value: `${v.contactPerson} (${v.phone})` },
                { label: 'Expiry', value: v.contractExpiryDate }
              ]}
            />
          )}
        />
      </div>

      <VendorPerformanceHub />

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Vendor">
        <Form onSubmit={handleCreateVendor}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FormField label="Company Name">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Pure Aqua Solutions"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              />
            </FormField>
            <FormField label="Service Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              >
                <option value="WATER_SUPPLY">Water Supply</option>
                <option value="WASTE_MANAGEMENT">Waste Management</option>
                <option value="ELEVATOR_MAINTENANCE">Elevator Maintenance</option>
                <option value="SECURITY_AGENCY">Security Agency</option>
                <option value="LANDSCAPING">Landscaping</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FormField label="Contact Person">
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
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
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{ padding: '0.65rem 1rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.65rem 1rem', border: 'none', background: '#8b5cf6', color: '#fff', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Onboard Vendor
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
