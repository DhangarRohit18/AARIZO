import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();

const VALID_ROLES = new Set([
  'resident',
  'guard',
  'secretary',
  'committee',
  'facility_manager',
  'vendor',
  'admin'
]);

interface ProvisionUserRequest {
  targetUid: string;
  role: string;
  societyId: string;
}

export const provisionUser = onCall<ProvisionUserRequest>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const callerUid = request.auth.uid;
  const callerClaims = request.auth.token;

  const { targetUid, role, societyId } = request.data;
  if (!targetUid || !role || !societyId) {
    throw new HttpsError('invalid-argument', 'Missing targetUid, role, or societyId.');
  }

  if (!VALID_ROLES.has(role)) {
    throw new HttpsError('invalid-argument', `Invalid role requested: ${role}`);
  }

  const authAdmin = getAuth();
  const db = getFirestore();

  // Validate that the target user actually exists in Auth
  try {
    await authAdmin.getUser(targetUid);
  } catch (error) {
    throw new HttpsError('not-found', 'Target Firebase Auth user does not exist.');
  }

  const isSuperAdmin = callerClaims.role === 'admin';
  const isSecretary = callerClaims.role === 'secretary' && callerClaims.societyId === societyId;

  if (!isSuperAdmin && !isSecretary) {
    throw new HttpsError('permission-denied', 'Only Admin or Secretary of the matching society can provision users.');
  }

  if (isSecretary && role === 'admin') {
    throw new HttpsError('permission-denied', 'Secretary cannot promote a user to Admin.');
  }

  try {
    // 1. Issue cryptographically signed custom claims
    await authAdmin.setCustomUserClaims(targetUid, { role, societyId });

    // 2. Keep users/{uid} document strictly synchronized
    await db.collection('users').doc(targetUid).set({
      uid: targetUid,
      role: role,
      societyId: societyId,
      status: 'ACTIVE',
      updatedAt: FieldValue.serverTimestamp(),
      provisionedBy: callerUid
    }, { merge: true });

    return { 
      success: true, 
      message: `Successfully provisioned user ${targetUid} with role ${role} in society ${societyId}.` 
    };
  } catch (error) {
    console.error('Error provisioning user:', error);
    throw new HttpsError('internal', 'Failed to provision user custom claims.');
  }
});
