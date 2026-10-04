import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RefreshCw,
  Search,
  Calendar,
  Building2,
  History,
  UserCheck,
} from 'lucide-react';
import { assetComplianceService } from '../services/assetComplianceService';
import { ComplianceMetricsCards } from './ComplianceMetricsCards';
import { AssetModals } from './AssetModals';
import type { AssetItem, ComplianceMetrics, AssetCategory, ComplianceStatus, AlertWindow, AssetStatus } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';
import { realtimeService } from '../../../services/realtimeService';

interface AssetComplianceHubProps {
  userRoleOverride?: string;
}

export const AssetComplianceHub: React.FC<AssetComplianceHubProps> = ({ userRoleOverride }) => {
  const { currentUser } = useAuth();
  const activeRole = (userRoleOverride || currentUser?.role || '').toLowerCase();

  const isAdmin = ['admin', 'secretary'].includes(activeRole);
  const isFacility = ['facility_manager', 'admin', 'secretary'].includes(activeRole);

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
    const unsubRealtime = realtimeService.subscribe('*', (msg) => {
      if (['COMPLIANCE_UPDATED', 'ASSET_INSPECTED', 'AMC_RENEWED', 'SOCIETY_SYNC'].includes(msg.topic)) {
        loadData();
      }
    });
    return () => {
      unsubscribe();
      unsubRealtime();
    };
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

  const getAlertBadge = (alert: AlertWindow, status: ComplianceStatus | AssetStatus) => {
    if (status === 'EXPIRED' || alert === 'EXPIRED') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full flex items-center gap-1">
          <XCircle size={13} /> EXPIRED
        </span>
      );
    }
    if (status === 'NON_COMPLIANT') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-[#EAF6FC] text-[#083B56] rounded-full flex items-center gap-1">
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
        <span className="px-2.5 py-1 text-xs font-bold bg-[#EAF6FC] text-[#083B56] rounded-full flex items-center gap-1">
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
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.25rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
        }}
        className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span style={{ padding: '6px', background: 'rgba(255,255,255,0.12)', color: 'var(--aarizo-sky, #83CBEA)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <ShieldCheck size={22} />
            </span>
            <h2 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0, letterSpacing: '-0.02em' }}>
              Asset Compliance & AMC Management Engine
            </h2>
          </div>
          <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
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
              style={{
                background: 'var(--aarizo-blue, #176B91)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '0.625rem 1rem',
                fontWeight: 600,
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <PlusCircle size={16} /> Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Compliance Metrics Cards */}
      <ComplianceMetricsCards metrics={metrics} />

      {/* Filters & Search - Neat Card */}
      <div style={{ background: '#ffffff', border: '1px solid #DCE8EF', borderRadius: '14px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8B9AA5' }} />
          <input
            type="text"
            placeholder="Search asset, vendor, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.75rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.5rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, background: '#ffffff', color: '#203746' }}
          >
            <option value="ALL">All Categories</option>
            <option value="LIFT">Elevators</option>
            <option value="GENERATOR">Generator Sets</option>
            <option value="PUMP">Pumps & Water</option>
            <option value="CCTV">CCTV Security</option>
            <option value="FIRE_SYSTEM">Fire Safety</option>
            <option value="SWIMMING_POOL">Swimming Pool</option>
            <option value="GYM_EQUIPMENT">Gym Equipment</option>
            <option value="ELECTRICAL_EQUIPMENT">Electrical Equipment</option>
            <option value="WATER_SYSTEMS">STP / Water Treatment</option>
            <option value="OTHER">Other Assets</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.5rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, background: '#ffffff', color: '#203746' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(isAdmin || isFacility) && (
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
              style={{
                flex: 1,
                padding: '0.5rem',
                background: 'var(--aarizo-blue, #176B91)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              <PlusCircle size={14} /> Add Asset
            </button>
          )}

          <button
            onClick={loadData}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#F4FAFE',
              border: '1px solid #DCE8EF',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#176B91',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Asset Cards - Clean Mobile Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#083B56', margin: 0 }}>
            Asset Compliance Directory
          </h3>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8B9AA5' }}>
            {filteredAssets.length} Assets Found
          </span>
        </div>

        {filteredAssets.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '2rem 1rem', textAlign: 'center', color: '#8B9AA5' }}>
            <Building2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>No assets match your search filters.</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #DCE8EF',
                padding: '0.875rem',
                boxShadow: '0 2px 6px rgba(8, 59, 86, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              {/* Asset Top Row: Code Tag + Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 800, color: '#176B91', background: '#EAF6FC', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #DCE8EF' }}>
                  {asset.assetCode}
                </span>
                {getAlertBadge(asset.alertLevel || 'NONE', asset.status)}
              </div>

              {/* Asset Name */}
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#083B56', margin: 0, lineHeight: 1.3 }}>
                {asset.name}
              </h4>

              {/* Location & Vendor Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.72rem', color: '#657785' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={13} color="#8B9AA5" />
                  <span>{asset.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserCheck size={13} color="#8B9AA5" />
                  <span>Vendor: <strong style={{ color: '#083B56' }}>{asset.vendorName || 'Unassigned'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} color="#8B9AA5" />
                  <span>Next Due: <strong style={{ color: '#D97706' }}>{asset.nextInspectionDueDate}</strong></span>
                </div>
              </div>

              {/* Expiry Dates 3-Column Pill Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', background: '#F7FBFE', border: '1px solid #EBF5FA', borderRadius: '10px', padding: '0.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: '#8B9AA5', display: 'block', fontWeight: 600 }}>AMC EXPIRY</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: new Date(asset.amcExpiryDate || Date.now()) < new Date() ? '#DC2626' : '#083B56' }}>
                    {asset.amcExpiryDate}
                  </span>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #DCE8EF', borderRight: '1px solid #DCE8EF' }}>
                  <span style={{ fontSize: '0.6rem', color: '#8B9AA5', display: 'block', fontWeight: 600 }}>INSURANCE</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: new Date(asset.insuranceExpiryDate || Date.now()) < new Date() ? '#DC2626' : '#083B56' }}>
                    {asset.insuranceExpiryDate}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: '#8B9AA5', display: 'block', fontWeight: 600 }}>CERT EXPIRY</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: new Date(asset.certificateExpiryDate || Date.now()) < new Date() ? '#DC2626' : '#083B56' }}>
                    {asset.certificateExpiryDate}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
                {isFacility && (
                  <button
                    onClick={() => {
                      setActiveAssetForModal(asset);
                      setInspectForm({ result: 'PASSED', notes: '', proofUrl: '' });
                      setModalMode('INSPECT');
                    }}
                    style={{
                      padding: '0.45rem',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '8px',
                      color: '#059669',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={13} /> Inspect
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
                    style={{
                      padding: '0.45rem',
                      background: '#EAF6FC',
                      border: '1px solid #DCE8EF',
                      borderRadius: '8px',
                      color: '#176B91',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={13} /> Renew
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveAssetForModal(asset);
                    setModalMode('AUDIT');
                  }}
                  style={{
                    padding: '0.45rem',
                    background: '#F8FAFC',
                    border: '1px solid #DCE8EF',
                    borderRadius: '8px',
                    color: '#657785',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  <History size={13} /> Logs ({asset.auditLogs.length})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compliance Modals */}
      <AssetModals
        modalMode={modalMode}
        setModalMode={setModalMode}
        activeAssetForModal={activeAssetForModal}
        addForm={addForm}
        setAddForm={setAddForm}
        handleAddSubmit={handleAddSubmit}
        inspectForm={inspectForm}
        setInspectForm={setInspectForm}
        handleInspectSubmit={handleInspectSubmit}
        renewForm={renewForm}
        setRenewForm={setRenewForm}
        handleRenewSubmit={handleRenewSubmit}
      />
    </div>
  );
};

