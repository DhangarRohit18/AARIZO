export type SocietyStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type SubscriptionTier = 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface Society {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: SocietyStatus;
  subscriptionTier: SubscriptionTier;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  totalTowers: number;
  totalFlats: number;
  createdAt: string;
}

export interface Tower {
  id: string;
  societyId: string;
  name: string;
  blockCode: string;
  totalFloors: number;
  totalFlats: number;
}

export interface Floor {
  id: string;
  societyId: string;
  towerId: string;
  floorNumber: number;
  flatCount: number;
}

export type BHKType = '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'PENTHOUSE';
export type OccupancyStatus = 'OWNER_OCCUPIED' | 'TENANT_OCCUPIED' | 'VACANT';

export interface Flat {
  id: string;
  societyId: string;
  towerId: string;
  towerName: string;
  floorNumber: number;
  flatNumber: string;
  bhkType: BHKType;
  occupancyStatus: OccupancyStatus;
  primaryResidentId?: string;
  primaryResidentName?: string;
  phone?: string;
}

export type ResidentRole = 'OWNER' | 'TENANT';
export type ResidentApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Resident {
  id: string;
  societyId: string;
  flatId: string;
  flatCode: string;
  name: string;
  email: string;
  phone: string;
  role: ResidentRole;
  approvalStatus: ResidentApprovalStatus;
  moveInDate: string;
  avatarUrl?: string;
}

export interface FamilyMember {
  id: string;
  societyId: string;
  residentId: string;
  flatId: string;
  name: string;
  relationship: 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'OTHER';
  phone?: string;
  avatarUrl?: string;
}

export type VehicleType = 'CAR' | 'BIKE' | 'EV';

export interface Vehicle {
  id: string;
  societyId: string;
  residentId: string;
  flatId: string;
  flatCode: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  parkingSlotNumber: string;
  rfidTagCode?: string;
}

export type StaffType = 'GUARD' | 'ELECTRICIAN' | 'PLUMBER' | 'CLEANER' | 'GARDENER' | 'SUPERVISOR';
export type StaffDutyStatus = 'ON_DUTY' | 'OFF_DUTY' | 'INACTIVE';

export interface Staff {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  staffType: StaffType;
  gateAssigned?: string;
  shiftTiming?: string;
  status: StaffDutyStatus;
  avatarUrl?: string;
}

export interface SecurityGuard extends Staff {
  guardBadgeNumber: string;
  assignedGate: string;
}

export type VendorCategory = 'WATER_SUPPLY' | 'WASTE_MANAGEMENT' | 'INTERNET' | 'SECURITY_AGENCY' | 'ELEVATOR_MAINTENANCE' | 'OTHER';
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING';

export interface Vendor {
  id: string;
  societyId: string;
  companyName: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email?: string;
  contractStatus: ContractStatus;
  contractExpiryDate?: string;
}

export type DomesticWorkerRole = 'MAID' | 'COOK' | 'DRIVER' | 'NANNY' | 'CAR_CLEANER';

export interface DomesticWorker {
  id: string;
  societyId: string;
  assignedFlatIds: string[];
  name: string;
  phone: string;
  workRole: DomesticWorkerRole;
  passCode: string;
  verificationStatus: 'VERIFIED' | 'PENDING';
  entryTime?: string;
  status: 'INSIDE' | 'OUTSIDE';
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';

export interface AuditLog {
  id: string;
  societyId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  targetEntity: string;
  targetId: string;
  description: string;
  timestamp: string;
}
