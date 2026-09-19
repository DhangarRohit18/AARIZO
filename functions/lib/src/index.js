"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.provisionUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const VALID_ROLES = new Set([
    'resident',
    'guard',
    'secretary',
    'committee',
    'facility_manager',
    'vendor',
    'admin'
]);
exports.provisionUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const callerUid = context.auth.uid;
    const callerClaims = context.auth.token;
    const { targetUid, role, societyId } = data;
    if (!targetUid || !role || !societyId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing targetUid, role, or societyId.');
    }
    if (!VALID_ROLES.has(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid role requested.');
    }
    // Validate that the target user actually exists in Auth
    try {
        await admin.auth().getUser(targetUid);
    }
    catch (error) {
        throw new functions.https.HttpsError('not-found', 'Target Firebase Auth user does not exist.');
    }
    const isSuperAdmin = callerClaims.role === 'admin';
    const isSecretary = callerClaims.role === 'secretary' && callerClaims.societyId === societyId;
    if (!isSuperAdmin && !isSecretary) {
        throw new functions.https.HttpsError('permission-denied', 'Only Admin or Secretary can provision users.');
    }
    if (isSecretary && role === 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Secretary cannot promote to Admin.');
    }
    try {
        await admin.auth().setCustomUserClaims(targetUid, { role, societyId });
        const db = admin.firestore();
        await db.collection('users').doc(targetUid).set({
            uid: targetUid,
            role: role,
            societyId: societyId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            provisionedBy: callerUid
        }, { merge: true });
        return { success: true, message: `Successfully provisioned user ${targetUid} as ${role}.` };
    }
    catch (error) {
        console.error('Error provisioning user:', error);
        throw new functions.https.HttpsError('internal', 'Failed to provision user.');
    }
});
//# sourceMappingURL=index.js.map