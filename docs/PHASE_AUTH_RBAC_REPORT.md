# CommunityOS / AARIZO — Phase 2 & 3: Real Firebase Authentication + Custom Claims Report

**Date:** 2026-09-19  
**Repository:** `DhangarRohit18/AARIZO`  
**Application ID:** `com.aarizo.app` (Single Android Mobile App)  
**Compilation Status:** PASS (Zero TypeScript / Vite errors)  
**Security Test Status:** PASS (10 of 10 Firestore security assertions verified on emulator)  
**Android Native Build:** PASS (`./gradlew assembleDebug` SUCCESSFUL in 2m 26s)  

---

## 1. Actual Authentication Flow
- **Primary Mechanism:** Firebase Phone Number Authentication (`signInWithPhoneNumber`, `RecaptchaVerifier`, `confirmationResult.confirm(otp)`).
- **Source of Truth:** Mounted directly on `onAuthStateChanged(auth, callback)` in [AuthContext.tsx](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/src/context/AuthContext.tsx).
- **Session Resolution:**
  1. On login / session restore, `firebaseUser.getIdTokenResult(true)` is retrieved with fresh claims.
  2. Tokens must include `claims.role` and `claims.societyId`. If absent, state immediately transitions to `CLAIMS_MISSING`.
  3. The user document `users/{uid}` is fetched from Cloud Firestore. If missing, state becomes `PROFILE_MISSING`.
  4. If `claims.role !== profile.role` or `claims.societyId !== profile.societyId`, state immediately transitions to `CLAIMS_MISMATCH`, preventing any privileged route from loading.
  5. Upon full cryptographic verification, `currentUser` is set and status becomes `AUTHENTICATED`.
- **Elimination of Mock/Bypass Logic:** Hardcoded OTP codes (`4092`), simulated OTP modals, React-only role states, and `switchRole` methods have been completely removed from application runtime paths.

---

## 2. Actual Role Flow
- **Role Derivation:** Derived strictly from the verified Firebase Auth user and unforgeable Custom Claims JWT.
- **Hook Implementation:** [useRBAC.ts](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/src/hooks/useRBAC.ts) checks `status === 'AUTHENTICATED'` and `currentUser`. If unauthenticated, all permission checks (`can`, `canAny`, `canAll`) fail closed (`false`).
- **RoleRouter / AppRoutes:** [src/routes/index.tsx](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/src/routes/index.tsx) evaluates `currentUser.role` to navigate to the designated role shell. No user-selectable role overrides exist.
- **Route Protection:** [ProtectedRoute.tsx](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/src/routes/ProtectedRoute.tsx) rejects any request where `activeRole` is not explicitly permitted in `allowedRoles` or lacks the required action permission in the RBAC matrix.

---

## 3. Custom Claims Implementation
- **Cloud Function:** `provisionUser` implemented in [functions/src/index.ts](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/functions/src/index.ts) using modular `firebase-functions/v2` and `firebase-admin`.
- **Claims Minted:**
  ```json
  {
    "role": "resident",
    "societyId": "soc-gvs"
  }
  ```
- **Privilege Enforcement:**
  - Callers must be authenticated (`request.auth`).
  - Only `admin` or `secretary` of the matching `societyId` can provision claims.
  - Secretaries cannot promote users to `admin`.
  - Target role must belong to the approved 7 canonical roles.
  - Automatically updates `users/{targetUid}` Firestore profile in the same transaction to guarantee consistency.
- **Frontend Invocation Wrapper:** [src/services/firebase/functions.ts](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/src/services/firebase/functions.ts) exposes `provisionUserClaims`.

---

## 4. User Profile Implementation
- **Path:** `users/{uid}` in Cloud Firestore.
- **Schema:**
  - `uid`: String matching Firebase Authentication UID.
  - `name`: String.
  - `phone`: String (E.164 format).
  - `email`: Optional string.
  - `role`: Canonical role string.
  - `societyId`: Society identifier for complete multitenant isolation.
  - `flatNumber` / `unitId` / `flatDetails`: Specific unit identifiers.
  - `status`: `'ACTIVE' | 'INACTIVE' | 'PENDING'`.
  - `createdAt`, `updatedAt`: Firestore timestamps.
  - `provisionedBy`: UID of the administrator or secretary who granted the role.

---

## 5. Firestore Security Rules Changes
Updated and hardened in [firestore.rules](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/firestore.rules):
- Evaluates `request.auth.token.role` and `request.auth.token.societyId`.
- Strictly enforces `hasValidClaims()`.
- Prevents cross-society reads on all collections (`users`, `complaints`, `parcels`, `attendance`, `moveRequests`, `renovations`, `amcContracts`, `qrTokens`).
- Makes `role`, `societyId`, `permissions`, and `uid` immutable on user document updates (`diff().affectedKeys().hasAny(['role', 'societyId', ...]) == false`).
- Prevents residents from forging or modifying complaint SLA timers or priorities.
- Completely denies client-side writes to `qrTokens`.

---

## 6. Security Emulator Test Results
Executed on the local Firestore Emulator via Jest (`tests/security.test.ts`):
```text
PASS tests/security.test.ts
  CommunityOS Security Rules Verification (10 Critical Assertions)
    √ 1. Resident reading own profile → allowed (2651 ms)
    √ 2. Resident reading another society profile → denied (439 ms)
    √ 3. Resident changing own role → denied (620 ms)
    √ 4. Resident changing societyId → denied (359 ms)
    √ 5. Guard performing secretary-only operation → denied (190 ms)
    √ 6. Secretary authorized society operation → allowed (187 ms)
    √ 7. Cross-society complaint read → denied (296 ms)
    √ 8. Cross-society parcel read → denied (329 ms)
    √ 9. Unauthenticated Firestore access → denied (168 ms)
    √ 10. Missing custom claims → denied for protected operations (265 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        19.136 s
```

---

## 7. localStorage Authentication References Removed
- Removed `communityos_current_user`, `communityos_active_role`, and all mock user session caching from [AuthContext.tsx](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/src/context/AuthContext.tsx).
- Retained only allowed UI preference state: `communityos_onboarding_completed` and theme memory.
- Completely removed role switcher select elements and `switchRole` callbacks from:
  - `SecurityLayout.tsx`
  - `SocietyAdminLayout.tsx`
  - `SuperAdminLayout.tsx`
  - `GuardProfile.tsx`
  - `SecretaryProfile.tsx`
  - `GuardShell.tsx`
  - `SecretaryShell.tsx`
  - `GuardPlaceholder.tsx`
  - `UnauthorizedPage.tsx`
  - `MoveRenovationHub.tsx`
  - `QRParkingHub.tsx`
  - `SafetyCommandHub.tsx`
  - `SocietyServicesHub.tsx`
  - `SocietyOperationsBoard.tsx`
  - `AssetComplianceHub.tsx`

---

## 8. Remaining Mock Authentication References
- [src/mockData/auth/mockUsers.ts](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/src/mockData/auth/mockUsers.ts): Retained strictly for unit test seeds and development mocks. All profiles now adhere to the 7 canonical roles with explicit `societyId: 'soc-gvs'`. No runtime application code references `MOCK_USERS` for authentication decisions.

---

## 9. Role Reconciliation Result
- Authoritative role model established in [docs/ROLE_RECONCILIATION.md](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/docs/ROLE_RECONCILIATION.md).
- **Exact 7 canonical roles:**
  `resident` | `guard` | `secretary` | `committee` | `facility_manager` | `vendor` | `admin`.
- `staff` mapped into `facility_manager` (for internal management) and `vendor` (for field execution).
- `contractor` mapped into `vendor`.

---

## 10. Android Build Result
- Synchronized with Capacitor: `npx cap sync android` (copied web assets, updated 5 Capacitor plugins).
- Built Android APK via Gradle wrapper:
  ```bash
  $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
  ./gradlew assembleDebug
  ```
  **Result:** `BUILD SUCCESSFUL in 2m 26s` (244 actionable tasks, `app-debug.apk` produced).
- **Package Alignment:** Harmonized application ID across `capacitor.config.ts`, `google-services.json`, and `android/app/build.gradle` to `com.aarizo.app`.

---

## 11. Files Changed
1. `src/domains/auth/types.ts`
2. `src/context/AuthContext.tsx`
3. `src/hooks/useRBAC.ts`
4. `src/routes/index.tsx`
5. `src/routes/ProtectedRoute.tsx`
6. `src/components/auth/login/LoginScreen.tsx`
7. `src/components/auth/onboarding/OnboardingFlow.tsx`
8. `src/components/guard/GuardPlaceholder.tsx`
9. `src/components/guard/GuardShell.tsx`
10. `src/components/guard/profile/GuardProfile.tsx`
11. `src/components/secretary/SecretaryShell.tsx`
12. `src/components/secretary/profile/SecretaryProfile.tsx`
13. `src/components/layouts/SecurityLayout.tsx`
14. `src/components/layouts/SocietyAdminLayout.tsx`
15. `src/components/layouts/SuperAdminLayout.tsx`
16. `src/pages/unauthorized/UnauthorizedPage.tsx`
17. `src/domains/move-management/components/MoveRenovationHub.tsx`
18. `src/domains/parking/components/QRParkingHub.tsx`
19. `src/domains/safety/components/SafetyCommandHub.tsx`
20. `src/domains/services/components/SocietyServicesHub.tsx`
21. `src/domains/utilities/components/SocietyOperationsBoard.tsx`
22. `src/domains/compliance/components/AssetComplianceHub.tsx`
23. `src/mockData/auth/mockUsers.ts`
24. `functions/src/index.ts`
25. `functions/package.json`
26. `functions/tsconfig.json`
27. `src/services/firebase/functions.ts`
28. `firestore.rules`
29. `firebase.json`
30. `tests/security.test.ts`
31. `tsconfig.test.json`
32. `jest.config.cjs`
33. `package.json`
34. `android/app/build.gradle`
35. `docs/ROLE_RECONCILIATION.md`
36. `docs/PHASE_AUTH_RBAC_REPORT.md`

---

## 12. Remaining Blockers
- **None for Phase 2/3.** Real Firebase Authentication, unforgeable Custom Claims, Firestore security rules enforcement, role reconciliation, and the Android native build are all validated and passing.
