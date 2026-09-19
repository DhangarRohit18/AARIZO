const admin = require('firebase-admin');
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({ projectId: 'communityos-local' });
const db = admin.firestore();

async function seed() {
  console.log('Seeding emulator...');
  const socRef = db.collection('societies').doc('soc-gvs');
  await socRef.set({ name: 'Green Valley Society', id: 'soc-gvs' });

  const complaintRef = db.collection('complaints').doc('CMP-801');
  await complaintRef.set({
    societyId: 'soc-gvs',
    residentId: 'res-1',
    residentName: 'Vikram Joshi',
    flatCode: 'B-1204',
    category: 'PLUMBING',
    title: 'Leaking Pipe',
    description: 'Leaking pipe in master bathroom',
    location: 'B-1204',
    urgency: 'HIGH',
    status: 'OPEN',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Done seeding.');
}
seed().catch(console.error);

