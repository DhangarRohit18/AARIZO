jest.setTimeout(30000);
// @ts-nocheck
import { describe, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-communityos',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8088,
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

describe('CommunityOS Security Rules Verification (10 Critical Assertions)', () => {
  // Setup helper
  const seedDoc = async (col: string, id: string, data: any) => {
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const adminDb = adminContext.firestore();
      await adminDb.collection(col).doc(id).set(data);
    });
  };

  // 1. Resident reading own profile â†’ allowed
  it('1. Resident reading own profile â†’ allowed', async () => {
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

  // 2. Resident reading another society profile â†’ denied
  it('2. Resident reading another society profile â†’ denied', async () => {
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

  // 3. Resident changing own role â†’ denied
  it('3. Resident changing own role â†’ denied', async () => {
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

  // 4. Resident changing societyId â†’ denied
  it('4. Resident changing societyId â†’ denied', async () => {
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

  // 5. Guard performing secretary-only operation (AMC write) â†’ denied
  it('5. Guard performing secretary-only operation â†’ denied', async () => {
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

  // 6. Secretary authorized society operation â†’ allowed
  it('6. Secretary authorized society operation â†’ allowed', async () => {
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

  // 7. Cross-society complaint read â†’ denied
  it('7. Cross-society complaint read â†’ denied', async () => {
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

  // 8. Cross-society parcel read â†’ denied
  it('8. Cross-society parcel read â†’ denied', async () => {
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

  // 9. Unauthenticated Firestore access â†’ denied
  it('9. Unauthenticated Firestore access â†’ denied', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthDb.collection('users').doc('res-1').get());
    await assertFails(unauthDb.collection('complaints').doc('cmp-1').get());
  });

  // 10. Missing custom claims â†’ denied for protected operations
  it('10. Missing custom claims â†’ denied for protected operations', async () => {
    // Authenticated user with NO custom claims (role & societyId undefined)
    const db = testEnv.authenticatedContext('rogue-user').firestore();
    await assertFails(db.collection('complaints').doc('cmp-1').get());
    await assertFails(db.collection('amcContracts').doc('amc-1').set({
      societyId: 'soc-a',
      title: 'Unauthorized AMC'
    }));
  });
});


