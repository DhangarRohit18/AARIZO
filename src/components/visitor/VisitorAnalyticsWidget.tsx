import React from 'react';
import { BarChart3, Clock, Users, Truck, TrendingUp, RefreshCw } from 'lucide-react';
import type { VisitorAnalyticsData } from '../../types/visitor';

interface VisitorAnalyticsWidgetProps {
  analytics: VisitorAnalyticsData;
}

export const VisitorAnalyticsWidget: React.FC<VisitorAnalyticsWidgetProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Top Metrics Row - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] dark:bg-slate-800 flex items-center justify-center text-[#176B91] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Avg Duration</span>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {analytics.averageStayDurationMinutes}m
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Deliveries</span>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {analytics.deliveryVolumeByVendor.reduce((acc, curr) => acc + curr.count, 0)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Repeat Guests</span>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {analytics.repeatVisitors.length}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF6FC] dark:bg-[#062A3D] flex items-center justify-center text-[#176B91] dark:text-[#3DA4CC] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Peak Hour</span>
            <div className="text-xs font-bold text-[#176B91] dark:text-[#3DA4CC] mt-0.5">
              6PM - 8PM
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Lists Stack */}
      <div className="space-y-5">
        {/* Peak Visiting Hours Chart */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#176B91]" />
              Peak Visiting Hours (Hourly)
            </h3>
          </div>

          <div className="h-40 flex items-end justify-between gap-1.5 pt-6 pb-2 px-1 border-b border-slate-200 dark:border-slate-700">
            {analytics.peakVisitingHours.map((h, idx) => {
              const maxCount = Math.max(...analytics.peakVisitingHours.map((x) => x.count), 1);
              const heightPercent = Math.round((h.count / maxCount) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="text-[9px] font-bold text-[#083B56] dark:text-[#83CBEA] opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.count}
                  </div>
                  <div
                    style={{ height: `${Math.max(15, heightPercent)}%` }}
                    className="w-full bg-[#176B91] hover:bg-[#083B56] rounded-t transition-all"
                  />
                  <span className="text-[9px] text-slate-400 font-mono">{h.hourLabel.replace(' ', '')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Volume Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Delivery Volume by Vendor Partner
          </h3>

          <div className="space-y-2.5">
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
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#176B91]" />
            Top Repeat Visitors
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {analytics.repeatVisitors.map((r, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{r.visitorName}</div>
                  <div className="text-slate-500 text-[11px]">{r.phone}</div>
                </div>
                <span className="px-2.5 py-1 bg-[#EAF6FC] dark:bg-slate-800 text-[#083B56] dark:text-[#83CBEA] font-bold rounded-full text-xs border border-[#DCE8EF] dark:border-slate-700">
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
