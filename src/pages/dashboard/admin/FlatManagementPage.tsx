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
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Flat Inventory & Directory</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage society units, occupancy status, and flat specifications.
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
          <Plus size={18} /> Add Flat
        </button>
      </header>

      {/* Filter Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <FilterBar
          options={[
            { id: 'ALL', label: 'All Units', count: flats.length },
            { id: 'OWNER_OCCUPIED', label: 'Owner Occupied', count: flats.filter((f) => f.occupancyStatus === 'OWNER_OCCUPIED').length },
            { id: 'TENANT_OCCUPIED', label: 'Tenant Occupied', count: flats.filter((f) => f.occupancyStatus === 'TENANT_OCCUPIED').length },
            { id: 'VACANT', label: 'Vacant', count: flats.filter((f) => f.occupancyStatus === 'VACANT').length },
          ]}
          activeFilter={occupancyFilter}
          onFilterChange={setOccupancyFilter}
        />
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <DataTable columns={columns} data={filteredFlats} keyExtractor={(f) => f.id} />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Flat">
        <Form onSubmit={handleCreateFlat}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Tower" required>
              <select
                value={selectedTowerId}
                onChange={(e) => setSelectedTowerId(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                {towers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Block {t.blockCode})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Floor Number" required>
              <input
                type="number"
                min={1}
                value={floorNumber}
                onChange={(e) => setFloorNumber(Number(e.target.value))}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Flat Number" required>
              <input
                type="text"
                required
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. B-1204"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>

            <FormField label="BHK Layout">
              <select
                value={bhkType}
                onChange={(e) => setBhkType(e.target.value as BHKType)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
                <option value="PENTHOUSE">Penthouse</option>
              </select>
            </FormField>
          </div>

          <FormField label="Occupancy Status">
            <select
              value={occupancyStatus}
              onChange={(e) => setOccupancyStatus(e.target.value as OccupancyStatus)}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="OWNER_OCCUPIED">Owner Occupied</option>
              <option value="TENANT_OCCUPIED">Tenant Occupied</option>
              <option value="VACANT">Vacant</option>
            </select>
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
              Add Flat
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

