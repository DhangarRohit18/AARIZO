import React from 'react';
import { Leaf, Zap, Droplets, Trash2, Award, TrendingUp } from 'lucide-react';

export const SustainabilityHub: React.FC = () => {
  const metrics = [
    {
      title: 'Solar Generation',
      value: '42.8 kWh',
      subtext: '48% of common area consumption offset',
      icon: <Zap size={22} className="text-amber-400" />,
      color: 'from-amber-500/20 to-amber-900/10',
      border: 'border-amber-500/30',
    },
    {
      title: 'Rainwater Harvesting',
      value: '18,500 L',
      subtext: 'Treated water recycled for landscape',
      icon: <Droplets size={22} className="text-cyan-400" />,
      color: 'from-cyan-500/20 to-cyan-900/10',
      border: 'border-cyan-500/30',
    },
    {
      title: 'Waste Segregation Adherence',
      value: '94.2%',
      subtext: 'Wet & dry garbage sorted at source',
      icon: <Trash2 size={22} className="text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-900/10',
      border: 'border-emerald-500/30',
    },
    {
      title: 'EV Charging Queue',
      value: '6 Active',
      subtext: 'Zero carbon miles tracked this month',
      icon: <TrendingUp size={22} className="text-purple-400" />,
      color: 'from-purple-500/20 to-purple-900/10',
      border: 'border-purple-500/30',
    },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <Leaf size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Society Sustainability Score</h1>
            <p className="text-sm text-emerald-200">
              Community environmental metrics, solar offset, and resource conservation
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/80 border border-emerald-500/40 px-5 py-3 rounded-2xl flex items-center gap-3">
          <Award size={28} className="text-amber-400" />
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Green Rating</div>
            <div className="text-2xl font-black text-emerald-400">92 / 100</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className={`bg-slate-900 border ${m.border} rounded-2xl p-5 text-white shadow-lg space-y-3 bg-gradient-to-br ${m.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">{m.title}</span>
              <div className="p-2 rounded-xl bg-slate-800/80">{m.icon}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
              <div className="text-xs text-slate-400 mt-1">{m.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sustainability Initiatives */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award size={20} className="text-emerald-400" />
          Active Green Initiatives
        </h3>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>🌱 Community Composting Pit - 220kg Organic Soil Generated Monthly</span>
            <span className="text-emerald-400 font-semibold">ACTIVE</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>⚡ Common Area LED Sensor Automation - 32% Electricity Saved</span>
            <span className="text-emerald-400 font-semibold">ACTIVE</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span>🔋 Smart Dual-Port EV Fast Chargers at Gate 2</span>
            <span className="text-emerald-400 font-semibold">AVAILABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
