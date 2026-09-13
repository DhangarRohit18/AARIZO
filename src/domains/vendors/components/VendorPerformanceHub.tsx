import React, { useState, useEffect } from 'react';
import {
  Star,
  AlertCircle,
  CheckCircle,
  Ban,
  Columns,
  Eye,
  EyeOff,
  Award,
  BarChart,
  Search,
  Filter,
} from 'lucide-react';
import { vendorPerformanceEngine } from '../services/vendorPerformanceEngine';
import type { VendorScorecard, VendorStatus } from '../types';

export const VendorPerformanceHub: React.FC = () => {
  const [vendors, setVendors] = useState<VendorScorecard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Side-by-Side Comparison State
  const [comparisonVendorIds, setComparisonVendorIds] = useState<string[]>([]);
  const [isCompareView, setIsCompareView] = useState(false);

  // Detailed Modal State
  const [activeVendor, setActiveVendor] = useState<VendorScorecard | null>(null);

  const refreshData = () => {
    const list = vendorPerformanceEngine.getVendorScorecards(selectedCategory);
    setVendors(list);
  };

  useEffect(() => {
    refreshData();
  }, [selectedCategory]);

  const handleStatusChange = (vendorId: string, status: VendorStatus) => {
    vendorPerformanceEngine.updateVendorStatus(vendorId, status);
    refreshData();
    if (activeVendor && activeVendor.vendorId === vendorId) {
      setActiveVendor(vendorPerformanceEngine.getVendorById(vendorId) || null);
    }
  };

  const handleTogglePublicVisibility = (vendorId: string, current: boolean) => {
    vendorPerformanceEngine.togglePublicRanking(vendorId, !current);
    refreshData();
    if (activeVendor && activeVendor.vendorId === vendorId) {
      setActiveVendor(vendorPerformanceEngine.getVendorById(vendorId) || null);
    }
  };

  const toggleSelectForComparison = (id: string) => {
    if (comparisonVendorIds.includes(id)) {
      setComparisonVendorIds(comparisonVendorIds.filter((vId) => vId !== id));
    } else {
      if (comparisonVendorIds.length >= 3) {
        alert('You can compare at most 3 vendors side-by-side.');
        return;
      }
      setComparisonVendorIds([...comparisonVendorIds, id]);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const comparedVendors = vendorPerformanceEngine.compareVendors(comparisonVendorIds);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      amt
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Vendor Performance & Scorecard Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Phase 15 Engine
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Data-driven metrics evaluated strictly from historical service records: response times, SLA compliance, ratings, repeat complaints, and price competitiveness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparisonVendorIds.length > 0 && (
            <button
              onClick={() => setIsCompareView(!isCompareView)}
              className={`px-4 py-2 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition ${
                isCompareView
                  ? 'bg-slate-900 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Columns size={16} />
              {isCompareView ? 'Exit Comparison' : `Compare Selected (${comparisonVendorIds.length})`}
            </button>
          )}
        </div>
      </div>

      {/* SIDE-BY-SIDE COMPARISON VIEW */}
      {isCompareView && comparedVendors.length > 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Side-by-Side Vendor Matrix</h2>
              <p className="text-xs text-slate-500">
                Comparing {comparedVendors.length} vendors based on real historical service analytics.
              </p>
            </div>
            <button
              onClick={() => setIsCompareView(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Close Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparedVendors.map((vendor) => (
              <div
                key={vendor.vendorId}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 relative"
              >
                {vendor.status === 'PREFERRED' && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full flex items-center gap-1">
                    <Award size={12} /> PREFERRED VENDOR
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-base text-slate-900">{vendor.vendorName}</h3>
                  <span className="text-xs text-slate-500 font-medium">{vendor.category}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contract Rate / Price:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(vendor.metrics.hourlyRateOrPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Overall Rating:</span>
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {vendor.metrics.rating} / 5.0
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SLA Compliance:</span>
                    <span className="font-bold text-emerald-600">{vendor.metrics.slaCompliancePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Response Time:</span>
                    <span className="font-bold text-slate-800">{vendor.metrics.averageResponseTimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Repeat Complaints:</span>
                    <span
                      className={`font-bold ${
                        vendor.metrics.repeatComplaintsCount > 2 ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {vendor.metrics.repeatComplaintsCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed Jobs:</span>
                    <span className="font-bold text-slate-900">{vendor.metrics.completedJobsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Satisfaction:</span>
                    <span className="font-bold text-indigo-600">{vendor.metrics.customerSatisfactionPercentage}%</span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleStatusChange(vendor.vendorId, 'PREFERRED')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                      vendor.status === 'PREFERRED'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    Preferred
                  </button>
                  <button
                    onClick={() => handleStatusChange(vendor.vendorId, 'APPROVED')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                      vendor.status === 'APPROVED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(vendor.vendorId, 'SUSPENDED')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                      vendor.status === 'SUSPENDED'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-rose-100'
                    }`}
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => handleStatusChange(vendor.vendorId, 'BLACKLISTED')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                      vendor.status === 'BLACKLISTED'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-400'
                    }`}
                  >
                    Blacklist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VENDOR GRID LIST VIEW */
        <div className="space-y-4">
          {/* Controls & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vendor name, category, representative..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="Elevator">Elevator & Lift</option>
                <option value="Security">Security Services</option>
                <option value="Plumbing">Plumbing & Hydraulic</option>
              </select>
            </div>
          </div>

          {/* Vendors Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredVendors.map((vendor) => {
              const isSelected = comparisonVendorIds.includes(vendor.vendorId);
              return (
                <div
                  key={vendor.vendorId}
                  className={`bg-white p-5 rounded-2xl border shadow-sm transition space-y-4 relative ${
                    isSelected ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{vendor.vendorName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{vendor.category}</p>
                    </div>

                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectForComparison(vendor.vendorId)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] font-semibold text-slate-500">Compare</span>
                    </label>
                  </div>

                  {/* Rating & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-800">{vendor.metrics.rating}</span>
                      <span className="text-[10px] text-amber-600">({vendor.metrics.completedJobsCount} jobs)</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        vendor.status === 'PREFERRED'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : vendor.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : vendor.status === 'SUSPENDED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-900 text-white border-slate-900'
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">SLA Compliance</span>
                      <span className="font-extrabold text-emerald-700">{vendor.metrics.slaCompliancePercentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Response</span>
                      <span className="font-extrabold text-slate-800">{vendor.metrics.averageResponseTimeMinutes} mins</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Repeat Complaints</span>
                      <span
                        className={`font-extrabold ${
                          vendor.metrics.repeatComplaintsCount > 2 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {vendor.metrics.repeatComplaintsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Satisfaction</span>
                      <span className="font-extrabold text-indigo-700">{vendor.metrics.customerSatisfactionPercentage}%</span>
                    </div>
                  </div>

                  {/* Public Visibility Guard */}
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      {vendor.isPubliclyRanked ? (
                        <Eye size={12} className="text-emerald-600" />
                      ) : (
                        <EyeOff size={12} className="text-slate-400" />
                      )}
                      Public Rank: {vendor.isPubliclyRanked ? 'Visible' : 'Hidden'}
                    </span>

                    <button
                      onClick={() =>
                        handleTogglePublicVisibility(vendor.vendorId, vendor.isPubliclyRanked)
                      }
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      Toggle Visibility
                    </button>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setActiveVendor(vendor)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <BarChart size={14} /> Full Scorecard
                    </button>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusChange(vendor.vendorId, 'PREFERRED')}
                        title="Mark as Preferred Vendor"
                        className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs"
                      >
                        <Award size={14} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(vendor.vendorId, 'APPROVED')}
                        title="Approve Vendor"
                        className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs"
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(vendor.vendorId, 'SUSPENDED')}
                        title="Suspend Vendor"
                        className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs"
                      >
                        <AlertCircle size={14} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(vendor.vendorId, 'BLACKLISTED')}
                        title="Blacklist Vendor"
                        className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs"
                      >
                        <Ban size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED SCORECARD MODAL */}
      {activeVendor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{activeVendor.vendorName}</h2>
                <p className="text-xs text-slate-500">{activeVendor.category} • Rep: {activeVendor.contactPerson} ({activeVendor.phone})</p>
              </div>
              <button
                onClick={() => setActiveVendor(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">SLA COMPLIANCE</span>
                <span className="text-base font-bold text-emerald-600">{activeVendor.metrics.slaCompliancePercentage}%</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">AVG RESPONSE</span>
                <span className="text-base font-bold text-slate-900">{activeVendor.metrics.averageResponseTimeMinutes} mins</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">REPEAT COMPLAINTS</span>
                <span className="text-base font-bold text-rose-600">{activeVendor.metrics.repeatComplaintsCount}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">COMPLETED JOBS</span>
                <span className="text-base font-bold text-indigo-600">{activeVendor.metrics.completedJobsCount}</span>
              </div>
            </div>

            {/* Historical Quarterly Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Historical Performance Log</h3>
              <div className="space-y-1.5">
                {activeVendor.metrics.historicalDataPoints.map((h) => (
                  <div key={h.period} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg text-xs">
                    <span className="font-bold text-slate-800">{h.period}</span>
                    <span className="text-slate-600">{h.jobsCompleted} jobs completed</span>
                    <span className="font-semibold text-emerald-700">{h.slaMetCount}/{h.totalSlaCount} SLA Met</span>
                    <span className="font-bold text-amber-600">{h.avgRating} ★</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Work Order History */}
            {activeVendor.recentJobHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Job Inspections</h3>
                <div className="space-y-2">
                  {activeVendor.recentJobHistory.map((j) => (
                    <div key={j.jobId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex justify-between items-center font-bold text-slate-900">
                        <span>{j.title}</span>
                        <span className="text-amber-600">{j.rating} ★</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                        <span>Date: {j.date}</span>
                        <span>Response: {j.responseTimeMinutes} mins</span>
                        <span className={j.slaMet ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {j.slaMet ? 'SLA Met' : 'SLA Breached'}
                        </span>
                      </div>
                      {j.residentFeedback && (
                        <p className="text-[11px] text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-100">
                          "{j.residentFeedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
