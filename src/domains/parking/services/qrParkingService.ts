import type { ParkingSlotItem, ParkingPassQR, ParkingViolationRecord, ParkingType, OccupancyState } from '../types';
import { realTimeSync } from '../../../services/realTimeSync';

const STORAGE_KEY_PARKING_SLOTS = 'aarizo_qr_parking_slots_v1';
const STORAGE_KEY_PARKING_VIOLATIONS = 'aarizo_parking_violations_v1';

const INITIAL_SLOTS: ParkingSlotItem[] = [
  {
    id: 'ps-101',
    societyId: 'soc-1',
    slotCode: 'B1-P01',
    level: 'Basement 1',
    parkingType: 'RESIDENT',
    occupancyState: 'OCCUPIED',
    assignedFlatCode: 'A-101',
    assignedResidentName: 'Siddharth Malhotra',
    assignedVehicleNumber: 'MH-12-AB-9876',
    qrCode: 'QR-PARK-B1-P01',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-09-14T08:00:00Z',
  },
  {
    id: 'ps-102',
    societyId: 'soc-1',
    slotCode: 'B1-P02',
    level: 'Basement 1',
    parkingType: 'RESIDENT',
    occupancyState: 'AVAILABLE',
    assignedFlatCode: 'A-102',
    assignedResidentName: 'Rahul Verma',
    assignedVehicleNumber: 'MH-12-CD-5432',
    qrCode: 'QR-PARK-B1-P02',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-09-14T08:00:00Z',
  },
  {
    id: 'ps-103',
    societyId: 'soc-1',
    slotCode: 'B1-V01',
    level: 'Basement 1',
    parkingType: 'VISITOR',
    occupancyState: 'VISITOR',
    assignedVehicleNumber: 'MH-04-EF-1122',
    qrCode: 'QR-PARK-B1-V01',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-09-14T09:00:00Z',
  },
  {
    id: 'ps-104',
    societyId: 'soc-1',
    slotCode: 'B1-T01',
    level: 'Basement 1',
    parkingType: 'TEMPORARY',
    occupancyState: 'RESERVED',
    assignedFlatCode: 'B-302',
    assignedResidentName: 'Anita Sharma',
    assignedVehicleNumber: 'MH-14-GH-3344',
    qrCode: 'QR-PARK-B1-T01',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-09-14T09:30:00Z',
  },
  {
    id: 'ps-105',
    societyId: 'soc-1',
    slotCode: 'B1-B01',
    level: 'Basement 1',
    parkingType: 'RESIDENT',
    occupancyState: 'BLOCKED',
    qrCode: 'QR-PARK-B1-B01',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-09-14T09:30:00Z',
  },
];

const INITIAL_VIOLATIONS: ParkingViolationRecord[] = [
  {
    id: 'viol-1',
    societyId: 'soc-1',
    vehicleNumber: 'MH-02-XY-9999',
    slotCode: 'B1-P01',
    flatCode: 'A-101',
    residentName: 'Siddharth Malhotra',
    violationType: 'WRONG_SLOT',
    photoEvidenceUrl: 'https://example.com/evidence/car-wrong-slot.jpg',
    severity: 'WARNING',
    status: 'WARNING_ISSUED',
    privateNotes: 'Vehicle parked in reserved resident slot without permission.',
    reportedBy: 'Security Guard Vikram',
    createdAt: '2026-09-14T07:30:00Z',
  },
];

class QRParkingService {
  private getStoredSlots(): ParkingSlotItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_PARKING_SLOTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PARKING_SLOTS, JSON.stringify(INITIAL_SLOTS));
      return INITIAL_SLOTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SLOTS;
    }
  }

  private saveSlots(slots: ParkingSlotItem[]) {
    localStorage.setItem(STORAGE_KEY_PARKING_SLOTS, JSON.stringify(slots));
    realTimeSync.publish('PARKING_UPDATED', { timestamp: new Date().toISOString() });
  }

  private getStoredViolations(): ParkingViolationRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_PARKING_VIOLATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PARKING_VIOLATIONS, JSON.stringify(INITIAL_VIOLATIONS));
      return INITIAL_VIOLATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VIOLATIONS;
    }
  }

  private saveViolations(violations: ParkingViolationRecord[]) {
    localStorage.setItem(STORAGE_KEY_PARKING_VIOLATIONS, JSON.stringify(violations));
    realTimeSync.publish('PARKING_UPDATED', { timestamp: new Date().toISOString() });
  }

  public getSlots(): ParkingSlotItem[] {
    return this.getStoredSlots();
  }

  public getViolations(): ParkingViolationRecord[] {
    return this.getStoredViolations();
  }

  public createSlot(
    slotCode: string,
    level: string,
    parkingType: ParkingType,
    _performedBy: string = 'Society Admin'
  ): ParkingSlotItem {
    const slots = this.getStoredSlots();
    const newId = `ps-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newSlot: ParkingSlotItem = {
      id: newId,
      societyId: 'soc-1',
      slotCode: slotCode.toUpperCase(),
      level,
      parkingType,
      occupancyState: 'AVAILABLE',
      qrCode: `QR-PARK-${slotCode.toUpperCase()}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    slots.unshift(newSlot);
    this.saveSlots(slots);
    return newSlot;
  }

  public assignOrReassignSlot(
    slotId: string,
    flatCode: string,
    residentName: string,
    vehicleNumber: string,
    parkingType: ParkingType = 'RESIDENT'
  ): ParkingSlotItem | null {
    const slots = this.getStoredSlots();
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return null;

    const timestamp = new Date().toISOString();
    const updated: ParkingSlotItem = {
      ...slots[index],
      parkingType,
      occupancyState: 'OCCUPIED',
      assignedFlatCode: flatCode,
      assignedResidentName: residentName,
      assignedVehicleNumber: vehicleNumber.toUpperCase(),
      updatedAt: timestamp,
    };

    slots[index] = updated;
    this.saveSlots(slots);
    return updated;
  }

  public toggleBlockSlot(slotId: string): ParkingSlotItem | null {
    const slots = this.getStoredSlots();
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return null;

    const slot = slots[index];
    const timestamp = new Date().toISOString();
    const newState: OccupancyState = slot.occupancyState === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED';

    const updated: ParkingSlotItem = {
      ...slot,
      occupancyState: newState,
      updatedAt: timestamp,
    };

    slots[index] = updated;
    this.saveSlots(slots);
    return updated;
  }

  public generateQRPass(
    parkingType: ParkingType,
    vehicleNumber: string,
    residentName: string,
    flatCode: string,
    slotCode: string,
    durationDays: number = 7
  ): ParkingPassQR {
    const now = new Date();
    const validUntil = new Date(now.getTime() + durationDays * 86400000);
    const passCode = `QR-PASS-${Math.floor(1000 + Math.random() * 9000)}`;

    const pass: ParkingPassQR = {
      id: `pass-${Date.now()}`,
      passCode,
      parkingType,
      vehicleNumber: vehicleNumber.toUpperCase(),
      residentName,
      flatCode,
      slotCode,
      validFrom: now.toISOString().split('T')[0],
      validUntil: validUntil.toISOString().split('T')[0],
      qrDataString: JSON.stringify({
        passCode,
        vehicleNumber,
        slotCode,
        residentName,
        flatCode,
      }),
      status: 'ACTIVE',
      createdAt: now.toISOString(),
    };

    return pass;
  }

  public validateQRPassAtGate(passCodeOrVehicle: string): { isValid: boolean; slot?: ParkingSlotItem; reason?: string } {
    const slots = this.getStoredSlots();
    const match = slots.find(
      s => s.slotCode.toLowerCase() === passCodeOrVehicle.toLowerCase() ||
           (s.assignedVehicleNumber && s.assignedVehicleNumber.toLowerCase() === passCodeOrVehicle.toLowerCase())
    );

    if (!match) {
      return { isValid: false, reason: `No registered vehicle or slot found matching "${passCodeOrVehicle}".` };
    }

    if (match.occupancyState === 'BLOCKED') {
      return { isValid: false, slot: match, reason: `Slot ${match.slotCode} is BLOCKED by society admin.` };
    }

    return { isValid: true, slot: match };
  }

  public reportViolation(
    vehicleNumber: string,
    slotCode: string,
    violationType: 'UNAUTHORIZED_PARKING' | 'WRONG_SLOT' | 'OVERSTAY' | 'BLOCKING_DRIVEWAY',
    privateNotes: string,
    reportedBy: string,
    photoEvidenceUrl?: string
  ): ParkingViolationRecord {
    const violations = this.getStoredViolations();
    const slots = this.getStoredSlots();
    const matchingSlot = slots.find(s => s.assignedVehicleNumber === vehicleNumber.toUpperCase() || s.slotCode === slotCode);

    const newViolation: ParkingViolationRecord = {
      id: `viol-${Date.now()}`,
      societyId: 'soc-1',
      vehicleNumber: vehicleNumber.toUpperCase(),
      slotCode,
      flatCode: matchingSlot?.assignedFlatCode,
      residentName: matchingSlot?.assignedResidentName,
      violationType,
      photoEvidenceUrl,
      severity: 'WARNING',
      status: 'WARNING_ISSUED',
      privateNotes,
      reportedBy,
      createdAt: new Date().toISOString(),
    };

    violations.unshift(newViolation);
    this.saveViolations(violations);
    return newViolation;
  }

  public escalateViolation(violationId: string): ParkingViolationRecord | null {
    const violations = this.getStoredViolations();
    const index = violations.findIndex(v => v.id === violationId);
    if (index === -1) return null;

    const updated: ParkingViolationRecord = {
      ...violations[index],
      severity: 'ESCALATED_FINE',
      status: 'ESCALATED',
    };

    violations[index] = updated;
    this.saveViolations(violations);
    return updated;
  }
}

export const qrParkingService = new QRParkingService();
