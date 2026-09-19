"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provisionUser = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)();
const VALID_ROLES = new Set([
    'resident',
    'guard',
    'secretary',
    'committee',
    'facility_manager',
    'vendor',
    'admin'
]);
exports.provisionUser = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const callerUid = request.auth.uid;
    const callerClaims = request.auth.token;
    const { targetUid, role, societyId } = request.data;
    if (!targetUid || !role || !societyId) {
        throw new https_1.HttpsError('invalid-argument', 'Missing targetUid, role, or societyId.');
    }
    if (!VALID_ROLES.has(role)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid role requested: ${role}`);
    }
    const authAdmin = (0, auth_1.getAuth)();
    const db = (0, firestore_1.getFirestore)();
    // Validate that the target user actually exists in Auth
    try {
        await authAdmin.getUser(targetUid);
    }
    catch (error) {
        throw new https_1.HttpsError('not-found', 'Target Firebase Auth user does not exist.');
    }
    const isSuperAdmin = callerClaims.role === 'admin';
    const isSecretary = callerClaims.role === 'secretary' && callerClaims.societyId === societyId;
    if (!isSuperAdmin && !isSecretary) {
        throw new https_1.HttpsError('permission-denied', 'Only Admin or Secretary of the matching society can provision users.');
    }
    if (isSecretary && role === 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Secretary cannot promote a user to Admin.');
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
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            provisionedBy: callerUid
        }, { merge: true });
        return {
            success: true,
            message: `Successfully provisioned user ${targetUid} with role ${role} in society ${societyId}.`
        };
    }
    catch (error) {
        console.error('Error provisioning user:', error);
        throw new https_1.HttpsError('internal', 'Failed to provision user custom claims.');
    }
});
//# sourceMappingURL=index.js.map