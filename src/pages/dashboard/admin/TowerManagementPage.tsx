import React, { useState } from 'react';
import { Building, Plus } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Tower } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

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
    <div className="p-3 sm:p-6 max-w-6xl mx-auto font-sans text-slate-100">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-400" />
            <h1 className="text-lg sm:text-xl font-bold text-white">Tower & Building Structure</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage society towers, blocks, and floor configurations.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Tower
        </button>
      </header>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={towers}
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

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Tower">
        <Form onSubmit={handleCreateTower}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormField label="Tower Name">
              <input
                type="text"
                value={towerName}
                onChange={(e) => setTowerName(e.target.value)}
                placeholder="e.g. Majestic Heights"
                className="w-full p-2.5 rounded border border-slate-300 text-slate-900"
              />
            </FormField>
            <FormField label="Block Code">
              <input
                type="text"
                value={blockCode}
                onChange={(e) => setBlockCode(e.target.value)}
                placeholder="e.g. A, B, T1"
                className="w-full p-2.5 rounded border border-slate-300 text-slate-900 uppercase"
              />
            </FormField>
          </div>
          <FormField label="Total Floors">
            <input
              type="number"
              value={totalFloors}
              onChange={(e) => setTotalFloors(Number(e.target.value))}
              min="1"
              className="w-full p-2.5 rounded border border-slate-300 text-slate-900 mb-4"
            />
          </FormField>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border-none bg-indigo-600 text-white rounded font-semibold text-sm"
            >
              Save Tower
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
