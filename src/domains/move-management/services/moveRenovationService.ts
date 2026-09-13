import type { MoveEvent, MoveChecklistItem } from '../types';
import type { RenovationPermit } from '../../renovation/types';
import { realTimeSync } from '../../../services/realTimeSync';

const STORAGE_KEY_MOVES = 'aarizo_move_events_v1';
const STORAGE_KEY_RENOVATIONS = 'aarizo_renovations_v1';

const DEFAULT_MOVE_OUT_CHECKLIST: Omit<MoveChecklistItem, 'id' | 'isCompleted'>[] = [
  { title: 'Society Maintenance Dues Cleared', isMandatory: true },
  { title: 'NOC Issued by Managing Committee', isMandatory: true },
  { title: 'Common Area & Lift Protection Applied', isMandatory: true },
  { title: 'Security Damage Inspection Completed', isMandatory: true },
  { title: 'Key Handover / Access Card Deactivation', isMandatory: false },
];

const INITIAL_MOVES: MoveEvent[] = [
  {
    id: 'mov-101',
    moveType: 'MOVE_IN',
    flatId: 'flt-a101',
    flatNumber: 'A-101',
    residentId: 'res-1',
    residentName: 'Siddharth Malhotra',
    scheduledDate: '2026-09-18',
    status: 'APPROVED',
    liftSlot: {
      id: 'ls-1',
      liftName: 'Tower A Freight Elevator 1',
      date: '2026-09-18',
      timeSlot: '09:00 - 12:00',
      isReserved: true,
    },
    vehicle: {
      vehicleNumber: 'MH-12-AB-9876',
      driverName: 'Ramesh Singh',
      driverPhone: '+91 98765 12345',
      vehicleType: 'TRUCK',
    },
    vendor: {
      companyName: 'Agarwal Packers & Movers',
      contactPerson: 'Vikram Agarwal',
      contactPhone: '+91 98765 54321',
      workerCount: 4,
    },
    checklist: [
      { id: 'chk-1', title: 'Lift Reservation Confirmed', isMandatory: true, isCompleted: true },
      { id: 'chk-2', title: 'Security Gatepass Generated', isMandatory: true, isCompleted: true },
    ],
    gatepassCode: 'GP-MOV-9876',
    gatepassQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GP-MOV-9876',
    approvedBy: 'Society Admin',
    approvedAt: '2026-09-14T10:00:00Z',
    createdAt: '2026-09-13T14:00:00Z',
    updatedAt: '2026-09-14T10:00:00Z',
  },
];

const INITIAL_RENOVATIONS: RenovationPermit[] = [
  {
    id: 'ren-201',
    projectTitle: 'Interior Painting & Kitchen Renovation',
    flatId: 'flt-b302',
    flatNumber: 'B-302',
    residentId: 'res-2',
    residentName: 'Anita Sharma',
    contractorCompany: 'Urban Interiors Ltd',
    contractorPhone: '+91 98765 88888',
    startDate: '2026-09-15',
    endDate: '2026-09-30',
    allowedHoursStart: '09:00',
    allowedHoursEnd: '18:00',
    noiseRestrictions: 'No heavy drilling after 5:00 PM or between 1:00 PM - 2:30 PM.',
    weekendRulesAllowed: false,
    workers: [
      {
        id: 'wrk-1',
        workerName: 'Suresh Carpenter',
        idProofType: 'AADAAR',
        idNumber: 'XXXX-XXXX-1234',
        phone: '+91 98765 11223',
        isVerifiedBySecurity: true,
        qrCode: 'QR-WRK-SURESH',
      },
      {
        id: 'wrk-2',
        workerName: 'Mahesh Painter',
        idProofType: 'AADAAR',
        idNumber: 'XXXX-XXXX-5678',
        phone: '+91 98765 44556',
        isVerifiedBySecurity: false,
        qrCode: 'QR-WRK-MAHESH',
      },
    ],
    materialsList: ['Paint Cans (10x)', 'Wooden Tiles (50 Sft)', 'Drill Machine', 'Ladder'],
    vehicleDetails: 'MH-14-CD-1122 (Tempo)',
    status: 'IN_PROGRESS',
    gatepassCode: 'GP-REN-5544',
    approvedBy: 'Facility Manager',
    createdAt: '2026-09-12T09:00:00Z',
    updatedAt: '2026-09-14T08:00:00Z',
  },
];

class MoveRenovationService {
  private getStoredMoves(): MoveEvent[] {
    const raw = localStorage.getItem(STORAGE_KEY_MOVES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MOVES, JSON.stringify(INITIAL_MOVES));
      return INITIAL_MOVES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOVES;
    }
  }

  private saveMoves(moves: MoveEvent[]) {
    localStorage.setItem(STORAGE_KEY_MOVES, JSON.stringify(moves));
    realTimeSync.publish('MOVE_RENOVATION_UPDATED', { timestamp: new Date().toISOString() });
  }

  private getStoredRenovations(): RenovationPermit[] {
    const raw = localStorage.getItem(STORAGE_KEY_RENOVATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RENOVATIONS, JSON.stringify(INITIAL_RENOVATIONS));
      return INITIAL_RENOVATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RENOVATIONS;
    }
  }

  private saveRenovations(renovations: RenovationPermit[]) {
    localStorage.setItem(STORAGE_KEY_RENOVATIONS, JSON.stringify(renovations));
    realTimeSync.publish('MOVE_RENOVATION_UPDATED', { timestamp: new Date().toISOString() });
  }

  // --- MOVE API ---
  public getMoves(): MoveEvent[] {
    return this.getStoredMoves();
  }

  public submitMoveRequest(
    data: Omit<MoveEvent, 'id' | 'status' | 'gatepassCode' | 'gatepassQrUrl' | 'checklist' | 'createdAt' | 'updatedAt'>
  ): MoveEvent {
    const moves = this.getStoredMoves();
    const newId = `mov-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const gatepassCode = `GP-MOV-${Math.floor(1000 + Math.random() * 9000)}`;

    const checklist: MoveChecklistItem[] = data.moveType === 'MOVE_OUT'
      ? DEFAULT_MOVE_OUT_CHECKLIST.map((c, idx) => ({ ...c, id: `chk-${idx}`, isCompleted: false }))
      : [{ id: 'chk-in-1', title: 'Lift Reservation Confirmed', isMandatory: true, isCompleted: true }];

    const newMove: MoveEvent = {
      ...data,
      id: newId,
      status: 'SUBMITTED',
      checklist,
      gatepassCode,
      gatepassQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${gatepassCode}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    moves.unshift(newMove);
    this.saveMoves(moves);
    return newMove;
  }

  public approveMoveRequest(moveId: string, approvedBy: string): MoveEvent | null {
    const moves = this.getStoredMoves();
    const index = moves.findIndex(m => m.id === moveId);
    if (index === -1) return null;

    const timestamp = new Date().toISOString();
    const updated: MoveEvent = {
      ...moves[index],
      status: 'APPROVED',
      approvedBy,
      approvedAt: timestamp,
      updatedAt: timestamp,
    };

    moves[index] = updated;
    this.saveMoves(moves);
    return updated;
  }

  public updateMoveChecklist(moveId: string, itemTitle: string, isCompleted: boolean): MoveEvent | null {
    const moves = this.getStoredMoves();
    const index = moves.findIndex(m => m.id === moveId);
    if (index === -1) return null;

    const move = moves[index];
    const updatedChecklist = move.checklist.map(chk =>
      chk.title === itemTitle ? { ...chk, isCompleted } : chk
    );

    const updated: MoveEvent = {
      ...move,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    };

    moves[index] = updated;
    this.saveMoves(moves);
    return updated;
  }

  public completeMove(moveId: string): MoveEvent | null {
    const moves = this.getStoredMoves();
    const index = moves.findIndex(m => m.id === moveId);
    if (index === -1) return null;

    const timestamp = new Date().toISOString();
    const updated: MoveEvent = {
      ...moves[index],
      status: 'COMPLETED',
      updatedAt: timestamp,
    };

    moves[index] = updated;
    this.saveMoves(moves);
    return updated;
  }

  // --- RENOVATION API ---
  public getRenovations(): RenovationPermit[] {
    return this.getStoredRenovations();
  }

  public submitRenovation(
    data: Omit<RenovationPermit, 'id' | 'status' | 'gatepassCode' | 'createdAt' | 'updatedAt'>
  ): RenovationPermit {
    const renovations = this.getStoredRenovations();
    const newId = `ren-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const gatepassCode = `GP-REN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPermit: RenovationPermit = {
      ...data,
      id: newId,
      status: 'SUBMITTED',
      gatepassCode,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    renovations.unshift(newPermit);
    this.saveRenovations(renovations);
    return newPermit;
  }

  public approveRenovation(permitId: string, approvedBy: string): RenovationPermit | null {
    const renovations = this.getStoredRenovations();
    const index = renovations.findIndex(r => r.id === permitId);
    if (index === -1) return null;

    const timestamp = new Date().toISOString();
    const updated: RenovationPermit = {
      ...renovations[index],
      status: 'APPROVED',
      approvedBy,
      updatedAt: timestamp,
    };

    renovations[index] = updated;
    this.saveRenovations(renovations);
    return updated;
  }

  public verifyWorkerAtGate(permitId: string, workerName: string): RenovationPermit | null {
    const renovations = this.getStoredRenovations();
    const index = renovations.findIndex(r => r.id === permitId);
    if (index === -1) return null;

    const permit = renovations[index];
    const updatedWorkers = permit.workers.map(w =>
      w.workerName.toLowerCase() === workerName.toLowerCase() ? { ...w, isVerifiedBySecurity: true } : w
    );

    const updated: RenovationPermit = {
      ...permit,
      workers: updatedWorkers,
      updatedAt: new Date().toISOString(),
    };

    renovations[index] = updated;
    this.saveRenovations(renovations);
    return updated;
  }
}

export const moveRenovationService = new MoveRenovationService();
