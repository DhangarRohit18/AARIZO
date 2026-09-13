import { db } from './db';
import type {
  Society,
  Tower,
  Flat,
  Resident,
  FamilyMember,
  Vehicle,
  Staff,
  Vendor,
  DomesticWorker,
  AuditLog,
  AuditAction,
} from '../types/society';

// Helper to append audit logs
export function logAudit(
  societyId: string,
  actor: { id: string; name: string; role: string },
  action: AuditAction,
  targetEntity: string,
  targetId: string,
  description: string
) {
  const logs = db.getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    societyId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    targetEntity,
    targetId,
    description,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  };
  db.saveAuditLogs([newLog, ...logs]);
}

export const societyService = {
  // --- SOCIETIES (SUPER ADMIN) ---
  getSocieties: (): Society[] => db.getSocieties(),

  getSocietyById: (id: string): Society | undefined =>
    db.getSocieties().find((s) => s.id === id),

  createSociety: (
    data: Omit<Society, 'id' | 'totalTowers' | 'totalFlats' | 'createdAt'>,
    actor: { id: string; name: string; role: string }
  ): Society => {
    const societies = db.getSocieties();
    const newSoc: Society = {
      ...data,
      id: `soc-${Date.now()}`,
      totalTowers: 0,
      totalFlats: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    db.saveSocieties([newSoc, ...societies]);
    logAudit(newSoc.id, actor, 'CREATE', 'Society', newSoc.id, `Created society ${newSoc.name} (${newSoc.code})`);
    return newSoc;
  },

  updateSocietyStatus: (
    id: string,
    status: Society['status'],
    actor: { id: string; name: string; role: string }
  ): Society | null => {
    const societies = db.getSocieties();
    const index = societies.findIndex((s) => s.id === id);
    if (index === -1) return null;

    societies[index].status = status;
    db.saveSocieties(societies);
    logAudit(id, actor, 'STATUS_CHANGE', 'Society', id, `Changed society status to ${status}`);
    return societies[index];
  },

  // --- TOWERS & FLATS (SOCIETY ADMIN) ---
  getTowers: (societyId: string): Tower[] =>
    db.getTowers().filter((t) => t.societyId === societyId),

  createTower: (
    data: Omit<Tower, 'id'>,
    actor: { id: string; name: string; role: string }
  ): Tower => {
    const towers = db.getTowers();
    const newTower: Tower = {
      ...data,
      id: `tow-${Date.now()}`,
    };
    db.saveTowers([...towers, newTower]);
    logAudit(data.societyId, actor, 'CREATE', 'Tower', newTower.id, `Created tower ${newTower.name}`);
    return newTower;
  },

  getFlats: (societyId: string): Flat[] =>
    db.getFlats().filter((f) => f.societyId === societyId),

  createFlat: (
    data: Omit<Flat, 'id'>,
    actor: { id: string; name: string; role: string }
  ): Flat => {
    const flats = db.getFlats();
    const newFlat: Flat = {
      ...data,
      id: `flat-${Date.now()}`,
    };
    db.saveFlats([...flats, newFlat]);

    // Update tower flat count
    const towers = db.getTowers();
    const tIdx = towers.findIndex((t) => t.id === data.towerId);
    if (tIdx !== -1) {
      towers[tIdx].totalFlats += 1;
      db.saveTowers(towers);
    }

    logAudit(data.societyId, actor, 'CREATE', 'Flat', newFlat.id, `Created flat ${newFlat.flatNumber}`);
    return newFlat;
  },

  // --- RESIDENTS ---
  getResidents: (societyId: string): Resident[] =>
    db.getResidents().filter((r) => r.societyId === societyId),

  updateResidentApproval: (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    actor: { id: string; name: string; role: string }
  ): Resident | null => {
    const residents = db.getResidents();
    const index = residents.findIndex((r) => r.id === id);
    if (index === -1) return null;

    residents[index].approvalStatus = status;
    db.saveResidents(residents);

    logAudit(
      residents[index].societyId,
      actor,
      'STATUS_CHANGE',
      'Resident',
      id,
      `${status === 'APPROVED' ? 'Approved' : 'Rejected'} resident ${residents[index].name}`
    );
    return residents[index];
  },

  // --- FAMILY MEMBERS ---
  getFamilyMembers: (societyId: string, residentId?: string): FamilyMember[] =>
    db
      .getFamilyMembers()
      .filter((f) => f.societyId === societyId && (!residentId || f.residentId === residentId)),

  addFamilyMember: (
    data: Omit<FamilyMember, 'id'>,
    actor: { id: string; name: string; role: string }
  ): FamilyMember => {
    const members = db.getFamilyMembers();
    const newMember: FamilyMember = {
      ...data,
      id: `fam-${Date.now()}`,
    };
    db.saveFamilyMembers([...members, newMember]);
    logAudit(data.societyId, actor, 'CREATE', 'FamilyMember', newMember.id, `Added family member ${newMember.name}`);
    return newMember;
  },

  // --- VEHICLES ---
  getVehicles: (societyId: string, residentId?: string): Vehicle[] =>
    db
      .getVehicles()
      .filter((v) => v.societyId === societyId && (!residentId || v.residentId === residentId)),

  addVehicle: (
    data: Omit<Vehicle, 'id'>,
    actor: { id: string; name: string; role: string }
  ): Vehicle => {
    const vehicles = db.getVehicles();
    const newVehicle: Vehicle = {
      ...data,
      id: `veh-${Date.now()}`,
    };
    db.saveVehicles([...vehicles, newVehicle]);
    logAudit(data.societyId, actor, 'CREATE', 'Vehicle', newVehicle.id, `Registered vehicle ${newVehicle.registrationNumber}`);
    return newVehicle;
  },

  // --- STAFF & GUARDS ---
  getStaff: (societyId: string): Staff[] =>
    db.getStaff().filter((s) => s.societyId === societyId),

  createStaff: (
    data: Omit<Staff, 'id'>,
    actor: { id: string; name: string; role: string }
  ): Staff => {
    const staffList = db.getStaff();
    const newStaff: Staff = {
      ...data,
      id: `st-${Date.now()}`,
    };
    db.saveStaff([...staffList, newStaff]);
    logAudit(data.societyId, actor, 'CREATE', 'Staff', newStaff.id, `Registered ${newStaff.staffType} ${newStaff.name}`);
    return newStaff;
  },

  // --- VENDORS ---
  getVendors: (societyId: string): Vendor[] =>
    db.getVendors().filter((v) => v.societyId === societyId),

  createVendor: (
    data: Omit<Vendor, 'id'>,
    actor: { id: string; name: string; role: string }
  ): Vendor => {
    const vendors = db.getVendors();
    const newVendor: Vendor = {
      ...data,
      id: `ven-${Date.now()}`,
    };
    db.saveVendors([...vendors, newVendor]);
    logAudit(data.societyId, actor, 'CREATE', 'Vendor', newVendor.id, `Added vendor ${newVendor.companyName}`);
    return newVendor;
  },

  // --- DOMESTIC WORKERS / SERVICE PROVIDERS ---
  getDomesticWorkers: (societyId: string): DomesticWorker[] =>
    db.getDomesticWorkers().filter((dw) => dw.societyId === societyId),

  createDomesticWorker: (
    data: Omit<DomesticWorker, 'id' | 'passCode' | 'status'>,
    actor: { id: string; name: string; role: string }
  ): DomesticWorker => {
    const list = db.getDomesticWorkers();
    const newWorker: DomesticWorker = {
      ...data,
      id: `dw-${Date.now()}`,
      passCode: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OUTSIDE',
    };
    db.saveDomesticWorkers([...list, newWorker]);
    logAudit(data.societyId, actor, 'CREATE', 'DomesticWorker', newWorker.id, `Registered worker ${newWorker.name} (${newWorker.workRole})`);
    return newWorker;
  },

  // --- AUDIT LOGS ---
  getAuditLogs: (societyId: string): AuditLog[] =>
    db.getAuditLogs().filter((l) => l.societyId === societyId || societyId === 'GLOBAL'),
};
