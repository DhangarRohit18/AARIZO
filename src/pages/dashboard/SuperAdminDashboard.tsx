import React, { useState } from 'react';
import { Building2, Shield, Users, Server, Plus, Globe, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  { id: 'soc-1', name: 'Green Valley Society', location: 'Bandra West, Mumbai', totalFlats: 240, activeResidents: 218, status: 'ACTIVE' },
  { id: 'soc-2', name: 'Royal Palms Residency', location: 'Powai, Mumbai', totalFlats: 500, activeResidents: 480, status: 'ACTIVE' },
  { id: 'soc-3', name: 'Sunset Heights RWA', location: 'Whitefield, Bengaluru', totalFlats: 120, activeResidents: 105, status: 'ACTIVE' },
];

const statCards = [
  { icon: Building2, label: 'Provisioned Societies', valueKey: 'societies', color: '#176B91', bg: '#EBF5FA' },
  { icon: Users, label: 'Total Platform Residents', value: '803', color: '#059669', bg: '#ECFDF5' },
  { icon: Server, label: 'System Uptime', value: '99.9%', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: TrendingUp, label: 'Monthly Active Users', value: '641', color: '#D97706', bg: '#FFFBEB' },
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
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* ── Aarizo Page Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Globe size={16} color="#83CBEA" />
            <p style={{ color: '#83CBEA', fontSize: '0.75rem', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Administration
            </p>
          </div>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Super Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Global multi-tenant society management &amp; platform health
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1rem',
            background: '#176B91',
            color: '#fff',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Plus size={16} /> New Society
        </button>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const value = card.valueKey === 'societies' ? String(societies.length) : (card.value ?? '');
            return (
              <div key={i} style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #DCE8EF',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(8,59,86,0.06)',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={card.color} />
                </div>
                <div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#083B56', lineHeight: 1.1 }}>{value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#657785', marginTop: '0.125rem', lineHeight: 1.3 }}>{card.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Platform Health Quick Strip ── */}
        <div style={{
          background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF',
          padding: '0.875rem 1rem', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(8,59,86,0.06)',
        }}>
          <Shield size={20} color="#083B56" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: '#083B56', margin: 0, fontSize: '0.875rem' }}>Platform Health: Excellent</p>
            <p style={{ color: '#657785', fontSize: '0.75rem', margin: 0 }}>All systems operational · Last incident: 14 days ago</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ECFDF5', borderRadius: '8px', padding: '0.35rem 0.7rem' }}>
            <CheckCircle2 size={14} color="#059669" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>OPERATIONAL</span>
          </div>
        </div>

        {/* ── Societies Table ── */}
        <div style={{
          background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF',
          padding: '1.25rem', boxShadow: '0 2px 8px rgba(8,59,86,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 800, color: '#083B56', margin: 0, fontSize: '1rem' }}>Registered Societies Directory</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#EBF5FA', borderRadius: '8px', padding: '0.3rem 0.7rem' }}>
              <AlertTriangle size={13} color="#176B91" />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#176B91' }}>0 Pending</span>
            </div>
          </div>
          <DataTable columns={columns} data={societies} keyExtractor={(s) => s.id} />
        </div>
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
              style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1.5px solid #DCE8EF', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </FormField>
          <FormField label="City / Location" required>
            <input
              type="text"
              required
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. Pune, MH"
              style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1.5px solid #DCE8EF', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </FormField>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '1.5px solid #DCE8EF', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#083B56' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', background: '#176B91', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Provision Society
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
