// @ts-nocheck
import type { AssetItem, ComplianceMetrics, AlertWindow, ComplianceStatus, InspectionRecord, RenewalRecord, ComplianceAuditLog } from '../types';
import { realTimeSync } from '../../../services/realTimeSync';

const STORAGE_KEY_ASSETS = 'aarizo_asset_compliance_v1';

const INITIAL_MOCK_ASSETS: AssetItem[] = [
  {
    id: 'ast-001',
    assetCode: 'AST-LIFT-A1',
    name: 'Tower A - Main Passenger Elevator',
    category: 'LIFT',
    location: 'Tower A Elevator Shaft',
    vendorId: 'vnd-101',
    vendorName: 'Otis Elevator Services',
    vendorContact: '+91 98765 11111',
    amcStartDate: '2025-10-01',
    amcExpiryDate: '2026-10-01',
    insuranceExpiryDate: '2026-11-15',
    certificateExpiryDate: '2026-09-25', // 11 days away -> 15_DAYS alert
    inspectionScheduleFrequencyDays: 30,
    lastInspectionDate: '2026-08-20',
    nextInspectionDueDate: '2026-09-20',
    status: 'EXPIRING_SOON',
    alertLevel: '15_DAYS',
    documentUrls: ['https://example.com/docs/lift-a1-amc.pdf'],
    inspections: [
      {
        id: 'insp-1',
        assetId: 'ast-001',
        inspectionDate: '2026-08-20',
        inspectorName: 'Rajesh Verma',
        inspectorRole: 'FACILITY_MANAGER',
        result: 'PASSED',
        notes: 'Brake alignment checked, cables oiled.',
        createdAt: '2026-08-20T10:30:00Z',
      },
    ],
    renewals: [
      {
        id: 'ren-1',
        assetId: 'ast-001',
        renewalType: 'AMC',
        previousExpiryDate: '2025-10-01',
        newExpiryDate: '2026-10-01',
        vendorName: 'Otis Elevator Services',
        cost: 45000,
        renewedBy: 'Society Admin',
        renewedAt: '2025-09-28T14:00:00Z',
      },
    ],
    auditLogs: [
      {
        id: 'aud-1',
        assetId: 'ast-001',
        action: 'ASSET_CREATED',
        performedBy: 'System Init',
        performedRole: 'SUPER_ADMIN',
        timestamp: '2025-10-01T09:00:00Z',
        details: 'Asset created and registered under Otis AMC contract.',
      },
    ],
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2026-08-20T10:30:00Z',
  },
  {
    id: 'ast-002',
    assetCode: 'AST-GEN-500',
    name: '500 KVA Diesel Generator Set',
    category: 'GENERATOR',
    location: 'Basement 2 Utility Bay',
    vendorId: 'vnd-102',
    vendorName: 'Cummins India Maintenance',
    vendorContact: '+91 98765 22222',
    amcStartDate: '2025-06-01',
    amcExpiryDate: '2026-09-10', // EXPIRED (4 days ago)
    insuranceExpiryDate: '2026-12-31',
    certificateExpiryDate: '2026-09-10',
    inspectionScheduleFrequencyDays: 15,
    lastInspectionDate: '2026-08-25',
    nextInspectionDueDate: '2026-09-09',
    status: 'EXPIRED',
    alertLevel: 'EXPIRED',
    documentUrls: ['https://example.com/docs/gen-500-amc.pdf'],
    inspections: [],
    renewals: [],
    auditLogs: [
      {
        id: 'aud-2',
        assetId: 'ast-002',
        action: 'ASSET_CREATED',
        performedBy: 'Admin',
        performedRole: 'SOCIETY_ADMIN',
        timestamp: '2025-06-01T09:00:00Z',
        details: 'Diesel Generator registered.',
      },
    ],
    createdAt: '2025-06-01T09:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
  },
  {
    id: 'ast-003',
    assetCode: 'AST-FIRE-SYS',
    name: 'Central Fire Hydrant & Sprinkler Pump',
    category: 'FIRE_SYSTEM',
    location: 'Pump Room B1',
    vendorId: 'vnd-103',
    vendorName: 'SafeGuard Fire Solutions',
    vendorContact: '+91 98765 33333',
    amcStartDate: '2026-01-01',
    amcExpiryDate: '2027-01-01',
    insuranceExpiryDate: '2027-01-01',
    certificateExpiryDate: '2026-09-19', // 5 days away -> 7_DAYS alert
    inspectionScheduleFrequencyDays: 30,
    lastInspectionDate: '2026-08-15',
    nextInspectionDueDate: '2026-09-15',
    status: 'EXPIRING_SOON',
    alertLevel: '7_DAYS',
    documentUrls: [],
    inspections: [],
    renewals: [],
    auditLogs: [],
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'ast-004',
    assetCode: 'AST-CCTV-HQ',
    name: 'Perimeter CCTV Camera Network (64 Ch)',
    category: 'CCTV',
    location: 'Main Security Gate & Compound',
    vendorId: 'vnd-104',
    vendorName: 'CP Plus Vision Tech',
    vendorContact: '+91 98765 44444',
    amcStartDate: '2026-03-01',
    amcExpiryDate: '2027-03-01',
    insuranceExpiryDate: '2027-03-01',
    certificateExpiryDate: '2027-03-01',
    inspectionScheduleFrequencyDays: 60,
    lastInspectionDate: '2026-08-01',
    nextInspectionDueDate: '2026-10-01',
    status: 'ACTIVE',
    alertLevel: 'HEALTHY',
    documentUrls: [],
    inspections: [],
    renewals: [],
    auditLogs: [],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
];

class AssetComplianceService {
  private getStoredAssets(): AssetItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_ASSETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(INITIAL_MOCK_ASSETS));
      return INITIAL_MOCK_ASSETS;
    }
    try {
      const assets: AssetItem[] = JSON.parse(raw);
      return assets.map(a => this.recalculateAssetStatus(a));
    } catch {
      return INITIAL_MOCK_ASSETS;
    }
  }

  private saveAssets(assets: AssetItem[]) {
    localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(assets));
    realTimeSync.publish('COMPLIANCE_UPDATED', { timestamp: new Date().toISOString() });
  }

  private recalculateAssetStatus(asset: AssetItem): AssetItem {
    const now = new Date();
    
    // Find the earliest upcoming expiry date among AMC, Insurance, and Certificate
    const expiries = [
      { type: 'AMC', date: new Date(asset.amcExpiryDate) },
      { type: 'INSURANCE', date: new Date(asset.insuranceExpiryDate) },
      { type: 'CERTIFICATE', date: new Date(asset.certificateExpiryDate) },
    ];

    let minDaysLeft = Infinity;
    let isExpired = false;

    expiries.forEach(exp => {
      const diffMs = exp.date.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysLeft < minDaysLeft) {
        minDaysLeft = daysLeft;
      }
      if (daysLeft < 0) {
        isExpired = true;
      }
    });

    let alertLevel: AlertWindow = 'HEALTHY';
    let status: ComplianceStatus = 'ACTIVE';

    if (isExpired || minDaysLeft < 0) {
      alertLevel = 'EXPIRED';
      status = 'EXPIRED';
    } else if (minDaysLeft <= 7) {
      alertLevel = '7_DAYS';
      status = 'EXPIRING_SOON';
    } else if (minDaysLeft <= 15) {
      alertLevel = '15_DAYS';
      status = 'EXPIRING_SOON';
    } else if (minDaysLeft <= 30) {
      alertLevel = '30_DAYS';
      status = 'EXPIRING_SOON';
    } else {
      alertLevel = 'HEALTHY';
      status = 'ACTIVE';
    }

    // If an inspection failed, mark as NON_COMPLIANT
    const lastInspection = asset.inspections[0];
    if (lastInspection && lastInspection.result === 'FAILED' && status !== 'EXPIRED') {
      status = 'NON_COMPLIANT';
    }

    return {
      ...asset,
      status,
      alertLevel,
    };
  }

  public getAssets(): AssetItem[] {
    return this.getStoredAssets();
  }

  public getMetrics(): ComplianceMetrics {
    const assets = this.getStoredAssets();
    const totalAssets = assets.length;
    const activeCount = assets.filter(a => a.status === 'ACTIVE').length;
    const expiringSoonCount = assets.filter(a => a.status === 'EXPIRING_SOON').length;
    const expiredCount = assets.filter(a => a.status === 'EXPIRED').length;
    const nonCompliantCount = assets.filter(a => a.status === 'NON_COMPLIANT').length;

    const complianceScorePercent = totalAssets > 0
      ? Math.round(((activeCount + expiringSoonCount * 0.5) / totalAssets) * 100)
      : 100;

    const expiringNext30Days = assets.filter(a => a.status === 'EXPIRING_SOON');
    const expiredAssets = assets.filter(a => a.status === 'EXPIRED');

    return {
      totalAssets,
      activeCount,
      expiringSoonCount,
      expiredCount,
      nonCompliantCount,
      complianceScorePercent,
      expiringNext30Days,
      expiredAssets,
    };
  }

  public addAsset(
    data: Omit<AssetItem, 'id' | 'status' | 'alertLevel' | 'inspections' | 'renewals' | 'auditLogs' | 'createdAt' | 'updatedAt'>,
    performedBy: string = 'Society Admin',
    performedRole: string = 'SOCIETY_ADMIN'
  ): AssetItem {
    const assets = this.getStoredAssets();
    const newId = `ast-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const initialAudit: ComplianceAuditLog = {
      id: `aud-${Date.now()}`,
      assetId: newId,
      action: 'ASSET_CREATED',
      performedBy,
      performedRole,
      timestamp,
      details: `Asset "${data.name}" (${data.assetCode}) registered into compliance tracking.`,
    };

    const newAsset: AssetItem = {
      ...data,
      id: newId,
      status: 'ACTIVE',
      alertLevel: 'HEALTHY',
      documentUrls: data.documentUrls || [],
      inspections: [],
      renewals: [],
      auditLogs: [initialAudit],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const processed = this.recalculateAssetStatus(newAsset);
    assets.unshift(processed);
    this.saveAssets(assets);
    return processed;
  }

  public recordInspection(
    assetId: string,
    result: 'PASSED' | 'NEEDS_ATTENTION' | 'FAILED',
    notes: string,
    inspectorName: string,
    inspectorRole: 'FACILITY_MANAGER' | 'SOCIETY_ADMIN' | 'VENDOR' | 'AUDITOR',
    proofUrl?: string
  ): AssetItem | null {
    const assets = this.getStoredAssets();
    const index = assets.findIndex(a => a.id === assetId);
    if (index === -1) return null;

    const asset = assets[index];
    const timestamp = new Date().toISOString();
    const todayStr = timestamp.split('T')[0];

    const inspectionRecord: InspectionRecord = {
      id: `insp-${Date.now()}`,
      assetId,
      inspectionDate: todayStr,
      inspectorName,
      inspectorRole,
      result,
      notes,
      proofUrl,
      createdAt: timestamp,
    };

    const auditEntry: ComplianceAuditLog = {
      id: `aud-${Date.now()}`,
      assetId,
      action: 'INSPECTION_RECORDED',
      performedBy: inspectorName,
      performedRole: inspectorRole,
      timestamp,
      details: `Inspection completed with result: ${result}. Notes: ${notes}`,
    };

    // Calculate next inspection due date
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + (asset.inspectionScheduleFrequencyDays || 30));
    const nextDueStr = nextDue.toISOString().split('T')[0];

    const updated: AssetItem = {
      ...asset,
      lastInspectionDate: todayStr,
      nextInspectionDueDate: nextDueStr,
      inspections: [inspectionRecord, ...asset.inspections],
      auditLogs: [auditEntry, ...asset.auditLogs],
      updatedAt: timestamp,
    };

    const processed = this.recalculateAssetStatus(updated);
    assets[index] = processed;
    this.saveAssets(assets);
    return processed;
  }

  public renewAMC(
    assetId: string,
    renewalType: 'AMC' | 'INSURANCE' | 'CERTIFICATE',
    newExpiryDate: string,
    vendorName: string,
    renewedBy: string,
    renewedRole: string,
    cost?: number,
    documentUrl?: string,
    notes?: string
  ): AssetItem | null {
    const assets = this.getStoredAssets();
    const index = assets.findIndex(a => a.id === assetId);
    if (index === -1) return null;

    const asset = assets[index];
    const timestamp = new Date().toISOString();

    let previousExpiryDate = asset.amcExpiryDate;
    if (renewalType === 'INSURANCE') previousExpiryDate = asset.insuranceExpiryDate;
    if (renewalType === 'CERTIFICATE') previousExpiryDate = asset.certificateExpiryDate;

    const renewalRecord: RenewalRecord = {
      id: `ren-${Date.now()}`,
      assetId,
      renewalType,
      previousExpiryDate,
      newExpiryDate,
      vendorName,
      cost,
      documentUrl,
      renewedBy,
      renewedAt: timestamp,
      notes,
    };

    const auditEntry: ComplianceAuditLog = {
      id: `aud-${Date.now()}`,
      assetId,
      action: 'AMC_RENEWED',
      performedBy: renewedBy,
      performedRole: renewedRole,
      timestamp,
      details: `Renewed ${renewalType} contract with ${vendorName}. Extended expiry from ${previousExpiryDate} to ${newExpiryDate}.`,
    };

    const docUrls = [...asset.documentUrls];
    if (documentUrl && !docUrls.includes(documentUrl)) {
      docUrls.push(documentUrl);
    }

    const updated: AssetItem = {
      ...asset,
      amcExpiryDate: renewalType === 'AMC' ? newExpiryDate : asset.amcExpiryDate,
      insuranceExpiryDate: renewalType === 'INSURANCE' ? newExpiryDate : asset.insuranceExpiryDate,
      certificateExpiryDate: renewalType === 'CERTIFICATE' ? newExpiryDate : asset.certificateExpiryDate,
      vendorName: vendorName || asset.vendorName,
      documentUrls: docUrls,
      renewals: [renewalRecord, ...asset.renewals],
      auditLogs: [auditEntry, ...asset.auditLogs],
      updatedAt: timestamp,
    };

    const processed = this.recalculateAssetStatus(updated);
    assets[index] = processed;
    this.saveAssets(assets);
    return processed;
  }
}

export const assetComplianceService = new AssetComplianceService();

