import React from 'react';
import { BarChart3, Clock, Users, Truck, TrendingUp, RefreshCw } from 'lucide-react';
import type { VisitorAnalyticsData } from '../../types/visitor';

interface VisitorAnalyticsWidgetProps {
  analytics: VisitorAnalyticsData;
}

export const VisitorAnalyticsWidget: React.FC<VisitorAnalyticsWidgetProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Avg Visit Duration</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {analytics.averageStayDurationMinutes} Mins
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Daily Delivery Volume</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {analytics.deliveryVolumeByVendor.reduce((acc, curr) => acc + curr.count, 0)} Deliveries
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Top Repeat Visitors</span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {analytics.repeatVisitors.length} Registered
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Peak Hour Traffic</span>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              06:00 PM - 08:00 PM
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peak Visiting Hours Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Peak Visiting Hours Distribution (Hourly)
            </h3>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-700">
            {analytics.peakVisitingHours.map((h, idx) => {
              const maxCount = Math.max(...analytics.peakVisitingHours.map((x) => x.count), 1);
              const heightPercent = Math.round((h.count / maxCount) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.count}
                  </div>
                  <div
                    style={{ height: `${Math.max(15, heightPercent)}%` }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t transition-all"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{h.hourLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Volume Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Delivery Volume by Vendor Partner
          </h3>

          <div className="space-y-3">
            {analytics.deliveryVolumeByVendor.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{d.vendorName}</span>
                  <span>{d.count} deliveries</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (d.count / 30) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repeat Visitors Leaderboard */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Top Repeat Visitors & Frequently Verified Guests
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.repeatVisitors.map((r, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{r.visitorName}</div>
                  <div className="text-slate-500">{r.phone}</div>
                </div>
                <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-full text-xs">
                  {r.visitsCount} visits
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
