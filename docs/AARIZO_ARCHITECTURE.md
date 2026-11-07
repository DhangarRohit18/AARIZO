# AARIZO 2.0: SYSTEM ARCHITECTURE & ENGINEERING SPECIFICATION

## 1. High-Level System Architecture

```mermaid
graph TD
    Client["Clients: Web (React 19) + Android (Capacitor 8)"] -->|HTTPS + Bearer JWT| Gateway["Express.js API Gateway"]
    Gateway -->|Token Verification| FBAdmin["Firebase Admin SDK"]
    Gateway -->|Rate Limiter & RBAC| SecurityEngine["Auth & Tenant Security Engine"]
    SecurityEngine -->|Transactional Queries| Prisma["Prisma ORM (v6.19.3)"]
    Prisma -->|Primary Source of Truth| Postgres["PostgreSQL Managed Database"]
    
    subgraph "Durable Real-Time Pipeline"
        Prisma -->|Atomic Mutation + Write| Outbox["outbox_events Table"]
        Poller["Background Outbox Worker"] -->|Polls PENDING Events| Outbox
        Poller -->|Stream Dispatch| SSERouter["SSE Real-time Hub"]
        SSERouter -->|Tenant-Filtered Events| Client
    end
```

## 2. Core Subsystems

### 2.1 Single Authoritative Source of Truth
* **PostgreSQL:** Sole store for users, societies, flats, towers, payments, invoices, work orders, gate logs, and audit trails.
* **Firebase Auth:** Manages authentication identity, OTP delivery, and tokens.
* **Firebase Storage:** Houses encrypted documents, KYC proofs, and profile photos.
* **Firebase Cloud Messaging:** Handles mobile push delivery for background emergency notifications.

### 2.2 Seven User Roles
1. **Admin:** Platform governance & society provisioning.
2. **Secretary:** Society governance, user onboarding, flat assignment.
3. **Committee:** Financial oversight, compliance review, approvals.
4. **Facility Manager:** Work orders, staff shifts, housekeeping, AMC contracts.
5. **Resident:** QR gate pass creation, maintenance billing, SOS alerts, amenity booking.
6. **Guard:** Gate terminal scanning, visitor verification, child exit checks.
7. **Vendor:** KYC verification, job completion uploads, invoice settlement.

