# Role Reconciliation

## Approved Canonical Roles (7)
1. resident
2. guard
3. secretary
4. committee
5. facility_manager
6. vendor
7. admin

## Deprecated Roles (2)

### 1. staff
- **Where used:** Previously mocked in mockUsers.ts and DomesticWorkerDashboard.tsx.
- **Permissions:** Limited read/write to attendance.
- **UI usage:** StaffHousekeepingTaskPage.tsx.
- **Database usage:** users/{uid} with ole: 'staff'.
- **Is legacy:** Yes.
- **Canonical replacement:** Merged into endor (for service providers) or treated as entities within the ttendance/staff collections rather than having full application login access. External staff don't log into the resident app; they are managed *by* the facility manager.

### 2. contractor
- **Where used:** Previously mocked in mockUsers.ts.
- **Permissions:** Read renovation tasks.
- **UI usage:** None explicit (usually grouped with vendors).
- **Database usage:** users/{uid} with ole: 'contractor'.
- **Is legacy:** Yes.
- **Canonical replacement:** endor. Contractors are a subclass of vendors in the system.
