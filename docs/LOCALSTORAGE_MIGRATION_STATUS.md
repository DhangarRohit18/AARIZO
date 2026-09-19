# LocalStorage Audit & Migration Status

## Allowed Usages (Permanent)
- **Theme Preferences:** Dark mode/light mode.
- **Last Selected Tab:** UI contextual memory.

## Unauthorized Usages (Pending Migration)
- **AuthContext:** Uses LocalStorage to persist mock session state and active roles (currentUser). Must migrate to irebase/auth.
- **Approvals (UnifiedRequestCenter):** Caches fake approval states to simulate state changes. Must migrate to Firestore updates.
- **Attendance Check-ins:** Simulated gate passes stored locally. Must migrate to Firestore.
- **Parcels:** Storing scanned QR payloads in LocalStorage. Must migrate to Cloud Functions processing.
