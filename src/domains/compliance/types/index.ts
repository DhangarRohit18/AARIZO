export type AMCStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWED';
export type AMCType = 'AMC' | 'INSURANCE' | 'STAFF_VERIFICATION' | 'VENDOR_AGREEMENT' | 'CERTIFICATE';

export interface AMCContract {
  id: string;
  societyId: string;
  assetId?: string; // Optional: Some compliance docs are society-wide (e.g. Fire Certificate)
  vendorId?: string;
  type: AMCType;
  title: string;
  contractStart: string; // ISO String
  contractEnd: string; // ISO String
  status: AMCStatus;
  documentUrl: string; // Firebase Storage URL
  responsiblePerson: string; // UID of whoever is managing this
  isPublicToResidents: boolean; // Privacy control
  renewalHistory: string[]; // List of older AMC IDs that this one replaces
  remindersSent: {
    thirtyDay: boolean;
    fifteenDay: boolean;
    sevenDay: boolean;
    expired: boolean;
  };
  createdAt: string;
  createdBy: string;
}

export type AssetCategory = 'LIFT' | 'GENERATOR' | 'PUMP' | 'CCTV' | 'FIRE_SYSTEM' | 'POOL' | 'GYM' | 'OTHER';
export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_ORDER';

export interface SocietyAsset {
  id: string;
  societyId: string;
  category: AssetCategory;
  name: string;
  location: string;
  installationDate: string; // ISO String
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}
