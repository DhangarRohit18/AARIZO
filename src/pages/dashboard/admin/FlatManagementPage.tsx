import React, { useState } from 'react';
import { Home, Plus } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Flat, BHKType, OccupancyStatus } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { FilterBar } from '../../../components/ui/FilterBar';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

export const FlatManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const [flats, setFlats] = useState<Flat[]>(societyService.getFlats(currentSocietyId));
  const towers = societyService.getTowers(currentSocietyId);
  const [occupancyFilter, setOccupancyFilter] = useState<string>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTowerId, setSelectedTowerId] = useState(towers[0]?.id || '');
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [flatNumber, setFlatNumber] = useState('');
  const [bhkType, setBhkType] = useState<BHKType>('3BHK');
  const [occupancyStatus, setOccupancyStatus] = useState<OccupancyStatus>('OWNER_OCCUPIED');

  const refreshData = () => {
    setFlats(societyService.getFlats(currentSocietyId));
  };

  const handleCreateFlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber || !selectedTowerId) return;

    const tower = towers.find((t) => t.id === selectedTowerId);

    societyService.createFlat(
      {
        societyId: currentSocietyId,
        towerId: selectedTowerId,
        towerName: tower?.name || 'Tower B',
        floorNumber: Number(floorNumber),
        flatNumber: flatNumber.toUpperCase(),
        bhkType,
        occupancyStatus,
      },
      { id: 'sec-admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' }
    );

    refreshData();
    setIsAddModalOpen(false);
    setFlatNumber('');
  };

  const filteredFlats = flats.filter((f) => {
    if (occupancyFilter === 'ALL') return true;
    return f.occupancyStatus === occupancyFilter;
  });

  const columns: Column<Flat>[] = [
    { key: 'flatNumber', header: 'Flat Number', sortable: true, width: '120px' },
    { key: 'towerName', header: 'Tower', sortable: true },
    { key: 'floorNumber', header: 'Floor' },
    { key: 'bhkType', header: 'BHK Type' },
    {
      key: 'primaryResidentName',
      header: 'Primary Resident',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 500 }}>{f.primaryResidentName || 'Vacant'}</div>
          {f.phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.phone}</div>}
        </div>
      ),
    },
    {
      key: 'occupancyStatus',
      header: 'Occupancy Status',
      render: (f) => (
        <StatusBadge
          label={f.occupancyStatus.replace('_', ' ')}
          variant={f.occupancyStatus === 'OWNER_OCCUPIED' ? 'success' : f.occupancyStatus === 'TENANT_OCCUPIED' ? 'info' : 'warning'}
        />
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 space-y-6">
      <header
        className="p-5 md:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
        style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Flat Inventory &amp; Directory</h1>
          </div>
          <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            Manage society units, occupancy status, and flat specifications.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition flex-shrink-0"
          style={{ background: 'var(--aarizo-blue, #176B91)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <Plus size={16} /> Add Flat
        </button>
      </header>

      <FilterBar
        options={[
          { label: 'All Flats', id: 'ALL' },
          { label: 'Owner Occupied', id: 'OWNER_OCCUPIED' },
          { label: 'Tenant Occupied', id: 'TENANT_OCCUPIED' },
          { label: 'Vacant', id: 'VACANT' },
        ]}
        activeFilter={occupancyFilter}
        onFilterChange={setOccupancyFilter}
      />

      <div style={{ marginTop: '1.5rem' }}>
        <DataTable
          columns={columns}
          data={filteredFlats}
          keyExtractor={(item) => item.id}
          pageSize={10}
          mobileRender={(f) => (
            <MobileDataCard
              title={f.flatNumber}
              subtitle={f.primaryResidentName || 'Vacant'}
              status={<StatusBadge label={f.occupancyStatus.replace('_', ' ')} variant={f.occupancyStatus === 'OWNER_OCCUPIED' ? 'success' : f.occupancyStatus === 'TENANT_OCCUPIED' ? 'info' : 'warning'} />}
              attributes={[
                { label: 'Tower', value: f.towerName },
                { label: 'Floor', value: f.floorNumber },
                { label: 'BHK', value: f.bhkType },
                { label: 'Phone', value: f.phone || '-' }
              ]}
            />
          )}
        />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Flat">
        <Form onSubmit={handleCreateFlat}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FormField label="Tower / Block">
              <select
                value={selectedTowerId}
                onChange={(e) => setSelectedTowerId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              >
                {towers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Floor Number">
              <input
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(Number(e.target.value))}
                min="0"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <FormField label="Flat Number">
              <input
                type="text"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. 204"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
              />
            </FormField>
            <FormField label="BHK Type">
              <select
                value={bhkType}
                onChange={(e) => setBhkType(e.target.value as BHKType)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              >
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="PENTHOUSE">Penthouse</option>
              </select>
            </FormField>
          </div>
          <FormField label="Initial Occupancy Status">
            <select
              value={occupancyStatus}
              onChange={(e) => setOccupancyStatus(e.target.value as OccupancyStatus)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
            >
              <option value="OWNER_OCCUPIED">Owner Occupied</option>
              <option value="TENANT_OCCUPIED">Tenant Occupied</option>
              <option value="VACANT">Vacant</option>
            </select>
          </FormField>
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
              style={{ padding: '0.65rem 1rem', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Register Flat
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
