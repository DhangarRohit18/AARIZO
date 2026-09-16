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
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-2xl p-4 md:p-6 text-white shadow-xl border border-indigo-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Realtime Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Real-Time Operations Hub</h1>
            <p className="text-slate-400 text-sm mt-1">
              Zero-polling event streaming, multi-tab BroadcastChannel, & 13 real-time operational topics
            </p>
          </div>

          {/* Connection Health Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700/60 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">SOCKET ACTIVE</span>
              </div>
              <span className="text-slate-500">|</span>
              <span className="text-xs font-mono text-emerald-300">{status.latencyMs}ms latency</span>
            </div>
          </div>
        </div>

        {/* Diagnostics Bar */}
        <div className="mt-6 pt-4 border-t border-indigo-900/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Transport:</span>
            <div className="font-bold text-white font-mono">{status.transportType}</div>
          </div>
          <div>
            <span className="text-slate-400">Active Listeners:</span>
            <div className="font-bold text-emerald-400 font-mono">{status.activeListenersCount} Callbacks</div>
          </div>
          <div>
            <span className="text-slate-400">Total Streamed:</span>
            <div className="font-bold text-indigo-300 font-mono">{status.messagesReceivedTotal} Events</div>
          </div>
          <div>
            <span className="text-slate-400">Status:</span>
            <div className="font-bold text-emerald-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Subscribed & Ready
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Stream Feed vs Broadcast Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Event Stream Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Topic Filter:</span>
            </div>

            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold"
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
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border transition-all duration-300 ${
                  msg.id === lastDispatchedId
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800'
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

                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>
                    Sender: <strong className="text-slate-800 dark:text-slate-200">{msg.senderName}</strong> ({msg.senderRole})
                  </span>
                  <span className="font-mono text-[10px]">Society: {msg.societyId}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  <pre>{JSON.stringify(msg.payload, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Broadcast Event Simulator */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-500" /> Dispatch Real-Time Event
            </h3>
            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-bold">
              Simulator Console
            </span>
          </div>

          <form onSubmit={handleBroadcastEvent} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Target Operational Topic (13)</label>
              <select
                value={simTopic}
                onChange={(e) => setSimTopic(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Sender Name</label>
                <input
                  type="text"
                  value={simSenderName}
                  onChange={(e) => setSimSenderName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Sender Role</label>
                <input
                  type="text"
                  value={simSenderRole}
                  onChange={(e) => setSimSenderRole(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Event JSON Payload</label>
              <textarea
                value={simPayloadJson}
                onChange={(e) => setSimPayloadJson(e.target.value)}
                rows={6}
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-emerald-400 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Publish Real-Time Event Across Tabs
            </button>
          </form>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <SocietyOperationsBoard />
      </div>
    </div>
  );
};
