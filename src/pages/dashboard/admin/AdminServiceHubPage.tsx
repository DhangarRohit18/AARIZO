import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { serviceHubService } from '../../../services/serviceHubService';
import type { VendorPartner, VendorApprovalStatus } from '../../../types/serviceHub';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const AdminServiceHubPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const adminActor = { id: 'admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' };

  const [vendors, setVendors] = useState<VendorPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State for Vendor Approval & Commission Setup
  const [selectedVendor, setSelectedVendor] = useState<VendorPartner | null>(null);
  const [commission, setCommission] = useState<number>(5);
  const [approvalStatus, setApprovalStatus] = useState<VendorApprovalStatus>('APPROVED');

  const reloadData = () => {
    setVendors(serviceHubService.getVendors(currentSocietyId));
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleUpdateVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    serviceHubService.updateVendorStatus(selectedVendor.id, approvalStatus, commission, adminActor);
    setSelectedVendor(null);
    reloadData();
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery);
    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Society Service Hub & Marketplace Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Approve local vendor partners, configure commission percentages across 14 service categories, and manage vendor access.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor business name, contact..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All 14 Categories</option>
          <option value="GROCERY">Grocery</option>
          <option value="MEDICINE">Medicine</option>
          <option value="LAUNDRY">Laundry</option>
          <option value="SALON">Salon</option>
          <option value="HOTEL_RESTAURANT">Hotel / Restaurant</option>
          <option value="TIFFIN">Tiffin</option>
          <option value="HOME_CLEANING">Home Cleaning</option>
          <option value="ELECTRICIAN">Electrician</option>
          <option value="PLUMBER">Plumber</option>
          <option value="AC_SERVICE">AC Service</option>
          <option value="APPLIANCE_REPAIR">Appliance Repair</option>
          <option value="COURIER">Courier</option>
          <option value="CAR_WASH">Car Wash</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                  {v.category}
                </span>
                <StatusBadge
                  variant={
                    v.approvalStatus === 'APPROVED'
                      ? 'success'
                      : v.approvalStatus === 'PENDING_APPROVAL'
                      ? 'warning'
                      : 'danger'
                  }
                  label={v.approvalStatus}
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{v.businessName}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.description}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{v.contactPerson} ({v.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Commission Rate:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{v.commissionPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rating:</span>
                  <span className="font-semibold text-amber-500">★ {v.rating} ({v.ratingCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => {
                  setSelectedVendor(v);
                  setCommission(v.commissionPercentage);
                  setApprovalStatus(v.approvalStatus);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Configure & Approve
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Vendor Approval & Commission Config */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateVendorSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Vendor Governance - {selectedVendor.businessName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Approval Status</label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value as VendorApprovalStatus)}
                >
                  <option value="APPROVED">APPROVED (Active in Marketplace)</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Society Commission Percentage (%)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={50}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
