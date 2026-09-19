# Auth Migration Audit

## 1. Inspection Findings

### src/context/AuthContext.tsx
- Heavily relies on mock logic (submitLogin, erifyOtp, simulatedOtpCode).
- Reads from and writes to localStorage (communityos_current_user, communityos_active_role).
- Exposes switchRole, which bypasses any real backend authentication.
- Must be completely rewritten to leverage onAuthStateChanged and getIdTokenResult() for custom claims.

### src/services/firebase/auth.ts
- Contains foundational setup for RecaptchaVerifier, signInWithPhoneNumber, and onAuthStateChanged.
- Contains getUserProfile logic that fetches from users/{uid}.
- *Status*: The right blocks exist, but are largely ignored by the mock AuthContext.

### src/hooks/useRBAC.ts
- Falls back to selectedRole and instantiates a simulatedUser if the real one is missing. 
- Must be updated to exclusively use the trusted currentUser provided by the authenticated context, and fail hard if unauthenticated.

### src/mockData/auth/mockUsers.ts
- Contains hardcoded UserProfile JSON objects for all 9 canonical roles.
- AuthContext injects these mock profiles directly into application state during local testing.
- Must be isolated behind a process.env.NODE_ENV === 'development' flag or removed from the production import chain completely.

### Prototype Components / Role Switchers
- Expected to exist in src/components/prototype/ (or similar) triggering switchRole().
- Must be disabled.

## 2. Migration Plan

- **Step 1:** Rewrite AuthContext.tsx to mount onAuthStateChanged.
- **Step 2:** Upon auth, fetch 	oken = await user.getIdTokenResult(). Check 	oken.claims.role.
- **Step 3:** Fetch users/{uid}. If claims and profile don't match or are missing, force UNAUTHENTICATED / CLAIMS_MISSING.
- **Step 4:** Implement Firebase Cloud Functions endpoint provisionUser inside unctions/src/ to safely mint claims.
- **Step 5:** Rewrite useRBAC to strictly read the verified context role.
- **Step 6:** Update RoleRouter.tsx to handle authentication failure states cleanly.
- **Step 7:** Write Emulator tests confirming that Cross-Society access and Role Escalation fail.
