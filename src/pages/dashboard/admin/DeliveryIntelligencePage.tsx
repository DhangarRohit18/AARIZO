import React, { useState, useEffect } from 'react';
import { Truck, Search, Package } from 'lucide-react';
import { visitorService } from '../../../services/visitorService';
import type { SmartVisitorPass, VisitorAnalyticsData } from '../../../types/visitor';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { VisitorAnalyticsWidget } from '../../../components/visitor/VisitorAnalyticsWidget';
import { ParcelRoomSecurityHub } from '../../../domains/deliveries/components/ParcelRoomSecurityHub';

export const DeliveryIntelligencePage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const officerActor = { id: 'sec-guard-1', name: 'Officer Vikram Singh', role: 'SECURITY' };

  const [passes, setPasses] = useState<SmartVisitorPass[]>([]);
  const [analytics, setAnalytics] = useState<VisitorAnalyticsData>({
    peakVisitingHours: [],
    repeatVisitors: [],
    averageStayDurationMinutes: 0,
    deliveryVolumeByVendor: [],
    dailyVisitorTrend: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'PARCEL_ROOM' | 'DELIVERIES' | 'ANALYTICS'>('PARCEL_ROOM');


  const reloadData = () => {
    const list = visitorService.getPasses(currentSocietyId);
    setPasses(list);
    setAnalytics(visitorService.getVisitorAnalytics(currentSocietyId));
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleRecordPickup = (passId: string) => {
    visitorService.recordDeliveryPickup(passId, officerActor);
    reloadData();
  };

  const deliveryPasses = passes.filter((p) => p.category === 'DELIVERY');
  const filteredDeliveries = deliveryPasses.filter(
    (p) =>
      p.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.flatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.deliveryVendor && p.deliveryVendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.packageReferenceNumber && p.packageReferenceNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Visitor Follow-Up & Delivery Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track courier delivery packages, monitor overstayed guests, inspect peak visiting hours, and record package pickups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('PARCEL_ROOM')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'PARCEL_ROOM'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Package size={14} /> Parcel Room Hub
          </button>
          <button
            onClick={() => setActiveTab('DELIVERIES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'DELIVERIES'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Delivery Entry Log ({deliveryPasses.length})
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'ANALYTICS'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Visitor Analytics & Peak Hours
          </button>
        </div>
      </div>

      {/* Tab 0: Parcel Room Hub */}
      {activeTab === 'PARCEL_ROOM' && <ParcelRoomSecurityHub />}


      {/* Tab 1: Delivery Log */}
      {activeTab === 'DELIVERIES' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor, package ref, flat code..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
<table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Package Ref No</th>
                  <th className="p-3">Flat & Resident</th>
                  <th className="p-3">Agent Name</th>
                  <th className="p-3">Entry Time</th>
                  <th className="p-3">Pickup Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Pickup Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                {filteredDeliveries.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                      {p.deliveryVendor || p.companyName || 'Courier'}
                    </td>
                    <td className="p-3 font-mono text-[11px]">{p.packageReferenceNumber || 'N/A'}</td>
                    <td className="p-3 font-medium">Flat {p.flatCode} ({p.residentName})</td>
                    <td className="p-3">{p.visitorName} ({p.visitorPhone})</td>
                    <td className="p-3 text-slate-500">{p.checkedInAt || 'Pending'}</td>
                    <td className="p-3 text-slate-500">{p.pickupTimestamp || 'Awaiting Pickup'}</td>
                    <td className="p-3">
                      <StatusBadge
                        variant={p.status === 'CHECKED_OUT' ? 'success' : p.isOverdue ? 'danger' : 'info'}
                        label={p.status === 'CHECKED_OUT' ? 'PICKED UP' : p.status}
                      />
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleRecordPickup(p.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs transition-colors"
                        >
                          Record Pickup
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-4 md:p-6 text-center text-slate-500">
                      No delivery package records match current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Visitor Analytics */}
      {activeTab === 'ANALYTICS' && <VisitorAnalyticsWidget analytics={analytics} />}
    </div>
  );
};
