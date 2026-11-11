import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, ArrowLeft, Search, Layers, Home } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Tower } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

export const TowerManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const currentSocietyId = 'soc-gvs';
  const [towers, setTowers] = useState<Tower[]>(societyService.getTowers(currentSocietyId));
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredTowers = towers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.blockCode.toLowerCase().includes(q);
  });

  const columns: Column<Tower>[] = [
    {
      key: 'blockCode',
      header: 'Block Code',
      width: '120px',
      render: (t) => (
        <span
          style={{
            background: 'var(--aarizo-card-blue, #F4FAFE)',
            color: 'var(--aarizo-navy, #083B56)',
            border: '1px solid var(--aarizo-border, #DCE8EF)',
            padding: '0.2rem 0.6rem',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.75rem',
          }}
        >
          Block {t.blockCode}
        </span>
      ),
    },
    { key: 'name', header: 'Tower Name', sortable: true },
    { key: 'totalFloors', header: 'Total Floors', sortable: true },
    { key: 'totalFlats', header: 'Total Flats', sortable: true },
  ];

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: '2.5rem' }}>
      {/* ── Signature Aarizo Hero Header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.25rem 1.5rem',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 4px 20px rgba(8, 59, 86, 0.15)',
          marginBottom: '1.25rem',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--aarizo-gold, #E5B842)' }}>
                  Society Infrastructure
                </span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.15rem 0 0.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Tower &amp; Building Structure
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                Green Valley Society · Towers, blocks, and floor configurations
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="card-elevate"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '12px',
              background: 'var(--aarizo-coral, #F06543)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8125rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(240, 101, 67, 0.35)',
            }}
          >
            <Plus size={16} /> Add Tower
          </button>
        </div>
      </div>

      {/* ── Search Bar & Filter Strip ── */}
      <div className="max-w-7xl mx-auto w-full" style={{ padding: '1rem 1rem 0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            background: '#ffffff',
            border: '1px solid var(--aarizo-border, #DCE8EF)',
            borderRadius: '12px',
            padding: '0 0.875rem',
            height: '46px',
            boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)',
          }}
        >
          <Search size={18} color="var(--aarizo-text-secondary, #657785)" />
          <input
            type="text"
            placeholder="Search tower name or block code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.8125rem',
              color: 'var(--aarizo-text, #203746)',
              background: 'transparent',
              minHeight: 'auto',
            }}
          />
        </div>
      </div>

      {/* ── Count Heading ── */}
      <div className="max-w-7xl mx-auto w-full" style={{ padding: '0.25rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--aarizo-text-secondary, #657785)' }}>
          {filteredTowers.length} towers &amp; blocks registered
        </span>
      </div>

      {/* ── Main Towers Roster Card / Table ── */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 space-y-4">
        {/* Quick Tower Cards Grid on Desktop/Tablet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTowers.map((t) => (
            <div
              key={t.id}
              className="card-elevate"
              style={{
                background: '#ffffff',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                borderRadius: '16px',
                padding: '1rem',
                boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      background: 'var(--aarizo-card-blue, #F4FAFE)',
                      border: '1px solid var(--aarizo-border, #DCE8EF)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--aarizo-navy, #083B56)',
                      flexShrink: 0,
                    }}
                  >
                    <Building size={22} color="var(--aarizo-coral, #F06543)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
                      {t.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-secondary, #657785)', marginTop: 2 }}>
                      Block: <span style={{ fontWeight: 700, color: 'var(--aarizo-navy, #083B56)' }}>{t.blockCode}</span>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: 'var(--aarizo-navy, #083B56)',
                    background: 'var(--aarizo-card-blue, #F4FAFE)',
                    border: '1px solid var(--aarizo-border, #DCE8EF)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                  }}
                >
                  Block {t.blockCode}
                </span>
              </div>

              {/* Stats Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  paddingTop: '0.625rem',
                  borderTop: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={15} color="var(--aarizo-coral, #F06543)" />
                  <div>
                    <span style={{ color: 'var(--aarizo-text-secondary, #657785)', display: 'block', fontSize: '0.6875rem' }}>Floors</span>
                    <span style={{ fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>{t.totalFloors} Floors</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Home size={15} color="#059669" />
                  <div>
                    <span style={{ color: 'var(--aarizo-text-secondary, #657785)', display: 'block', fontSize: '0.6875rem' }}>Flats</span>
                    <span style={{ fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>{t.totalFlats} Units</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full DataTable Roster Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--aarizo-border, #DCE8EF)',
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: '0 0 0.75rem 0' }}>
            All Registered Towers
          </h3>
          <DataTable
            columns={columns}
            data={filteredTowers}
            keyExtractor={(t) => t.id}
            pageSize={10}
            mobileRender={(t) => (
              <MobileDataCard
                title={t.name}
                subtitle={`Block: ${t.blockCode}`}
                attributes={[
                  { label: 'Floors', value: t.totalFloors },
                  { label: 'Flats', value: t.totalFlats }
                ]}
              />
            )}
          />
        </div>
      </div>

      {/* Modal: Register New Tower */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Tower">
        <Form onSubmit={handleCreateTower}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormField label="Tower Name">
              <input
                type="text"
                value={towerName}
                onChange={(e) => setTowerName(e.target.value)}
                placeholder="e.g. Majestic Heights"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F06543]"
              />
            </FormField>
            <FormField label="Block Code">
              <input
                type="text"
                value={blockCode}
                onChange={(e) => setBlockCode(e.target.value)}
                placeholder="e.g. A, B, T1"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#F06543]"
              />
            </FormField>
          </div>
          <FormField label="Total Floors">
            <input
              type="number"
              value={totalFloors}
              onChange={(e) => setTotalFloors(Number(e.target.value))}
              min="1"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 mb-4 focus:outline-none focus:ring-2 focus:ring-[#F06543]"
            />
          </FormField>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: 'var(--aarizo-coral, #F06543)' }}
              className="px-4 py-2 border-none text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition cursor-pointer"
            >
              Save Tower
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
