import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Building2,
  Car,
  ShieldAlert,
  Wrench,
  Clock,
  DollarSign,
  TrendingUp,
  Store,
  HardHat,
  Package,
  Sparkles,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { societyIntelligenceService } from '../../../services/societyIntelligenceService';
import type { DateRangePreset, IntelligenceAnalytics } from '../../../services/societyIntelligenceService';
import { SocietyHealthScoreCard, PracticalAIHub } from '../../../domains/analytics';

export const SocietyIntelligenceDashboardPage: React.FC = () => {
  const [preset, setPreset] = useState<DateRangePreset>('30_DAYS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const analytics: IntelligenceAnalytics = useMemo(() => {
    return societyIntelligenceService.getAnalytics({
      preset,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [preset, startDate, endDate]);

  const { kpis, charts } = analytics;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportReport = () => {
    const reportData = JSON.stringify(analytics, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Society_Intelligence_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Date Range Filter Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Society Intelligence Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Executive Operations Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time multi-dimensional operational metrics & historical analytics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="mt-6 pt-4 border-t border-indigo-900/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="font-medium">Time Window:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { label: 'Today', value: 'TODAY' },
                { label: '7 Days', value: '7_DAYS' },
                { label: '30 Days', value: '30_DAYS' },
                { label: '3 Months', value: '3_MONTHS' },
                { label: 'Custom', value: 'CUSTOM' },
              ] as { label: string; value: DateRangePreset }[]
            ).map((item) => (
              <button
                key={item.value}
                onClick={() => setPreset(item.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  preset === item.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {preset === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-slate-800/90 p-2 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 text-white border border-slate-700 rounded px-2 py-1 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 text-white border border-slate-700 rounded px-2 py-1 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Society Health Score & AGM Report Card */}
      <SocietyHealthScoreCard />

      {/* Practical AI Layer Suite */}
      <PracticalAIHub />

      {/* 15 ADMIN KPIS GRID */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" /> Real-Time Executive KPIs (15 Metrics)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* KPI 1: Total Residents */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Residents</span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.totalResidents}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Verified Resident Accounts</div>
            </div>
          </div>

          {/* KPI 2: Visitors Today */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Visitors Today</span>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.visitorsToday}</div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">Total Pass Check-ins</div>
            </div>
          </div>

          {/* KPI 3: Visitors Inside */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Visitors Inside</span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{kpis.visitorsInside}</div>
              <div className="text-[11px] text-slate-500 mt-1">Currently On Campus</div>
            </div>
          </div>

          {/* KPI 4: Vehicles Inside */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Vehicles Inside</span>
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.vehiclesInside}</div>
              <div className="text-[11px] text-slate-500 mt-1">Active Parking Passes</div>
            </div>
          </div>

          {/* KPI 5: Parking Occupancy */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Parking Rate</span>
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.parkingOccupancyRate}%</div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, kpis.parkingOccupancyRate)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* KPI 6: Open Complaints */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Open Tickets</span>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{kpis.openComplaints}</div>
              <div className="text-[11px] text-slate-500 mt-1">Pending Maintenance</div>
            </div>
          </div>

          {/* KPI 7: Maintenance SLA */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Maintenance SLA</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.maintenanceSlaCompliance}%</div>
              <div className="text-[11px] text-slate-500 mt-1">On-Time Resolution</div>
            </div>
          </div>

          {/* KPI 8: Pending Approvals */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending Approvals</span>
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">{kpis.pendingApprovals}</div>
              <div className="text-[11px] text-slate-500 mt-1">Action Required</div>
            </div>
          </div>

          {/* KPI 9: Monthly Collection */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Monthly Collection</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(kpis.monthlyCollection)}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Billing Revenues</div>
            </div>
          </div>

          {/* KPI 10: Outstanding Dues */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Outstanding Dues</span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{formatCurrency(kpis.outstandingDues)}</div>
              <div className="text-[11px] text-slate-500 mt-1">Pending Invoices</div>
            </div>
          </div>

          {/* KPI 11: Active Vendors */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Vendors</span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.activeVendors}</div>
              <div className="text-[11px] text-slate-500 mt-1">Marketplace Partners</div>
            </div>
          </div>

          {/* KPI 12: Worker Entries */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Worker Entries</span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                <HardHat className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.workerEntriesToday}</div>
              <div className="text-[11px] text-slate-500 mt-1">Domestic Help Checked-in</div>
            </div>
          </div>

          {/* KPI 13: Deliveries Today */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Deliveries Today</span>
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.deliveriesToday}</div>
              <div className="text-[11px] text-slate-500 mt-1">E-Commerce & Courier</div>
            </div>
          </div>

          {/* KPI 14: Amenity Utilization */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Amenity Usage</span>
              <div className="p-2 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.amenityUtilizationRate}%</div>
              <div className="text-[11px] text-slate-500 mt-1">Slot Capacity Rate</div>
            </div>
          </div>

          {/* KPI 15: Emergency Incidents */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Emergencies</span>
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">{kpis.emergencyIncidents}</div>
              <div className="text-[11px] text-slate-500 mt-1">Platform SOS Logged</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7 CHARTS SECTION */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-600" /> Operational Analytics & Trends (7 Visual Graphs)
        </h2>

        {/* Row 1: Visitor Trends & Payment Collection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Visitor Trends */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-500" /> 1. Visitor Flow & Delivery Trends
                </h3>
                <p className="text-xs text-slate-500">Daily entry volume vs delivery portion</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-semibold">
                Daily Entries
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              {charts.visitorTrends.map((pt, i) => {
                const maxVal = Math.max(...charts.visitorTrends.map((p) => p.value), 1);
                const heightPct = Math.round((pt.value / maxVal) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                      Total: {pt.value} | Deliveries: {pt.secondaryValue}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate w-full text-center">{pt.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Payment Collection */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> 2. Payment Collection & Outstanding Dues
                </h3>
                <p className="text-xs text-slate-500">Monthly breakdown (Collected vs Outstanding)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Collected
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Outstanding
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {charts.paymentCollection.map((pt, i) => {
                const total = (pt.value || 0) + (pt.secondaryValue || 0);
                const collectedPct = total > 0 ? Math.round((pt.value / total) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{pt.label}</span>
                      <span className="text-slate-500">
                        {formatCurrency(pt.value)} / {formatCurrency(total)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${collectedPct}%` }}></div>
                      <div className="bg-amber-500 h-full" style={{ width: `${100 - collectedPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Maintenance Trends & Parking Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Maintenance Trends */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-rose-500" /> 3. Maintenance Ticket Lifecycle
                </h3>
                <p className="text-xs text-slate-500">Current ticket status distribution</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {charts.maintenanceTrends.map((pt, i) => {
                const colors: Record<string, { bg: string; text: string; border: string }> = {
                  OPEN: { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-600', border: 'border-rose-200' },
                  IN_PROGRESS: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600', border: 'border-amber-200' },
                  COMPLETED: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600', border: 'border-emerald-200' },
                  CLOSED: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600', border: 'border-slate-300' },
                };
                const style = colors[pt.category || 'OPEN'] || colors.OPEN;

                return (
                  <div key={i} className={`p-4 rounded-xl border ${style.bg} ${style.border} text-center`}>
                    <div className={`text-2xl font-black ${style.text}`}>{pt.value}</div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">{pt.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 4: Parking Utilization */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-500" /> 4. Parking Space Allocation & Occupancy
                </h3>
                <p className="text-xs text-slate-500">Distribution across resident, visitor, and vacant slots</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {charts.parkingUtilization.map((pt, i) => {
                const colors = ['bg-indigo-600', 'bg-teal-500', 'bg-slate-300 dark:bg-slate-700'];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{pt.label}</span>
                      <span className="text-slate-500">
                        {pt.value} Slots ({pt.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${colors[i % colors.length]} h-full rounded-full`}
                        style={{ width: `${pt.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Amenity Usage & Complaint Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 5: Amenity Usage */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-500" /> 5. Amenity Booking Breakdown
                </h3>
                <p className="text-xs text-slate-500">Total reservations logged per amenity facility</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {charts.amenityUsage.map((pt, i) => {
                const maxVal = Math.max(...charts.amenityUsage.map((p) => p.value), 1);
                const pct = Math.round((pt.value / maxVal) * 100);
                return (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs">
                    <span className="w-32 font-medium text-slate-700 dark:text-slate-300 truncate">{pt.label}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-fuchsia-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right font-semibold text-slate-900 dark:text-white">{pt.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 6: Complaint Categories */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" /> 6. Complaint Categories Breakdown
                </h3>
                <p className="text-xs text-slate-500">Issues reported by operational domain</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {charts.complaintCategories.map((pt, i) => {
                const maxVal = Math.max(...charts.complaintCategories.map((p) => p.value), 1);
                const pct = Math.round((pt.value / maxVal) * 100);
                return (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs">
                    <span className="w-36 font-medium text-slate-700 dark:text-slate-300 truncate">{pt.label}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right font-semibold text-slate-900 dark:text-white">{pt.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 4: Worker Attendance Trends */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HardHat className="w-4 h-4 text-orange-500" /> 7. Domestic Staff & Worker Daily Attendance Flow
              </h3>
              <p className="text-xs text-slate-500">Daily present staff vs absent count</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Present
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block"></span> Absent
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 dark:border-slate-800">
            {charts.workerAttendance.map((pt, i) => {
              const total = (pt.value || 0) + (pt.secondaryValue || 0);
              const presentPct = total > 0 ? Math.round((pt.value / total) * 100) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                    Present: {pt.value} / {total} ({presentPct}%)
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t transition-all duration-300"
                      style={{ height: `${presentPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate w-full text-center">{pt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
