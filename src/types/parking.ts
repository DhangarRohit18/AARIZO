export type SlotType = 'RESIDENT' | 'VISITOR' | 'RESERVED' | 'BLOCKED';

export type OccupancyState =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'VISITOR'
  | 'BLOCKED';

export type RequestType = 'PERMANENT' | 'TEMPORARY' | 'VISITOR';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ParkingSlot {
  id: string;
  societyId: string;
  slotNumber: string; // e.g. "B1-P12"
  level: string; // e.g. "Basement 1", "Podium 2"
  slotType: SlotType;
  occupancyState: OccupancyState;
  assignedFlatId?: string;
  assignedFlatCode?: string;
  assignedResidentName?: string;
  assignedVehicleNumber?: string;
  qrDataString: string;
  updatedAt: string;
}

export interface ParkingRequest {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  vehicleNumber: string;
  vehicleType: 'CAR' | 'BIKE' | 'EV';
  requestType: RequestType;
  startDate?: string;
  endDate?: string;
  status: RequestStatus;
  allocatedSlotId?: string;
  allocatedSlotNumber?: string;
  createdAt: string;
}

export interface ParkingLog {
  id: string;
  societyId: string;
  slotNumber: string;
  vehicleNumber: string;
  flatCode: string;
  action: 'ENTRY' | 'EXIT';
  timestamp: string;
  scannedBy: string;
}

export interface ParkingQRValidationResult {
  isValid: boolean;
  reason?: string;
  slot?: ParkingSlot;
}
