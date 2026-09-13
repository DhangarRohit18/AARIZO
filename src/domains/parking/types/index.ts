export type ParkingType = 'RESIDENT' | 'VISITOR' | 'TEMPORARY' | 'VACATION' | 'SERVICE' | 'DELIVERY';

export type OccupancyState = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'VISITOR' | 'BLOCKED';

export type ViolationSeverity = 'WARNING' | 'FIRST_OFFENSE' | 'ESCALATED_FINE' | 'CLAMP_NOTICE';

export interface ParkingSlotItem {
  id: string;
  societyId: string;
  slotCode: string; // e.g. "B1-P12"
  level: string;    // e.g. "Basement 1"
  parkingType: ParkingType;
  occupancyState: OccupancyState;
  
  assignedFlatCode?: string;
  assignedResidentName?: string;
  assignedVehicleNumber?: string;
  
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingPassQR {
  id: string;
  passCode: string;
  parkingType: ParkingType;
  vehicleNumber: string;
  residentName: string;
  flatCode: string;
  slotCode: string;
  validFrom: string;
  validUntil: string;
  qrDataString: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
}

export interface ParkingViolationRecord {
  id: string;
  societyId: string;
  vehicleNumber: string;
  slotCode: string;
  flatCode?: string;
  residentName?: string;
  violationType: 'UNAUTHORIZED_PARKING' | 'WRONG_SLOT' | 'OVERSTAY' | 'BLOCKING_DRIVEWAY';
  photoEvidenceUrl?: string;
  severity: ViolationSeverity;
  status: 'WARNING_ISSUED' | 'ESCALATED' | 'RESOLVED';
  privateNotes: string;
  reportedBy: string;
  createdAt: string;
}
