import type {
  DomesticWorkerProfile,
  StaffIncidentReport,
  StaffAttendanceLog,
  VerificationStatus,
  AccessStatus,
  WorkerType,
} from '../types/staff';
import { logAudit } from './societyService';

const STORAGE_KEYS = {
  PROFILES: 'communityos_staff_profiles_v4',
  INCIDENTS: 'communityos_staff_incidents_v4',
  ATTENDANCE: 'communityos_staff_attendance_v4',
};

const SEED_PROFILES: DomesticWorkerProfile[] = [
  {
    id: 'dw-101',
    societyId: 'soc-gvs',
    name: 'Sunita Devi',
    phone: '9811009922',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    workerType: 'MAID',
    emergencyContactName: 'Ramesh Devi',
    emergencyContactPhone: '9811009900',
    passCode: 'PASS-5542',
    qrDataString: 'COMMUNITYOS:STAFF:PASS-5542:SUNITA_DEVI',
    assignedFlatIds: ['flat-1204', 'flat-301'],
    assignedFlatCodes: ['B-1204', 'C-301'],
    verificationStatus: 'VERIFIED',
    accessStatus: 'ACTIVE',
    attendanceStatus: 'IN',
    lastEntryTime: 'Today, 08:15 AM',
    documents: [
      { id: 'doc-1', name: 'Aadhaar Card', documentType: 'ID_PROOF', url: 'https://example.com/aadhaar.pdf', isVerified: true },
      { id: 'doc-2', name: 'Police Clearance Certificate', documentType: 'POLICE_VERIFICATION', url: 'https://example.com/police.pdf', isVerified: true },
    ],
    createdAt: '2025-06-10',
  },
  {
    id: 'dw-102',
    societyId: 'soc-gvs',
    name: 'Rajesh Carpenter',
    phone: '9820011445',
    workerType: 'TECHNICIAN',
    emergencyContactName: 'Geeta Carpenter',
    emergencyContactPhone: '9820011400',
    passCode: 'PASS-8812',
    qrDataString: 'COMMUNITYOS:STAFF:PASS-8812:RAJESH_CARPENTER',
    assignedFlatIds: ['flat-402'],
    assignedFlatCodes: ['A-402'],
    verificationStatus: 'PENDING',
    accessStatus: 'ACTIVE',
    attendanceStatus: 'OUT',
    documents: [
      { id: 'doc-3', name: 'Aadhaar Card', documentType: 'ID_PROOF', url: 'https://example.com/aadhaar2.pdf', isVerified: false },
    ],
    createdAt: '2026-09-01',
  },
];

const SEED_INCIDENTS: StaffIncidentReport[] = [
  {
    id: 'inc-1',
    societyId: 'soc-gvs',
    workerId: 'dw-102',
    workerName: 'Rajesh Carpenter',
    residentId: 'res-2',
    residentName: 'Ananya Roy',
    flatCode: 'A-402',
    reason: 'Unannounced arrival past scheduled work hours',
    severity: 'LOW',
    createdAt: '2026-09-11',
  },
];

const SEED_ATTENDANCE: StaffAttendanceLog[] = [
  {
    id: 'att-1',
    societyId: 'soc-gvs',
    workerId: 'dw-101',
    workerName: 'Sunita Devi',
    workerType: 'MAID',
    action: 'IN',
    timestamp: 'Today, 08:15 AM',
    scannedBy: 'Officer R. Singh',
  },
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
    console.error(`Failed to save staff data to key ${key}:`, err);
  }
}

export const staffService = {
  getWorkers: (societyId: string): DomesticWorkerProfile[] =>
    getItem(STORAGE_KEYS.PROFILES, SEED_PROFILES).filter((p) => p.societyId === societyId),

  getIncidents: (societyId: string): StaffIncidentReport[] =>
    getItem(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS).filter((i) => i.societyId === societyId),

  getAttendanceLogs: (societyId: string): StaffAttendanceLog[] =>
    getItem(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE).filter((a) => a.societyId === societyId),

  createWorkerProfile: (
    data: {
      societyId: string;
      name: string;
      phone: string;
      workerType: WorkerType;
      emergencyContactName: string;
      emergencyContactPhone: string;
      assignedFlatIds?: string[];
      assignedFlatCodes?: string[];
    },
    actor: { id: string; name: string; role: string }
  ): DomesticWorkerProfile => {
    const profiles = getItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const passCode = `PASS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newWorker: DomesticWorkerProfile = {
      ...data,
      id: `dw-${Date.now()}`,
      passCode,
      qrDataString: `COMMUNITYOS:STAFF:${passCode}:${data.name.toUpperCase().replace(/\s+/g, '_')}`,
      assignedFlatIds: data.assignedFlatIds || [],
      assignedFlatCodes: data.assignedFlatCodes || [],
      verificationStatus: 'PENDING',
      accessStatus: 'ACTIVE',
      attendanceStatus: 'OUT',
      documents: [
        { id: `doc-${Date.now()}`, name: 'Aadhaar Card', documentType: 'ID_PROOF', url: 'https://example.com/doc.pdf', isVerified: false },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setItem(STORAGE_KEYS.PROFILES, [newWorker, ...profiles]);
    logAudit(data.societyId, actor, 'CREATE', 'DomesticWorkerProfile', newWorker.id, `Registered ${data.workerType} profile for ${data.name}`);
    return newWorker;
  },

  updateVerificationStatus: (
    workerId: string,
    verificationStatus: VerificationStatus,
    actor: { id: string; name: string; role: string }
  ): DomesticWorkerProfile | null => {
    const profiles = getItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const idx = profiles.findIndex((p) => p.id === workerId);
    if (idx === -1) return null;

    profiles[idx].verificationStatus = verificationStatus;
    if (verificationStatus === 'VERIFIED') {
      profiles[idx].documents.forEach((d) => (d.isVerified = true));
    }

    setItem(STORAGE_KEYS.PROFILES, profiles);
    logAudit(profiles[idx].societyId, actor, 'STATUS_CHANGE', 'DomesticWorkerProfile', workerId, `Updated verification status of ${profiles[idx].name} to ${verificationStatus}`);
    return profiles[idx];
  },

  updateAccessStatus: (
    workerId: string,
    accessStatus: AccessStatus,
    actor: { id: string; name: string; role: string }
  ): DomesticWorkerProfile | null => {
    const profiles = getItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const idx = profiles.findIndex((p) => p.id === workerId);
    if (idx === -1) return null;

    profiles[idx].accessStatus = accessStatus;
    if (accessStatus === 'SUSPENDED' || accessStatus === 'BLACK_LISTED') {
      profiles[idx].attendanceStatus = 'SUSPENDED';
    }

    setItem(STORAGE_KEYS.PROFILES, profiles);
    logAudit(profiles[idx].societyId, actor, 'STATUS_CHANGE', 'DomesticWorkerProfile', workerId, `Updated access status of ${profiles[idx].name} to ${accessStatus}`);
    return profiles[idx];
  },

  revokeFlatAccess: (
    workerId: string,
    flatCode: string,
    actor: { id: string; name: string; role: string }
  ): DomesticWorkerProfile | null => {
    const profiles = getItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const idx = profiles.findIndex((p) => p.id === workerId);
    if (idx === -1) return null;

    profiles[idx].assignedFlatCodes = profiles[idx].assignedFlatCodes.filter((f) => f !== flatCode);
    setItem(STORAGE_KEYS.PROFILES, profiles);
    logAudit(profiles[idx].societyId, actor, 'UPDATE', 'DomesticWorkerProfile', workerId, `Revoked flat ${flatCode} access for worker ${profiles[idx].name}`);
    return profiles[idx];
  },

  reportWorkerIncident: (
    data: {
      societyId: string;
      workerId: string;
      workerName: string;
      residentId: string;
      residentName: string;
      flatCode: string;
      reason: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
    },
    actor: { id: string; name: string; role: string }
  ): StaffIncidentReport => {
    const incidents = getItem(STORAGE_KEYS.INCIDENTS, SEED_INCIDENTS);
    const newInc: StaffIncidentReport = {
      ...data,
      id: `inc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setItem(STORAGE_KEYS.INCIDENTS, [newInc, ...incidents]);
    logAudit(data.societyId, actor, 'CREATE', 'StaffIncidentReport', newInc.id, `Reported incident for worker ${data.workerName}: ${data.reason}`);
    return newInc;
  },

  scanWorkerEntry: (
    workerId: string,
    actor: { id: string; name: string; role: string }
  ): DomesticWorkerProfile | null => {
    const profiles = getItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const idx = profiles.findIndex((p) => p.id === workerId);
    if (idx === -1) return null;

    if (profiles[idx].accessStatus === 'SUSPENDED' || profiles[idx].accessStatus === 'BLACK_LISTED') {
      throw new Error(`ENTRY DENIED: Worker ${profiles[idx].name} access is ${profiles[idx].accessStatus}.`);
    }

    const timeStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    profiles[idx].attendanceStatus = 'IN';
    profiles[idx].lastEntryTime = timeStr;
    setItem(STORAGE_KEYS.PROFILES, profiles);

    // Record attendance log
    const logs = getItem(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
    const newLog: StaffAttendanceLog = {
      id: `att-${Date.now()}`,
      societyId: profiles[idx].societyId,
      workerId,
      workerName: profiles[idx].name,
      workerType: profiles[idx].workerType,
      action: 'IN',
      timestamp: timeStr,
      scannedBy: actor.name,
    };
    setItem(STORAGE_KEYS.ATTENDANCE, [newLog, ...logs]);

    logAudit(profiles[idx].societyId, actor, 'STATUS_CHANGE', 'DomesticWorkerProfile', workerId, `Recorded gate ENTRY for staff ${profiles[idx].name}`);
    return profiles[idx];
  },

  scanWorkerExit: (
    workerId: string,
    actor: { id: string; name: string; role: string }
  ): DomesticWorkerProfile | null => {
    const profiles = getItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const idx = profiles.findIndex((p) => p.id === workerId);
    if (idx === -1) return null;

    const timeStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    profiles[idx].attendanceStatus = 'OUT';
    profiles[idx].lastExitTime = timeStr;
    setItem(STORAGE_KEYS.PROFILES, profiles);

    // Record attendance log
    const logs = getItem(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
    const newLog: StaffAttendanceLog = {
      id: `att-${Date.now()}`,
      societyId: profiles[idx].societyId,
      workerId,
      workerName: profiles[idx].name,
      workerType: profiles[idx].workerType,
      action: 'OUT',
      timestamp: timeStr,
      scannedBy: actor.name,
    };
    setItem(STORAGE_KEYS.ATTENDANCE, [newLog, ...logs]);

    logAudit(profiles[idx].societyId, actor, 'STATUS_CHANGE', 'DomesticWorkerProfile', workerId, `Recorded gate EXIT for staff ${profiles[idx].name}`);
    return profiles[idx];
  },
};
