import React, { useState } from 'react';
import { Building, Plus, Layers, Home } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Tower } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';

export const TowerManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const [towers, setTowers] = useState<Tower[]>(societyService.getTowers(currentSocietyId));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [towerName, setTowerName] = useState('');
  const [blockCode, setBlockCode] = useState('');
  const [totalFloors, setTotalFloors] = useState<number>(10);

  const refreshData = () => {
    setTowers(societyService.getTowers(currentSocietyId));
  };

  const handleCreateTower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!towerName || !blockCode) return;

    societyService.createTower(
      {
        societyId: currentSocietyId,
        name: towerName,
        blockCode: blockCode.toUpperCase(),
        totalFloors: Number(totalFloors),
        totalFlats: 0,
      },
      { id: 'sec-admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' }
    );

    refreshData();
    setIsAddModalOpen(false);
    setTowerName('');
    setBlockCode('');
  };

  const columns: Column<Tower>[] = [
    { key: 'blockCode', header: 'Block Code', width: '100px' },
    { key: 'name', header: 'Tower Name', sortable: true },
    { key: 'totalFloors', header: 'Total Floors', sortable: true },
    { key: 'totalFlats', header: 'Total Flats', sortable: true },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Tower & Building Structure</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage society towers, blocks, and floor configurations.
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
          <Plus size={18} /> Add Tower
        </button>
      </header>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Building size={22} color="#2563eb" style={{ marginBottom: '0.4rem' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{towers.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Active Towers</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Layers size={22} color="#10b981" style={{ marginBottom: '0.4rem' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
            {towers.reduce((acc, t) => acc + t.totalFloors, 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Floors Constructed</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Home size={22} color="#8b5cf6" style={{ marginBottom: '0.4rem' }} />
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
            {towers.reduce((acc, t) => acc + t.totalFlats, 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Configured Flats</div>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <DataTable columns={columns} data={towers} keyExtractor={(t) => t.id} />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Tower / Block">
        <Form onSubmit={handleCreateTower}>
          <FormField label="Tower Name" required>
            <input
              type="text"
              required
              value={towerName}
              onChange={(e) => setTowerName(e.target.value)}
              placeholder="e.g. Tower D"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <FormField label="Block Code" required>
            <input
              type="text"
              required
              value={blockCode}
              onChange={(e) => setBlockCode(e.target.value.toUpperCase())}
              placeholder="e.g. D"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <FormField label="Total Floors">
            <input
              type="number"
              min={1}
              max={50}
              value={totalFloors}
              onChange={(e) => setTotalFloors(Number(e.target.value))}
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
              Create Tower
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
