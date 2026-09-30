jest.setTimeout(30000);
// @ts-nocheck
import { describe, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment | null = null;
let emulatorAvailable = false;

beforeAll(async () => {
  try {
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-communityos',
      firestore: {
        rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 8088,
      },
    });
    emulatorAvailable = true;
  } catch (err) {
    console.warn('Firestore emulator not running on 127.0.0.1:8088. Skipping security rules unit tests.');
    emulatorAvailable = false;
  }
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv && emulatorAvailable) {
    try {
      await testEnv.clearFirestore();
    } catch {}
  }
});

describe('CommunityOS Security Rules Verification (10 Critical Assertions)', () => {
  // Setup helper
  const seedDoc = async (col: string, id: string, data: any) => {
    if (!testEnv || !emulatorAvailable) return;
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const adminDb = adminContext.firestore();
      await adminDb.collection(col).doc(id).set(data);
    });
  };

  // 1. Resident reading own profile → allowed
  it('1. Resident reading own profile → allowed', async () => {
    if (!emulatorAvailable || !testEnv) return;
    await seedDoc('users', 'res-1', {
      uid: 'res-1',
      name: 'Resident One',
      role: 'resident',
      societyId: 'soc-a'
    });

    const db = testEnv.authenticatedContext('res-1', {
      role: 'resident',
      societyId: 'soc-a'
    }).firestore();

    await assertSucceeds(db.collection('users').doc('res-1').get());
  });

  // 2. Resident reading another society profile → denied
  it('2. Resident reading another society profile → denied', async () => {
    if (!emulatorAvailable || !testEnv) return;
    await seedDoc('users', 'res-other', {
      uid: 'res-other',
      name: 'Resident Other',
      role: 'resident',
      societyId: 'soc-b'
    });

    const db = testEnv.authenticatedContext('res-1', {
      role: 'resident',
      societyId: 'soc-a'
    }).firestore();

    await assertFails(db.collection('users').doc('res-other').get());
  });

  // 3. Resident changing own role → denied
  it('3. Resident changing own role → denied', async () => {
    if (!emulatorAvailable || !testEnv) return;
    await seedDoc('users', 'res-1', {
      uid: 'res-1',
      name: 'Resident One',
      role: 'resident',
      societyId: 'soc-a'
    });

    const db = testEnv.authenticatedContext('res-1', {
      role: 'resident',
      societyId: 'soc-a'
    }).firestore();

    await assertFails(db.collection('users').doc('res-1').update({
      role: 'admin'
    }));
  });

  // 4. Resident changing societyId → denied
  it('4. Resident changing societyId → denied', async () => {
    if (!emulatorAvailable || !testEnv) return;
    await seedDoc('users', 'res-1', {
      uid: 'res-1',
      name: 'Resident One',
      role: 'resident',
      societyId: 'soc-a'
    });

    const db = testEnv.authenticatedContext('res-1', {
      role: 'resident',
      societyId: 'soc-a'
    }).firestore();

    await assertFails(db.collection('users').doc('res-1').update({
      societyId: 'soc-b'
    }));
  });

  // 5. Guard performing secretary-only operation (AMC write) → denied
  it('5. Guard performing secretary-only operation → denied', async () => {
    if (!emulatorAvailable || !testEnv) return;
    const db = testEnv.authenticatedContext('guard-1', {
      role: 'guard',
      societyId: 'soc-a'
    }).firestore();

    await assertFails(db.collection('amcContracts').doc('amc-1').set({
      societyId: 'soc-a',
      title: 'Elevator Maintenance',
      status: 'ACTIVE'
    }));
  });

  // 6. Secretary authorized society operation → allowed
  it('6. Secretary authorized society operation → allowed', async () => {
    if (!emulatorAvailable || !testEnv) return;
    const db = testEnv.authenticatedContext('sec-1', {
      role: 'secretary',
      societyId: 'soc-a'
    }).firestore();

    await assertSucceeds(db.collection('amcContracts').doc('amc-1').set({
      societyId: 'soc-a',
      title: 'Elevator AMC Agreement',
      status: 'ACTIVE'
    }));
  });

  // 7. Cross-society complaint read → denied
  it('7. Cross-society complaint read → denied', async () => {
    if (!emulatorAvailable || !testEnv) return;
    await seedDoc('complaints', 'cmp-soc-b', {
      societyId: 'soc-b',
      residentId: 'res-b1',
      title: 'Water leakage',
      status: 'OPEN'
    });

    const db = testEnv.authenticatedContext('res-1', {
      role: 'resident',
      societyId: 'soc-a'
    }).firestore();

    await assertFails(db.collection('complaints').doc('cmp-soc-b').get());
  });

  // 8. Cross-society parcel read → denied
  it('8. Cross-society parcel read → denied', async () => {
    if (!emulatorAvailable || !testEnv) return;
    await seedDoc('parcels', 'parcel-soc-b', {
      societyId: 'soc-b',
      residentId: 'res-b1',
      trackingNumber: 'TRK-999',
      status: 'RECEIVED'
    });

    const db = testEnv.authenticatedContext('guard-1', {
      role: 'guard',
      societyId: 'soc-a'
    }).firestore();

    await assertFails(db.collection('parcels').doc('parcel-soc-b').get());
  });

  // 9. Unauthenticated Firestore access → denied
  it('9. Unauthenticated Firestore access → denied', async () => {
    if (!emulatorAvailable || !testEnv) return;
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthDb.collection('users').doc('res-1').get());
    await assertFails(unauthDb.collection('complaints').doc('cmp-1').get());
  });

  // 10. Missing custom claims → denied for protected operations
  it('10. Missing custom claims → denied for protected operations', async () => {
    if (!emulatorAvailable || !testEnv) return;
    // Authenticated user with NO custom claims (role & societyId undefined)
    const db = testEnv.authenticatedContext('rogue-user').firestore();
    await assertFails(db.collection('complaints').doc('cmp-1').get());
    await assertFails(db.collection('amcContracts').doc('amc-1').set({
      societyId: 'soc-a',
      title: 'Unauthorized AMC'
    }));
  });
});


