import type {
  ParkingSlot,
  ParkingRequest,
  ParkingLog,
  ParkingQRValidationResult,
  SlotType,
  OccupancyState,
  RequestType,
} from '../types/parking';
import { logAudit } from './societyService';
import { parkingSlotRepository, parkingRequestRepository } from '../repositories/parking/ParkingRepository';

const STORAGE_KEYS = {
  SLOTS: 'communityos_parking_slots_v3',
  REQUESTS: 'communityos_parking_requests_v3',
  LOGS: 'communityos_parking_logs_v3',
};

const SEED_SLOTS: ParkingSlot[] = [
  { id: 'slot-1', societyId: 'soc-gvs', slotNumber: 'B1-P12', level: 'Basement 1', slotType: 'RESIDENT', occupancyState: 'OCCUPIED', assignedFlatId: 'flat-1204', assignedFlatCode: 'B-1204', assignedResidentName: 'Vikram Joshi', assignedVehicleNumber: 'MH-02-CB-4092', qrDataString: 'COMMUNITYOS:PARK:B1-P12:MH-02-CB-4092', updatedAt: '2026-09-10' },
  { id: 'slot-2', societyId: 'soc-gvs', slotNumber: 'B1-P13', level: 'Basement 1', slotType: 'RESIDENT', occupancyState: 'AVAILABLE', assignedFlatId: 'flat-301', assignedFlatCode: 'C-301', assignedResidentName: 'Mayuri Udar', assignedVehicleNumber: 'MH-01-AX-9900', qrDataString: 'COMMUNITYOS:PARK:B1-P13:MH-01-AX-9900', updatedAt: '2026-09-10' },
  { id: 'slot-3', societyId: 'soc-gvs', slotNumber: 'B1-V01', level: 'Basement 1', slotType: 'VISITOR', occupancyState: 'VISITOR', qrDataString: 'COMMUNITYOS:PARK:B1-V01:VISITOR', updatedAt: '2026-09-10' },
  { id: 'slot-4', societyId: 'soc-gvs', slotNumber: 'B1-V02', level: 'Basement 1', slotType: 'VISITOR', occupancyState: 'AVAILABLE', qrDataString: 'COMMUNITYOS:PARK:B1-V02:VISITOR', updatedAt: '2026-09-10' },
  { id: 'slot-5', societyId: 'soc-gvs', slotNumber: 'P1-R01', level: 'Podium 1', slotType: 'RESERVED', occupancyState: 'RESERVED', assignedResidentName: 'Secretary Office', qrDataString: 'COMMUNITYOS:PARK:P1-R01:RESERVED', updatedAt: '2026-09-10' },
  { id: 'slot-6', societyId: 'soc-gvs', slotNumber: 'P1-B01', level: 'Podium 1', slotType: 'BLOCKED', occupancyState: 'BLOCKED', qrDataString: 'COMMUNITYOS:PARK:P1-B01:BLOCKED', updatedAt: '2026-09-10' },
];

const SEED_REQUESTS: ParkingRequest[] = [
  { id: 'req-1', societyId: 'soc-gvs', residentId: 'res-2', residentName: 'Ananya Roy', flatCode: 'A-402', vehicleNumber: 'MH-03-AZ-1120', vehicleType: 'BIKE', requestType: 'PERMANENT', status: 'PENDING', createdAt: '2026-09-12' },
  { id: 'req-2', societyId: 'soc-gvs', residentId: 'res-1', residentName: 'Vikram Joshi', flatCode: 'B-1204', vehicleNumber: 'KA-01-MH-5544', vehicleType: 'CAR', requestType: 'TEMPORARY', startDate: '2026-09-15', endDate: '2026-09-20', status: 'PENDING', createdAt: '2026-09-13' },
];

const SEED_LOGS: ParkingLog[] = [
  { id: 'plog-1', societyId: 'soc-gvs', slotNumber: 'B1-P12', vehicleNumber: 'MH-02-CB-4092', flatCode: 'B-1204', action: 'ENTRY', timestamp: 'Today, 10:30 AM', scannedBy: 'Officer R. Singh' },
];

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save parking data key ${key}:`, err);
  }
}

export const parkingService = {
  getSlots: (societyId: string): ParkingSlot[] =>
    getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS).filter((s) => s.societyId === societyId),

  getRequests: (societyId: string): ParkingRequest[] =>
    getItem(STORAGE_KEYS.REQUESTS, SEED_REQUESTS).filter((r) => r.societyId === societyId),

  getLogs: (societyId: string): ParkingLog[] =>
    getItem(STORAGE_KEYS.LOGS, SEED_LOGS).filter((l) => l.societyId === societyId),

  createSlot: (
    data: { societyId: string; slotNumber: string; level: string; slotType: SlotType },
    actor: { id: string; name: string; role: string }
  ): ParkingSlot => {
    const slots = getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    const existing = slots.find((s) => s.societyId === data.societyId && s.slotNumber.toUpperCase() === data.slotNumber.toUpperCase());
    if (existing) {
      throw new Error(`Parking Slot ${data.slotNumber} already exists in this society.`);
    }

    const newSlot: ParkingSlot = {
      ...data,
      id: `slot-${Date.now()}`,
      occupancyState: data.slotType === 'VISITOR' ? 'VISITOR' : data.slotType === 'RESERVED' ? 'RESERVED' : data.slotType === 'BLOCKED' ? 'BLOCKED' : 'AVAILABLE',
      qrDataString: `COMMUNITYOS:PARK:${data.slotNumber.toUpperCase()}:UNASSIGNED`,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setItem(STORAGE_KEYS.SLOTS, [newSlot, ...slots]);
    parkingSlotRepository.create(newSlot).catch(() => {});
    logAudit(data.societyId, actor, 'CREATE', 'ParkingSlot', newSlot.id, `Created parking slot ${newSlot.slotNumber} (${newSlot.level})`);
    return newSlot;
  },

  assignSlot: (
    slotId: string,
    assignment: { flatId: string; flatCode: string; residentName: string; vehicleNumber: string },
    actor: { id: string; name: string; role: string }
  ): ParkingSlot | null => {
    const slots = getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    const idx = slots.findIndex((s) => s.id === slotId);
    if (idx === -1) return null;

    // Check duplicate vehicle assignment
    const dupVehicle = slots.find((s) => s.id !== slotId && s.assignedVehicleNumber && s.assignedVehicleNumber.toUpperCase() === assignment.vehicleNumber.toUpperCase());
    if (dupVehicle) {
      throw new Error(`Vehicle ${assignment.vehicleNumber} is already assigned to slot ${dupVehicle.slotNumber}. Duplicate assignment blocked.`);
    }

    slots[idx].assignedFlatId = assignment.flatId;
    slots[idx].assignedFlatCode = assignment.flatCode;
    slots[idx].assignedResidentName = assignment.residentName;
    slots[idx].assignedVehicleNumber = assignment.vehicleNumber.toUpperCase();
    slots[idx].qrDataString = `COMMUNITYOS:PARK:${slots[idx].slotNumber}:${assignment.vehicleNumber.toUpperCase()}`;
    slots[idx].updatedAt = new Date().toISOString().split('T')[0];

    setItem(STORAGE_KEYS.SLOTS, slots);
    parkingSlotRepository.update(slotId, {
      assignedFlatId: assignment.flatId,
      assignedFlatCode: assignment.flatCode,
      assignedResidentName: assignment.residentName,
      assignedVehicleNumber: assignment.vehicleNumber.toUpperCase(),
      qrDataString: slots[idx].qrDataString,
    }).catch(() => {});
    logAudit(slots[idx].societyId, actor, 'UPDATE', 'ParkingSlot', slotId, `Assigned slot ${slots[idx].slotNumber} to ${assignment.residentName} (${assignment.vehicleNumber})`);
    return slots[idx];
  },

  updateSlotOccupancy: (
    slotId: string,
    occupancyState: OccupancyState,
    actor: { id: string; name: string; role: string }
  ): ParkingSlot | null => {
    const slots = getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    const idx = slots.findIndex((s) => s.id === slotId);
    if (idx === -1) return null;

    slots[idx].occupancyState = occupancyState;
    slots[idx].updatedAt = new Date().toISOString().split('T')[0];

    setItem(STORAGE_KEYS.SLOTS, slots);
    parkingSlotRepository.update(slotId, {
      occupancyState,
    }).catch(() => {});
    logAudit(slots[idx].societyId, actor, 'STATUS_CHANGE', 'ParkingSlot', slotId, `Updated slot ${slots[idx].slotNumber} occupancy state to ${occupancyState}`);
    return slots[idx];
  },

  createParkingRequest: (
    data: {
      societyId: string;
      residentId: string;
      residentName: string;
      flatCode: string;
      vehicleNumber: string;
      vehicleType: 'CAR' | 'BIKE' | 'EV';
      requestType: RequestType;
      startDate?: string;
      endDate?: string;
    },
    actor: { id: string; name: string; role: string }
  ): ParkingRequest => {
    const requests = getItem(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const newReq: ParkingRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setItem(STORAGE_KEYS.REQUESTS, [newReq, ...requests]);
    parkingRequestRepository.create(newReq).catch(() => {});
    logAudit(data.societyId, actor, 'CREATE', 'ParkingRequest', newReq.id, `Submitted ${data.requestType} parking request for vehicle ${data.vehicleNumber}`);
    return newReq;
  },

  approveParkingRequest: (
    requestId: string,
    slotId: string,
    actor: { id: string; name: string; role: string }
  ): ParkingRequest | null => {
    const requests = getItem(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const reqIdx = requests.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) return null;

    const slots = getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) throw new Error('Target parking slot not found.');

    // Assign slot
    parkingService.assignSlot(
      slotId,
      {
        flatId: 'flat-req',
        flatCode: requests[reqIdx].flatCode,
        residentName: requests[reqIdx].residentName,
        vehicleNumber: requests[reqIdx].vehicleNumber,
      },
      actor
    );

    requests[reqIdx].status = 'APPROVED';
    requests[reqIdx].allocatedSlotId = slotId;
    requests[reqIdx].allocatedSlotNumber = slot.slotNumber;

    setItem(STORAGE_KEYS.REQUESTS, requests);
    logAudit(requests[reqIdx].societyId, actor, 'STATUS_CHANGE', 'ParkingRequest', requestId, `Approved parking request for ${requests[reqIdx].vehicleNumber} -> Slot ${slot.slotNumber}`);
    return requests[reqIdx];
  },

  validateParkingQR: (societyId: string, qrOrSlot: string): ParkingQRValidationResult => {
    const slots = getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    const clean = qrOrSlot.toUpperCase().trim();

    const slot = slots.find(
      (s) =>
        s.societyId === societyId &&
        (s.slotNumber.toUpperCase() === clean || s.qrDataString.toUpperCase().includes(clean))
    );

    if (!slot) {
      return { isValid: false, reason: 'Invalid Parking QR or Slot number. Record not found.' };
    }

    if (slot.occupancyState === 'BLOCKED') {
      return { isValid: false, reason: `Slot ${slot.slotNumber} is currently BLOCKED for maintenance.`, slot };
    }

    return { isValid: true, slot };
  },

  scanEntry: (
    slotId: string,
    vehicleNumber: string,
    actor: { id: string; name: string; role: string }
  ): ParkingSlot | null => {
    const slots = getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    const idx = slots.findIndex((s) => s.id === slotId);
    if (idx === -1) return null;

    slots[idx].occupancyState = 'OCCUPIED';
    slots[idx].updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.SLOTS, slots);

    // Record parking log
    const logs = getItem(STORAGE_KEYS.LOGS, SEED_LOGS);
    const newLog: ParkingLog = {
      id: `plog-${Date.now()}`,
      societyId: slots[idx].societyId,
      slotNumber: slots[idx].slotNumber,
      vehicleNumber: vehicleNumber || slots[idx].assignedVehicleNumber || 'UNKNOWN',
      flatCode: slots[idx].assignedFlatCode || 'N/A',
      action: 'ENTRY',
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scannedBy: actor.name,
    };
    setItem(STORAGE_KEYS.LOGS, [newLog, ...logs]);

    logAudit(slots[idx].societyId, actor, 'STATUS_CHANGE', 'ParkingSlot', slotId, `Vehicle ${vehicleNumber} entered slot ${slots[idx].slotNumber}`);
    return slots[idx];
  },

  scanExit: (
    slotId: string,
    actor: { id: string; name: string; role: string }
  ): ParkingSlot | null => {
    const slots = getItem(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    const idx = slots.findIndex((s) => s.id === slotId);
    if (idx === -1) return null;

    const currentVeh = slots[idx].assignedVehicleNumber || 'VISITOR';
    slots[idx].occupancyState = slots[idx].slotType === 'VISITOR' ? 'VISITOR' : 'AVAILABLE';
    slots[idx].updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.SLOTS, slots);

    // Record parking log
    const logs = getItem(STORAGE_KEYS.LOGS, SEED_LOGS);
    const newLog: ParkingLog = {
      id: `plog-${Date.now()}`,
      societyId: slots[idx].societyId,
      slotNumber: slots[idx].slotNumber,
      vehicleNumber: currentVeh,
      flatCode: slots[idx].assignedFlatCode || 'N/A',
      action: 'EXIT',
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scannedBy: actor.name,
    };
    setItem(STORAGE_KEYS.LOGS, [newLog, ...logs]);

    logAudit(slots[idx].societyId, actor, 'STATUS_CHANGE', 'ParkingSlot', slotId, `Vehicle exited slot ${slots[idx].slotNumber}`);
    return slots[idx];
  },
};
