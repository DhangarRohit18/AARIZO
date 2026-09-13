import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Building2,
  History,
  Upload,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { assetComplianceService } from '../services/assetComplianceService';
import { AssetItem, ComplianceMetrics, AssetCategory, ComplianceStatus, AlertWindow } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

interface AssetComplianceHubProps {
  userRoleOverride?: string;
}

export const AssetComplianceHub: React.FC<AssetComplianceHubProps> = ({ userRoleOverride }) => {
  const { currentUser, selectedRole } = useAuth();
  const activeRole = (userRoleOverride || currentUser?.role || selectedRole || '').toUpperCase();

  const isAdmin = ['SOCIETY_ADMIN', 'SUPER_ADMIN', 'SECRETARY'].includes(activeRole);
  const isFacility = ['FACILITY_MANAGER', 'STAFF', 'SOCIETY_ADMIN', 'SUPER_ADMIN'].includes(activeRole);

  const [metrics, setMetrics] = useState<ComplianceMetrics>(() => assetComplianceService.getMetrics());
  const [assets, setAssets] = useState<AssetItem[]>(() => assetComplianceService.getAssets());
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeAssetForModal, setActiveAssetForModal] = useState<AssetItem | null>(null);
  const [modalMode, setModalMode] = useState<'INSPECT' | 'RENEW' | 'AUDIT' | 'ADD' | null>(null);

  // Form States
  const [addForm, setAddForm] = useState({
    name: '',
    assetCode: '',
    category: 'LIFT' as AssetCategory,
    location: '',
    vendorName: '',
    vendorContact: '',
    amcStartDate: new Date().toISOString().split('T')[0],
    amcExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    insuranceExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    certificateExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    inspectionScheduleFrequencyDays: 30,
  });

  const [inspectForm, setInspectForm] = useState({
    result: 'PASSED' as 'PASSED' | 'NEEDS_ATTENTION' | 'FAILED',
    notes: '',
    proofUrl: '',
  });

  const [renewForm, setRenewForm] = useState({
    renewalType: 'AMC' as 'AMC' | 'INSURANCE' | 'CERTIFICATE',
    newExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    vendorName: '',
    cost: 0,
    documentUrl: '',
    notes: '',
  });

  const loadData = () => {
    setMetrics(assetComplianceService.getMetrics());
    setAssets(assetComplianceService.getAssets());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = realTimeSync.subscribe('COMPLIANCE_UPDATED', () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const filteredAssets = assets.filter(asset => {
    if (selectedCategory !== 'ALL' && asset.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && asset.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.assetCode.toLowerCase().includes(q) ||
        asset.location.toLowerCase().includes(q) ||
        (asset.vendorName && asset.vendorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.assetCode) return;

    assetComplianceService.addAsset(
      {
        ...addForm,
        nextInspectionDueDate: addForm.amcStartDate,
        documentUrls: [],
      },
      currentUser?.name || 'Society Admin',
      activeRole
    );

    setModalMode(null);
    loadData();
    alert('Asset added successfully and registered into compliance audit log.');
  };

  const handleInspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssetForModal) return;

    assetComplianceService.recordInspection(
      activeAssetForModal.id,
      inspectForm.result,
      inspectForm.notes,
      currentUser?.name || 'Facility Manager',
      'FACILITY_MANAGER',
      inspectForm.proofUrl
    );

    setModalMode(null);
    loadData();
    alert('Inspection recorded successfully.');
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssetForModal) return;

    assetComplianceService.renewAMC(
      activeAssetForModal.id,
      renewForm.renewalType,
      renewForm.newExpiryDate,
      renewForm.vendorName || activeAssetForModal.vendorName || 'Vendor',
      currentUser?.name || 'Society Admin',
      activeRole,
      renewForm.cost,
      renewForm.documentUrl,
      renewForm.notes
    );

    setModalMode(null);
    loadData();
    alert('AMC / Certificate renewal recorded successfully.');
  };

  const getAlertBadge = (alert: AlertWindow, status: ComplianceStatus) => {
    if (status === 'EXPIRED' || alert === 'EXPIRED') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full flex items-center gap-1">
          <XCircle size={13} /> EXPIRED
        </span>
      );
    }
    if (status === 'NON_COMPLIANT') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
          <AlertTriangle size={13} /> NON-COMPLIANT
        </span>
      );
    }
    if (alert === '7_DAYS') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1 animate-pulse">
          <AlertTriangle size={13} /> EXPIRING (7 Days)
        </span>
      );
    }
    if (alert === '15_DAYS') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
          <Clock size={13} /> EXPIRING (15 Days)
        </span>
      );
    }
    if (alert === '30_DAYS') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-full flex items-center gap-1">
          <Clock size={13} /> EXPIRING (30 Days)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
        <CheckCircle2 size={13} /> ACTIVE
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <ShieldCheck size={24} />
            </span>
            <h2 className="text-xl font-bold">Asset Compliance & AMC Management Engine</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Automated expiration tracking, inspection schedules, insurance alerts & audited renewals.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          {isAdmin && (
            <button
              onClick={() => {
                setAddForm({
                  name: '',
                  assetCode: '',
                  category: 'LIFT',
                  location: '',
                  vendorName: '',
                  vendorContact: '',
                  amcStartDate: new Date().toISOString().split('T')[0],
                  amcExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
                  insuranceExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
                  certificateExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
                  inspectionScheduleFrequencyDays: 30,
                });
                setModalMode('ADD');
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <PlusCircle size={16} /> Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Compliance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Health</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.complianceScorePercent}%</span>
            <span className="text-xs font-medium text-emerald-600">Overall Score</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                metrics.complianceScorePercent >= 80
                  ? 'bg-emerald-500'
                  : metrics.complianceScorePercent >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${metrics.complianceScorePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Compliant</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600">{metrics.activeCount}</span>
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Valid AMC & Insurance</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiring (30 Days)</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-amber-600">{metrics.expiringSoonCount}</span>
            <Clock size={22} className="text-amber-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Requires renewal review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expired Contracts</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-rose-600">{metrics.expiredCount}</span>
            <XCircle size={22} className="text-rose-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Immediate action needed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Non-Compliant</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-purple-600">{metrics.nonCompliantCount}</span>
            <AlertTriangle size={22} className="text-purple-500" />
          </div>
          <p className="text-xs text-slate-400 mt-2">Failed recent inspection</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset, vendor, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="LIFT">Lift / Elevators</option>
              <option value="GENERATOR">Generator Sets</option>
              <option value="PUMP">Pumps & Water</option>
              <option value="CCTV">CCTV Security</option>
              <option value="FIRE_SYSTEM">Fire Safety</option>
              <option value="SWIMMING_POOL">Swimming Pool</option>
              <option value="GYM_EQUIPMENT">Gym Equipment</option>
              <option value="ELECTRICAL_EQUIPMENT">Electrical Equipment</option>
              <option value="WATER_SYSTEMS">Water Treatment / STPs</option>
              <option value="OTHER">Other Assets</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Asset Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Asset Compliance Directory</h3>
          <span className="text-xs text-slate-500 font-medium">Showing {filteredAssets.length} Assets</span>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Building2 size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-slate-600">No assets match your search filters.</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div key={asset.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      {asset.assetCode}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{asset.name}</h4>
                    {getAlertBadge(asset.alertLevel, asset.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 size={13} className="text-slate-400" /> {asset.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck size={13} className="text-slate-400" /> Vendor: <strong className="text-slate-700">{asset.vendorName || 'Unassigned'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" /> Next Inspection Due: <strong className="text-slate-700">{asset.nextInspectionDueDate}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">AMC Expiry</span>
                      <strong className={`font-semibold ${new Date(asset.amcExpiryDate) < new Date() ? 'text-rose-600' : 'text-slate-700'}`}>
                        {asset.amcExpiryDate}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Insurance Expiry</span>
                      <strong className={`font-semibold ${new Date(asset.insuranceExpiryDate) < new Date() ? 'text-rose-600' : 'text-slate-700'}`}>
                        {asset.insuranceExpiryDate}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Cert Expiry</span>
                      <strong className={`font-semibold ${new Date(asset.certificateExpiryDate) < new Date() ? 'text-rose-600' : 'text-slate-700'}`}>
                        {asset.certificateExpiryDate}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap lg:flex-col gap-2 items-end justify-center border-t lg:border-t-0 pt-3 lg:pt-0">
                  {isFacility && (
                    <button
                      onClick={() => {
                        setActiveAssetForModal(asset);
                        setInspectForm({ result: 'PASSED', notes: '', proofUrl: '' });
                        setModalMode('INSPECT');
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={14} /> Record Inspection
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveAssetForModal(asset);
                        setRenewForm({
                          renewalType: 'AMC',
                          newExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
                          vendorName: asset.vendorName || '',
                          cost: 0,
                          documentUrl: '',
                          notes: '',
                        });
                        setModalMode('RENEW');
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={14} /> Renew AMC / Cert
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveAssetForModal(asset);
                      setModalMode('AUDIT');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <History size={14} /> Audit History ({asset.auditLogs.length})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {modalMode === 'ADD' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Register New Asset</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower B Lift 2"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Code</label>
                  <input
                    type="text"
                    required
                    placeholder="AST-LIFT-B2"
                    value={addForm.assetCode}
                    onChange={(e) => setAddForm({ ...addForm, assetCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value as AssetCategory })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="LIFT">Lift</option>
                    <option value="GENERATOR">Generator</option>
                    <option value="PUMP">Pump</option>
                    <option value="CCTV">CCTV</option>
                    <option value="FIRE_SYSTEM">Fire System</option>
                    <option value="SWIMMING_POOL">Swimming Pool</option>
                    <option value="GYM_EQUIPMENT">Gym Equipment</option>
                    <option value="ELECTRICAL_EQUIPMENT">Electrical Equipment</option>
                    <option value="WATER_SYSTEMS">Water Systems</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clubhouse Floor 1"
                  value={addForm.location}
                  onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Otis Elevator"
                    value={addForm.vendorName}
                    onChange={(e) => setAddForm({ ...addForm, vendorName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Contact</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={addForm.vendorContact}
                    onChange={(e) => setAddForm({ ...addForm, vendorContact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">AMC Expiry</label>
                  <input
                    type="date"
                    required
                    value={addForm.amcExpiryDate}
                    onChange={(e) => setAddForm({ ...addForm, amcExpiryDate: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Insurance Expiry</label>
                  <input
                    type="date"
                    required
                    value={addForm.insuranceExpiryDate}
                    onChange={(e) => setAddForm({ ...addForm, insuranceExpiryDate: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cert Expiry</label>
                  <input
                    type="date"
                    required
                    value={addForm.certificateExpiryDate}
                    onChange={(e) => setAddForm({ ...addForm, certificateExpiryDate: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Inspection Modal */}
      {modalMode === 'INSPECT' && activeAssetForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Record Maintenance Inspection</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Recording inspection for <strong className="text-slate-800">{activeAssetForModal.name}</strong> ({activeAssetForModal.assetCode})
            </p>

            <form onSubmit={handleInspectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Outcome</label>
                <select
                  value={inspectForm.result}
                  onChange={(e) => setInspectForm({ ...inspectForm, result: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-medium"
                >
                  <option value="PASSED">PASSED (All systems healthy)</option>
                  <option value="NEEDS_ATTENTION">NEEDS ATTENTION (Minor observations)</option>
                  <option value="FAILED">FAILED (Non-compliant / Repair needed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record servicing details, replaced parts, pressure levels..."
                  value={inspectForm.notes}
                  onChange={(e) => setInspectForm({ ...inspectForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Proof / Document URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/proofs/insp-proof.pdf"
                  value={inspectForm.proofUrl}
                  onChange={(e) => setInspectForm({ ...inspectForm, proofUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-emerald-500"
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew AMC Modal */}
      {modalMode === 'RENEW' && activeAssetForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Renew AMC / Insurance / Certificate</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Target</label>
                <select
                  value={renewForm.renewalType}
                  onChange={(e) => setRenewForm({ ...renewForm, renewalType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="AMC">AMC Contract</option>
                  <option value="INSURANCE">Asset Insurance Policy</option>
                  <option value="CERTIFICATE">Government Safety Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Expiry Date</label>
                <input
                  type="date"
                  required
                  value={renewForm.newExpiryDate}
                  onChange={(e) => setRenewForm({ ...renewForm, newExpiryDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contractor / Vendor Name</label>
                <input
                  type="text"
                  placeholder="Vendor Name"
                  value={renewForm.vendorName}
                  onChange={(e) => setRenewForm({ ...renewForm, vendorName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={renewForm.cost}
                    onChange={(e) => setRenewForm({ ...renewForm, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Link</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={renewForm.documentUrl}
                    onChange={(e) => setRenewForm({ ...renewForm, documentUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
                >
                  Save & Renew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {modalMode === 'AUDIT' && activeAssetForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Asset Audit History</h3>
                <p className="text-xs text-slate-500">{activeAssetForModal.name} ({activeAssetForModal.assetCode})</p>
              </div>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Immutable Change Logs</h4>
              <div className="space-y-2">
                {activeAssetForModal.auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <strong className="text-indigo-600 font-semibold">{log.action}</strong>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800">{log.details}</p>
                    <div className="text-[11px] text-slate-400">Performed by: {log.performedBy} ({log.performedRole})</div>
                  </div>
                ))}
              </div>

              {activeAssetForModal.inspections.length > 0 && (
                <>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">Recent Inspections</h4>
                  <div className="space-y-2">
                    {activeAssetForModal.inspections.map((insp) => (
                      <div key={insp.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className={insp.result === 'PASSED' ? 'text-emerald-700' : 'text-rose-700'}>
                            Result: {insp.result}
                          </span>
                          <span className="text-slate-400">{insp.inspectionDate}</span>
                        </div>
                        <p className="text-slate-700">{insp.notes}</p>
                        <div className="text-[11px] text-slate-400">Inspector: {insp.inspectorName}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
