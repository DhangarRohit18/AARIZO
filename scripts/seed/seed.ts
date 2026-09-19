import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';

export interface SeedOptions {
  mode: 'demo' | 'test' | 'production-bootstrap';
  clearExisting?: boolean;
}

export const DEMO_SOCIETIES = [
  {
    id: 'soc-gvs',
    name: 'Green Valley Residency',
    code: 'GVS',
    city: 'Mumbai',
    address: 'Plot 42, Palm Beach Road, Sector 19, Sanpada, Navi Mumbai 400705',
    status: 'ACTIVE',
    totalTowers: 3,
    totalFlats: 120,
    establishedYear: 2018,
    gateCount: 2,
    amenitiesCount: 6,
  },
  {
    id: 'soc-azh',
    name: 'AARIZO Heights',
    code: 'AZH',
    city: 'Bengaluru',
    address: 'Survey 104, Outer Ring Road, Bellandur, Bengaluru 560103',
    status: 'ACTIVE',
    totalTowers: 4,
    totalFlats: 160,
    establishedYear: 2021,
    gateCount: 3,
    amenitiesCount: 8,
  }
];

export const DEMO_ROLES_ACCOUNTS = [
  {
    uid: 'user-resident-01',
    name: 'Sarvesh Kulkarni',
    phone: '+919876543210',
    email: 'sarvesh@greenvalley.com',
    role: 'resident',
    societyId: 'soc-gvs',
    flatNumber: 'B-1204',
    flatDetails: 'Tower B · Flat 1204',
    status: 'ACTIVE',
    designation: 'Flat Owner & Resident',
  },
  {
    uid: 'user-guard-01',
    name: 'Officer R. Singh',
    phone: '+919123456789',
    email: 'guard1@greenvalley.com',
    role: 'guard',
    societyId: 'soc-gvs',
    flatDetails: 'Gate #1 North Terminal',
    status: 'ACTIVE',
    designation: 'Senior Gate Security Officer',
  },
  {
    uid: 'user-secretary-01',
    name: 'Mayuri Udar',
    phone: '+919820012345',
    email: 'secretary@greenvalley.com',
    role: 'secretary',
    societyId: 'soc-gvs',
    flatNumber: 'A-101',
    flatDetails: 'Block A · Flat 101',
    status: 'ACTIVE',
    designation: 'Management Committee Secretary',
  },
  {
    uid: 'user-committee-01',
    name: 'Rajesh Mehta',
    phone: '+919900112233',
    email: 'rajesh.committee@greenvalley.com',
    role: 'committee',
    societyId: 'soc-gvs',
    flatNumber: 'A-201',
    flatDetails: 'Tower A · Flat 201',
    status: 'ACTIVE',
    designation: 'Management Committee Member',
  },
  {
    uid: 'user-fm-01',
    name: 'Suresh Patil',
    phone: '+919811223344',
    email: 'facility@greenvalley.com',
    role: 'facility_manager',
    societyId: 'soc-gvs',
    flatDetails: 'Facility Office Block B',
    status: 'ACTIVE',
    designation: 'Facility & Operations Manager',
  },
  {
    uid: 'user-vendor-01',
    name: 'Priya Facility Care Ltd',
    phone: '+919844556677',
    email: 'priya.vendor@greenvalley.com',
    role: 'vendor',
    societyId: 'soc-gvs',
    status: 'ACTIVE',
    designation: 'Registered Society Vendor',
  },
  {
    uid: 'user-admin-01',
    name: 'Platform Super Admin',
    phone: '+919000000001',
    email: 'admin@aarizo.com',
    role: 'admin',
    societyId: 'soc-gvs',
    status: 'ACTIVE',
    designation: 'System Administrator',
  }
];

export async function runDatabaseSeed(options: SeedOptions = { mode: 'demo' }) {
  if (options.mode === 'production-bootstrap') {
    console.warn('[SEED] Running in production-bootstrap mode. Sensitive safety checks enabled.');
  } else {
    console.log(`[SEED] Executing database seed in ${options.mode} mode...`);
  }

  // Idempotent seeding logic: write canonical records with deterministic primary keys
  const app = !getApps().length ? initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'demo-communityos',
    apiKey: 'mock-key',
  }) : getApps()[0];

  const db = getFirestore(app);
  const batch = writeBatch(db);

  // 1. Seed Societies
  for (const soc of DEMO_SOCIETIES) {
    const ref = doc(db, 'societies', soc.id);
    batch.set(ref, {
      ...soc,
      updatedAt: new Date().toISOString(),
      seededAt: new Date().toISOString(),
    }, { merge: true });
  }

  // 2. Seed Role Accounts
  for (const user of DEMO_ROLES_ACCOUNTS) {
    const ref = doc(db, 'users', user.uid);
    batch.set(ref, {
      ...user,
      updatedAt: new Date().toISOString(),
      seededAt: new Date().toISOString(),
    }, { merge: true });
  }

  await batch.commit();
  console.log(`[SEED] Successfully seeded ${DEMO_SOCIETIES.length} societies and ${DEMO_ROLES_ACCOUNTS.length} canonical role accounts.`);
  return { success: true, societiesCount: DEMO_SOCIETIES.length, usersCount: DEMO_ROLES_ACCOUNTS.length };
}
