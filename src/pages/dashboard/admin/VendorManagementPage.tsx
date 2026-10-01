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
            <ShoppingBag className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-lg sm:text-xl font-bold text-white">Vendor Management & Procurement</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            Manage society suppliers, contractors, and service partners.
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
          <Plus size={16} /> Onboard Vendor
        </button>
      </header>

      <div className="mb-6 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Company Name">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Pure Aqua Solutions"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
              <FormField label="Service Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VendorCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                >
                  <option value="WATER_SUPPLY">Water Supply</option>
                  <option value="WASTE_MANAGEMENT">Waste Management</option>
                  <option value="ELEVATOR_MAINTENANCE">Elevator Maintenance</option>
                  <option value="SECURITY_AGENCY">Security Agency</option>
                  <option value="LANDSCAPING">Landscaping</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Person">
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
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
            </div>
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
                Onboard Vendor
              </button>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
