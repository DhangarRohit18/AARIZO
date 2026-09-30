// @ts-nocheck
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
  Filter,
  Calendar,
  Building2,
  History,
  UserCheck,
  X,
} from 'lucide-react';
import { assetComplianceService } from '../services/assetComplianceService';
import type { AssetItem, ComplianceMetrics, AssetCategory, ComplianceStatus, AlertWindow } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

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

      {/* Compliance Metrics Cards - Structured Mobile Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {/* Compliance Health Overall Score */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1rem', boxShadow: '0 2px 6px rgba(8, 59, 86, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8B9AA5' }}>
                Compliance Health Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.15rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#083B56', lineHeight: 1 }}>
                  {metrics.complianceScorePercent}%
                </span>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: metrics.complianceScorePercent >= 80 ? '#059669' : metrics.complianceScorePercent >= 50 ? '#D97706' : '#DC2626',
                  background: metrics.complianceScorePercent >= 80 ? '#ECFDF5' : metrics.complianceScorePercent >= 50 ? '#FFFBEB' : '#FEF2F2',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                }}>
                  {metrics.complianceScorePercent >= 80 ? 'Good Health' : metrics.complianceScorePercent >= 50 ? 'Needs Attention' : 'Critical Action'}
                </span>
              </div>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#EAF6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#176B91' }}>
              <ShieldCheck size={24} />
            </div>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: '9999px',
                width: `${metrics.complianceScorePercent}%`,
                background: metrics.complianceScorePercent >= 80 ? '#059669' : metrics.complianceScorePercent >= 50 ? '#D97706' : '#DC2626',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* 2x2 Clean Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
                Active Compliant
              </span>
              <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={14} color="#059669" />
              </div>
            </div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>{metrics.activeCount}</div>
            <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Valid AMC & Insurance</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
                Expiring (30 Days)
              </span>
              <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={14} color="#D97706" />
              </div>
            </div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#D97706', lineHeight: 1.1 }}>{metrics.expiringSoonCount}</div>
            <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Needs renewal review</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
                Expired Contracts
              </span>
              <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={14} color="#DC2626" />
              </div>
            </div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#DC2626', lineHeight: 1.1 }}>{metrics.expiredCount}</div>
            <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Action required now</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
                Non-Compliant
              </span>
              <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={14} color="#7C3AED" />
              </div>
            </div>
            <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#7C3AED', lineHeight: 1.1 }}>{metrics.nonCompliantCount}</div>
            <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Failed inspection</div>
          </div>
        </div>
      </div>

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
                {getAlertBadge(asset.alertLevel, asset.status)}
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
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: new Date(asset.amcExpiryDate) < new Date() ? '#DC2626' : '#083B56' }}>
                    {asset.amcExpiryDate}
                  </span>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #DCE8EF', borderRight: '1px solid #DCE8EF' }}>
                  <span style={{ fontSize: '0.6rem', color: '#8B9AA5', display: 'block', fontWeight: 600 }}>INSURANCE</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: new Date(asset.insuranceExpiryDate) < new Date() ? '#DC2626' : '#083B56' }}>
                    {asset.insuranceExpiryDate}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: '#8B9AA5', display: 'block', fontWeight: 600 }}>CERT EXPIRY</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: new Date(asset.certificateExpiryDate) < new Date() ? '#DC2626' : '#083B56' }}>
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

      {/* Add Asset Modal */}
      {modalMode === 'ADD' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 md:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Register New Asset</h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
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
                  className="px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-md hover:opacity-95"
                  style={{ background: 'var(--aarizo-blue, #176B91)' }}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Record Maintenance Inspection</h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
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
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Renew AMC / Insurance / Certificate</h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
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
                  className="px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-md hover:opacity-95"
                  style={{ background: 'var(--aarizo-blue, #176B91)' }}
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
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 md:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Asset Audit History</h3>
                <p className="text-xs text-slate-500">{activeAssetForModal.name} ({activeAssetForModal.assetCode})</p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
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

