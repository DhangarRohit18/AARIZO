# PostgreSQL Database Migration Guide for AARIZO CommunityOS

This directory provides the complete PostgreSQL database migration engine for the AARIZO project, transitioning from Firestore to a multi-tenant PostgreSQL architecture.

---

## 1. File Structure

- [01_schema.sql](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/scripts/postgres/01_schema.sql): Complete DDL containing all 25+ domain tables, custom enums, primary/foreign keys, indexes, and automated `updated_at` triggers.
- [02_rls_policies.sql](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/scripts/postgres/02_rls_policies.sql): Row Level Security (RLS) policies enforcing multi-tenant isolation (`society_id`) and role-based permissions (`admin`, `secretary`, `guard`, `resident`, etc.).
- [03_seed.sql](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/scripts/postgres/03_seed.sql): Production bootstrap and demo seed data matching all 7 canonical roles and sample societies (`soc-gvs`, `soc-azh`).
- [migrate.ts](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/scripts/postgres/migrate.ts): Node/TypeScript automated migration execution script.
- [docker-compose.yml](file:///c:/Users/user/OneDrive/Desktop/Competition/AAZIRA/docker-compose.yml): One-command PostgreSQL 16 + pgweb UI setup.

---

## 2. Quickstart with Docker

To boot the PostgreSQL instance with automatic schema initialization and seeding:

```bash
docker compose up -d
```

- **PostgreSQL Connection**: `postgres://aarizo_admin:aarizo_secure_password_2026@localhost:5432/aarizo_community`
- **pgweb Admin UI**: [http://localhost:8081](http://localhost:8081)

---

## 3. Manual Execution via psql

If using an existing PostgreSQL server:

```bash
psql -U aarizo_admin -d aarizo_community -f scripts/postgres/01_schema.sql
psql -U aarizo_admin -d aarizo_community -f scripts/postgres/02_rls_policies.sql
psql -U aarizo_admin -d aarizo_community -f scripts/postgres/03_seed.sql
```

---

## 4. Entity Mapping Reference (Firestore → PostgreSQL)

| Firestore Collection | PostgreSQL Table | Primary Key | Scoping Key |
|---|---|---|---|
| `societies` | `societies` | `id` | `id` |
| `towers` | `towers` | `id` | `society_id` |
| `flats` | `flats` | `id` | `society_id` |
| `users` | `users` | `id` (auth uid) | `society_id` |
| `residents` | `residents` | `id` | `society_id` |
| `familyMembers` | `family_members` | `id` | `society_id` |
| `vehicles` | `vehicles` | `id` | `society_id` |
| `staff` | `staff` | `id` | `society_id` |
| `domesticWorkers` | `domestic_workers` | `id` | `society_id` |
| `vendors` | `vendors` | `id` | `society_id` |
| `visitorPasses` | `visitor_passes` | `id` | `society_id` |
| `parcels` | `parcels` | `id` | `society_id` |
| `childSafety` | `child_safety` | `id` | `society_id` |
| `billingCycles` | `billing_cycles` | `id` | `society_id` |
| `billingInvoices` | `billing_invoices` | `id` | `society_id` |
| `billingTransactions`| `billing_transactions`| `id` | `society_id` |
| `amenities` | `amenities` | `id` | `society_id` |
| `amenityBookings` | `amenity_bookings` | `id` | `society_id` |
| `maintenanceTickets`| `maintenance_tickets`| `id` | `society_id` |
| `complaints` | `complaints` | `id` | `society_id` |
| `housekeepingTasks` | `housekeeping_tasks` | `id` | `society_id` |
| `parkingSlots` | `parking_slots` | `id` | `society_id` |
| `parkingRequests` | `parking_requests` | `id` | `society_id` |
| `guestRooms` | `guest_rooms` | `id` | `society_id` |
| `guestReservations` | `guest_reservations`| `id` | `society_id` |
| `moveRequests` | `move_requests` | `id` | `society_id` |
| `renovations` | `renovations` | `id` | `society_id` |
| `amcContracts` | `amc_contracts` | `id` | `society_id` |
| `emergencyIncidents`| `emergency_incidents`| `id` | `society_id` |
| `notifications` | `notifications` | `id` | `society_id` |
| `auditLogs` | `audit_logs` | `id` | `society_id` |
