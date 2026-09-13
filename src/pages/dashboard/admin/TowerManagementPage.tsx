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
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition shadow-lg shadow-indigo-600/30 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Tower
        </button>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <Building className="w-5 h-5 text-indigo-400 mb-2" />
          <div className="text-2xl font-black text-white">{towers.length}</div>
          <div className="text-xs text-slate-400">Active Towers</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <Layers className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-2xl font-black text-white">
            {towers.reduce((acc, t) => acc + t.totalFloors, 0)}
          </div>
          <div className="text-xs text-slate-400">Total Floors Constructed</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <Home className="w-5 h-5 text-purple-400 mb-2" />
          <div className="text-2xl font-black text-white">
            {towers.reduce((acc, t) => acc + t.totalFlats, 0)}
          </div>
          <div className="text-xs text-slate-400">Configured Flats</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
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
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </FormField>
          <FormField label="Block Code" required>
            <input
              type="text"
              required
              value={blockCode}
              onChange={(e) => setBlockCode(e.target.value.toUpperCase())}
              placeholder="e.g. D"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </FormField>
          <FormField label="Total Floors">
            <input
              type="number"
              min={1}
              max={50}
              value={totalFloors}
              onChange={(e) => setTotalFloors(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </FormField>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl border border-transparent bg-indigo-600 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
            >
              Create Tower
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
