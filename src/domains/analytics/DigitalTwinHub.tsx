import React, { useState } from 'react';
import { Building2, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export const DigitalTwinHub: React.FC = () => {
  const [selectedTower, setSelectedTower] = useState<'A' | 'B'>('A');

  const flatsData = [
    { number: '101', status: 'OCCUPIED', resident: 'Rohit D.', health: 'GOOD' },
    { number: '102', status: 'OCCUPIED', resident: 'Priya S.', health: 'GOOD' },
    { number: '103', status: 'VACANT', resident: 'None', health: 'NORMAL' },
    { number: '104', status: 'OCCUPIED', resident: 'Amit K.', health: 'MAINTENANCE_PENDING' },
    { number: '201', status: 'OCCUPIED', resident: 'Vikram M.', health: 'GOOD' },
    { number: '202', status: 'OCCUPIED', resident: 'Sneha P.', health: 'GOOD' },
    { number: '203', status: 'OCCUPIED', resident: 'Sunil G.', health: 'GOOD' },
    { number: '204', status: 'VACANT', resident: 'None', health: 'NORMAL' },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-900/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Society Digital Twin & Health Model</h1>
            <p className="text-sm text-indigo-200">
              Live operational telemetry, tower occupancy heatmap, and infrastructure health
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-indigo-500/40 px-5 py-3 rounded-2xl flex items-center gap-3">
          <Activity size={28} className="text-emerald-400" />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Society Health Score</div>
            <div className="text-2xl font-black text-emerald-400">96 / 100</div>
          </div>
        </div>
      </div>

      {/* Infrastructure Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white">
          <div className="text-xs text-slate-400 font-medium">Occupancy Rate</div>
          <div className="text-xl font-bold mt-1 text-emerald-400">87.5%</div>
          <div className="text-xs text-slate-500 mt-0.5">28 of 32 flats occupied</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white">
          <div className="text-xs text-slate-400 font-medium">Elevator Status</div>
          <div className="text-xl font-bold mt-1 text-emerald-400">Online</div>
          <div className="text-xs text-slate-500 mt-0.5">Dual lift bank healthy</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white">
          <div className="text-xs text-slate-400 font-medium">Water Booster Pump</div>
          <div className="text-xl font-bold mt-1 text-emerald-400">3.8 Bar</div>
          <div className="text-xs text-slate-500 mt-0.5">Pressure normal</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white">
          <div className="text-xs text-slate-400 font-medium">DG Set Fuel</div>
          <div className="text-xl font-bold mt-1 text-emerald-400">82%</div>
          <div className="text-xs text-slate-500 mt-0.5">Ready for backup</div>
        </div>
      </div>

      {/* Tower Selector & Interactive Floor Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 size={20} className="text-indigo-400" />
            Tower {selectedTower} Digital Heatmap
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTower('A')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedTower === 'A' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Tower A
            </button>
            <button
              onClick={() => setSelectedTower('B')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                selectedTower === 'B' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Tower B
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {flatsData.map((flat) => (
            <div
              key={flat.number}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                flat.status === 'VACANT'
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : flat.health === 'MAINTENANCE_PENDING'
                  ? 'bg-amber-950/30 border-amber-600/60 text-white'
                  : 'bg-indigo-950/40 border-indigo-700/60 text-white hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Flat {selectedTower}-{flat.number}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    flat.status === 'OCCUPIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {flat.status}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-2 truncate font-medium">
                {flat.resident}
              </div>
              <div className="flex items-center gap-1 text-[11px] mt-1 text-slate-400">
                {flat.health === 'GOOD' ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={12} className="text-amber-400" />
                )}
                <span>{flat.health === 'GOOD' ? 'All Clear' : 'Ticket Pending'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
