# Realtime Migration Plan
- **Current State:** BroadcastChannel is heavily used across mock services (parkingService.ts, childSafetyService.ts).
- **Target:** Firestore onSnapshot.
- **Plan:** Remove all BroadcastChannel instances and replace with direct Firestore query listeners scoped by societyId.
