export type MoveType = 'MOVE_IN' | 'MOVE_OUT';

export type MoveStatus = 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface MoveChecklistItem {
  id: string;
  title: string;
  isMandatory: boolean;
  isCompleted: boolean;
  notes?: string;
}

export interface LiftSlot {
  id: string;
  liftName: string;
  date: string;
  timeSlot: '09:00 - 12:00' | '12:00 - 15:00' | '15:00 - 18:00';
  isReserved: boolean;
}

export interface VehicleEntry {
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleType: 'TRUCK' | 'TEMPO' | 'VAN' | 'OTHER';
}

export interface VendorEntry {
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  workerCount: number;
}

export interface MoveEvent {
  id: string;
  moveType: MoveType;
  flatId: string;
  flatNumber: string;
  residentId: string;
  residentName: string;
  scheduledDate: string;
  status: MoveStatus;
  
  liftSlot: LiftSlot;
  vehicle: VehicleEntry;
  vendor: VendorEntry;
  checklist: MoveChecklistItem[];
  
  gatepassCode: string;
  gatepassQrUrl: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
