import React, { useState } from 'react';
import { Building2, Shield, Users, Server, Plus } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Form, FormField } from '../../components/ui/Form';

interface SocietyRecord {
  id: string;
  name: string;
  location: string;
  totalFlats: number;
  activeResidents: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

const INITIAL_SOCIETIES: SocietyRecord[] = [
  { id: 'soc-1', name: 'Green Valley Society', location: 'Bandran West, Mumbai', totalFlats: 240, activeResidents: 218, status: 'ACTIVE' },
  { id: 'soc-2', name: 'Royal Palms Residency', location: 'Powai, Mumbai', totalFlats: 500, activeResidents: 480, status: 'ACTIVE' },
  { id: 'soc-3', name: 'Sunset Heights RWA', location: 'Whitefield, Bengaluru', totalFlats: 120, activeResidents: 105, status: 'ACTIVE' },
];

export const SuperAdminDashboard: React.FC = () => {
  const [societies, setSocieties] = useState<SocietyRecord[]>(INITIAL_SOCIETIES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSocietyName, setNewSocietyName] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleAddSociety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocietyName) return;
    const newSoc: SocietyRecord = {
      id: `soc-${Date.now()}`,
      name: newSocietyName,
      location: newLocation || 'Mumbai, MH',
      totalFlats: 100,
      activeResidents: 1,
      status: 'ACTIVE',
    };
    setSocieties([newSoc, ...societies]);
    setIsAddModalOpen(false);
    setNewSocietyName('');
    setNewLocation('');
  };

  const columns: Column<SocietyRecord>[] = [
    { key: 'name', header: 'Society Name', sortable: true },
    { key: 'location', header: 'Location' },
    { key: 'totalFlats', header: 'Flats', sortable: true },
    { key: 'activeResidents', header: 'Active Residents', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (soc) => (
        <StatusBadge
          label={soc.status}
          variant={soc.status === 'ACTIVE' ? 'success' : 'warning'}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Super Admin Portal</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Global Multi-Tenant Management & Platform Health
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Provision New Society
        </button>
      </header>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Building2 size={24} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{societies.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Provisioned Societies</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Users size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>803</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Platform Residents</div>
        </div>
        <div style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Server size={24} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>99.9%</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>System Uptime</div>
        </div>
      </div>

      {/* Societies Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Registered Societies Directory</h3>
        <DataTable columns={columns} data={societies} keyExtractor={(s) => s.id} />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Provision New Society">
        <Form onSubmit={handleAddSociety}>
          <FormField label="Society Name" required>
            <input
              type="text"
              required
              value={newSocietyName}
              onChange={(e) => setNewSocietyName(e.target.value)}
              placeholder="e.g. Skyline Towers RWA"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <FormField label="City / Location" required>
            <input
              type="text"
              required
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. Pune, MH"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}
            >
              Provision Society
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

