# Firebase Security Architecture

## 1. Authentication Identity
We enforce Firebase Phone Authentication (and fallback Email/Password). The application strictly avoids client-side auth state fabrication. onAuthStateChanged is the absolute source of truth.

## 2. Authorization (Custom Claims)
Authorization relies on unforgeable Custom Claims encoded in the Firebase ID token.
- ole: Canonical lowercase role string (e.g., esident, secretary).
- societyId: The unique tenant string the user belongs to.

The frontend useRBAC() and routing algorithms read these Custom Claims dynamically upon token fetch. The backend irestore.rules verifies them instantly per request.

## 3. Provisioning
Custom Claims are set via unctions/src/index.ts provisionUser() endpoint.
- **Admin**: Has global provisioning rights.
- **Secretary**: Can only provision users matching their own societyId. Cannot grant Admin roles.
- **Others**: Cannot provision or modify roles.

## 4. Multi-Tenant Isolation
Firestore Rules explicitly assert equest.auth.token.societyId == resource.data.societyId.
A Guard in soc-a cannot read the visitor log of soc-b.

## 5. Offline Security
While Firebase natively caches auth sessions for offline mode, critical modules (QR validation, provisioning, access overrides) are strictly server-bound.
