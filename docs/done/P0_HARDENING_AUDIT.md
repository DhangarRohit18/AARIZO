# P0 Hardening Audit

## 1. Files with @ts-nocheck

**P0 Files (Require Fixes Now):**
- src/repositories/BaseRepository.ts
- src/repositories/complaints/ComplaintRepository.ts
- src/repositories/complaints/ComplaintService.ts
- src/repositories/complaints/SLAEscalationService.ts
- src/repositories/complaints/SLAPolicyRepository.ts
- src/domains/notifications/components/NotificationEngineHub.tsx
- src/domains/notifications/services/multiChannelNotificationService.ts
- src/domains/qr/components/QRGenerator.tsx
- src/domains/qr/services/QRActionHandler.ts
- src/domains/qr/services/QRService.ts

**P1/P2 Files (Targeted for later feature migration):**
- src/domains/compliance/services/assetComplianceService.ts
- src/domains/deliveries/components/ParcelRoomSecurityHub.tsx
- src/domains/deliveries/services/parcelRoomService.ts
- src/domains/deliveries/services/useParcels.ts
- src/domains/domestic-help/components/DomesticHelpManager.tsx
- src/repositories/ai/*
- src/repositories/attendance/*

## 2. Why the suppression was introduced
These files were isolated via @ts-nocheck during the previous reconciliation phase because they were throwing extensive 
oUnusedLocals, TS1484 (type import syntax), and structural Type Mismatch errors. They were scaffolded by IDE agents ahead of their respective Firebase migration phases, polluting the global build.

## 3. Does it hide a real type/integration problem?
Yes. Several UI files (e.g., NotificationEngineHub, DomesticHelpManager) rely on legacy types or missing mock types that were heavily modified or relocated. Other repository services include incomplete structural data matching.

## 4. Whether it can be removed now
P0 files can and MUST be fixed immediately. P1/P2 files (like AMC and Parcels) will retain suppression or be heavily refactored down to stub levels until their dedicated domain migration.

## 5. What needs to be fixed before removal (for P0)
- Resolve missing type imports (e.g., NotificationEvent, QREntityType).
- Correct unused variable destructurings (e.g., in BaseRepository.ts).
- Fix NotificationEvent payload shape mismatches in multiChannelNotificationService.ts.

## 6. Remaining mock authentication paths
- src/context/AuthContext.tsx: Still populates a mock currentUser and relies on localStorage to dictate roles.
- src/mockData/auth/mockUsers.ts: Hardcoded JSON users.

## 7. Remaining mock business-data paths
- Delivery/Parcels (useParcels.ts fakes load times).
- Attendance/Staff (DomesticHelpManager.tsx uses LocalStorage).
- Compliance/AMC (ssetComplianceService.ts).
- Approvals (UnifiedRequestCenter.tsx).

## 8. Remaining BroadcastChannel business-realtime paths
- src/services/realtimeService.ts actively powering cross-tab simulated sync for Parcels, AMCs, Attendance, and Visitor notifications.

## 9. Hardcoded society/user/role
- soc-gvs (Green Valley Society) is hardcoded extensively across domain hubs (e.g., ComplaintSLAEngineHub.tsx).
- es-1, guard-1 hardcoded in mockUsers.ts and AuthContext.
- Roles are often hardcoded in Dashboard switches (DashboardWrapper.tsx).

## 10. Security-sensitive client-side operations
- Approving visitor entry via localStorage mutations on client.
- Creating immutable Audit Logs natively on the client (logAuditEvent).
- Escalating SLAs triggered entirely by client-side intervals (setInterval in components).
