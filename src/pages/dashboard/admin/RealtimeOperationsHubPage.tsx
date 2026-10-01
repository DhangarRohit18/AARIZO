import React, { useState } from 'react';
import {
  Wifi,
  Radio,
  Activity,
  UserCheck,
  QrCode,
  ShieldAlert,
  Car,
  Wrench,
  DollarSign,
  Package,
  HardHat,
  Sparkles,
  Bell,
  Play,
  CheckCircle2,
  ListFilter,
  Send,
} from 'lucide-react';
import { realtimeService } from '../../../services/realtimeService';
import { SocietyOperationsBoard } from '../../../domains/utilities';
import { useRealtimeStream } from '../../../hooks/useRealtime';
import type { RealtimeTopic } from '../../../types/realtime';

export const RealtimeOperationsHubPage: React.FC = () => {
  const [topicFilter, setTopicFilter] = useState<RealtimeTopic | 'ALL'>('ALL');
  const { messages, status } = useRealtimeStream(topicFilter);

  // Simulator State
  const [simTopic, setSimTopic] = useState<RealtimeTopic>('VISITOR_ARRIVAL');
  const [simSenderName, setSimSenderName] = useState<string>('Guard Ramesh Shinde');
  const [simSenderRole, setSimSenderRole] = useState<string>('SECURITY');
  const [simPayloadJson, setSimPayloadJson] = useState<string>(
    '{\n  "visitorName": "Karan Malhotra",\n  "flatCode": "B-402",\n  "passType": "DELIVERY",\n  "vendor": "Amazon"\n}'
  );
  const [lastDispatchedId, setLastDispatchedId] = useState<string | null>(null);

  const handleBroadcastEvent = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(simPayloadJson);
      const msg = realtimeService.publish(
        simTopic,
        parsed,
        'soc-gvs',
        simSenderRole,
        simSenderName
      );
      setLastDispatchedId(msg.id);
    } catch (err: any) {
      alert(`Invalid JSON Payload: ${err.message}`);
    }
  };

  const getTopicIcon = (topic: RealtimeTopic) => {
    switch (topic) {
      case 'VISITOR_ARRIVAL':
      case 'VISITOR_ENTRY':
      case 'VISITOR_EXIT':
        return <UserCheck className="w-4 h-4 text-indigo-500" />;
      case 'VISITOR_APPROVAL':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'QR_SCAN':
        return <QrCode className="w-4 h-4 text-purple-500" />;
      case 'PARKING_OCCUPANCY':
        return <Car className="w-4 h-4 text-teal-500" />;
      case 'EMERGENCY_ALERTS':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'MAINTENANCE_STATUS':
        return <Wrench className="w-4 h-4 text-rose-500" />;
      case 'PAYMENT_STATUS':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'DELIVERY_STATUS':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'WORKER_ENTRY_EXIT':
        return <HardHat className="w-4 h-4 text-cyan-500" />;
      case 'AMENITY_AVAILABILITY':
        return <Sparkles className="w-4 h-4 text-fuchsia-500" />;
      case 'NOTIFICATIONS':
        return <Bell className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTopicBadgeStyle = (topic: RealtimeTopic) => {
    switch (topic) {
      case 'EMERGENCY_ALERTS':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 font-bold animate-pulse';
      case 'VISITOR_ARRIVAL':
      case 'VISITOR_APPROVAL':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
      case 'PAYMENT_STATUS':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'PARKING_OCCUPANCY':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto p-3 sm:p-6">
      {/* Aarizo Gradient Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Realtime Engine
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Real-Time Operations Hub</h1>
            <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
              Zero-polling event streaming, multi-tab BroadcastChannel, &amp; 13 real-time operational topics
            </p>
          </div>

          {/* Connection Health Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">SOCKET ACTIVE</span>
              </div>
              <span className="text-white/40">|</span>
              <span className="text-xs font-mono text-emerald-300">{status.latencyMs}ms latency</span>
            </div>
          </div>
        </div>

        {/* Diagnostics Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>Transport:</span>
            <div className="font-bold text-white font-mono">{status.transportType}</div>
          </div>
          <div>
            <span style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>Active Listeners:</span>
            <div className="font-bold text-emerald-300 font-mono">{status.activeListenersCount} Callbacks</div>
          </div>
          <div>
            <span style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>Total Streamed:</span>
            <div className="font-bold text-sky-200 font-mono">{status.messagesReceivedTotal} Events</div>
          </div>
          <div>
            <span style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>Status:</span>
            <div className="font-bold text-emerald-300 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Subscribed & Ready
            </div>
          </div>
        </div>
      </div>

      {/* Main Stream Feed & Simulator Stack (2-Column on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols on desktop): Live Event Stream Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-900">Topic Filter:</span>
            </div>

            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#176B91]"
            >
              <option value="ALL">All 13 Topics</option>
              <option value="VISITOR_ARRIVAL">VISITOR_ARRIVAL</option>
              <option value="VISITOR_APPROVAL">VISITOR_APPROVAL</option>
              <option value="QR_SCAN">QR_SCAN</option>
              <option value="VISITOR_ENTRY">VISITOR_ENTRY</option>
              <option value="VISITOR_EXIT">VISITOR_EXIT</option>
              <option value="PARKING_OCCUPANCY">PARKING_OCCUPANCY</option>
              <option value="EMERGENCY_ALERTS">EMERGENCY_ALERTS</option>
              <option value="MAINTENANCE_STATUS">MAINTENANCE_STATUS</option>
              <option value="PAYMENT_STATUS">PAYMENT_STATUS</option>
              <option value="DELIVERY_STATUS">DELIVERY_STATUS</option>
              <option value="WORKER_ENTRY_EXIT">WORKER_ENTRY_EXIT</option>
              <option value="AMENITY_AVAILABILITY">AMENITY_AVAILABILITY</option>
              <option value="NOTIFICATIONS">NOTIFICATIONS</option>
            </select>
          </div>

          {/* Live Message Cards Stream */}
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white p-4 rounded-2xl shadow-sm border transition-all duration-300 ${
                  msg.id === lastDispatchedId
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTopicIcon(msg.topic)}
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-mono ${getTopicBadgeStyle(msg.topic)}`}>
                      {msg.topic}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span>
                    Sender: <strong className="text-slate-900">{msg.senderName}</strong> ({msg.senderRole})
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">Society: {msg.societyId}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  <pre>{JSON.stringify(msg.payload, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Cols on desktop): Broadcast Event Simulator */}
        <div className="lg:col-span-5 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 h-fit sticky top-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <Send className="w-4 h-4 text-[#176B91]" /> Dispatch Real-Time Event
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#176B91] border border-sky-100 text-[10px] font-bold">
              Simulator Console
            </span>
          </div>

          <form onSubmit={handleBroadcastEvent} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Operational Topic (13)</label>
              <select
                value={simTopic}
                onChange={(e) => setSimTopic(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#176B91]"
              >
                <option value="VISITOR_ARRIVAL">VISITOR_ARRIVAL</option>
                <option value="VISITOR_APPROVAL">VISITOR_APPROVAL</option>
                <option value="QR_SCAN">QR_SCAN</option>
                <option value="VISITOR_ENTRY">VISITOR_ENTRY</option>
                <option value="VISITOR_EXIT">VISITOR_EXIT</option>
                <option value="PARKING_OCCUPANCY">PARKING_OCCUPANCY</option>
                <option value="EMERGENCY_ALERTS">EMERGENCY_ALERTS</option>
                <option value="MAINTENANCE_STATUS">MAINTENANCE_STATUS</option>
                <option value="PAYMENT_STATUS">PAYMENT_STATUS</option>
                <option value="DELIVERY_STATUS">DELIVERY_STATUS</option>
                <option value="WORKER_ENTRY_EXIT">WORKER_ENTRY_EXIT</option>
                <option value="AMENITY_AVAILABILITY">AMENITY_AVAILABILITY</option>
                <option value="NOTIFICATIONS">NOTIFICATIONS</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sender Name</label>
                <input
                  type="text"
                  value={simSenderName}
                  onChange={(e) => setSimSenderName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sender Role</label>
                <input
                  type="text"
                  value={simSenderRole}
                  onChange={(e) => setSimSenderRole(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Event JSON Payload</label>
              <textarea
                value={simPayloadJson}
                onChange={(e) => setSimPayloadJson(e.target.value)}
                rows={6}
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 bg-slate-950 text-emerald-400 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              style={{ background: 'var(--aarizo-blue, #176B91)' }}
              className="w-full py-2.5 text-white font-bold rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Play className="w-4 h-4" /> Publish Real-Time Event Across Tabs
            </button>
          </form>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <SocietyOperationsBoard />
      </div>
    </div>
  );
};

export default RealtimeOperationsHubPage;

