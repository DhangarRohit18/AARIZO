# AARIZO 2.0: UNIVERSAL PROVISIONING GUIDE

## 1. Overview
The Universal Provisioning Service (`server/src/provisioning.ts`) provides transactional creation of all 7 roles with secure credential generation, duplicate validation, and audit recording.

---

## 2. Workflows

### 2.1 Society Creation & Secretary Auto-Provisioning
* **Initiator:** Platform Admin (`POST /api/admin/provision-society`)
* **Payload:**
  ```json
  {
    "societyName": "Green Valley Heights",
    "address": "Baner Road",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411045",
    "towersCount": 2,
    "flatsCount": 20,
    "secretaryName": "Rohit Dhangar",
    "secretaryEmail": "secretary@greenvalley.com",
    "secretaryPhone": "9876543210"
  }
  ```
* **Execution:**
  1. Validates creator permissions.
  2. Ensures email and phone are unique.
  3. Atomically creates `Society`, initial `Tower`, default `Flat`, primary `User`, `SocietyMembership`, and `Resident` profile.
  4. Generates a 12-character high-entropy temporary password.
  5. Inserts `SOCIETY_PROVISIONED` into `outbox_events` and records `audit_logs`.

---

### 2.2 Secretary User Provisioning
* **Initiator:** Society Secretary (`POST /api/secretary/provision-user`)
* **Supported Roles:** `resident`, `guard`, `committee`, `facility_manager`, `vendor`
* **Execution:**
  1. Verifies secretary context (`societyId`).
  2. Validates user email & phone uniqueness.
  3. Creates `User` and `SocietyMembership`.
  4. Creates role-specific record:
     - `resident` / `committee`: Links to flat.
     - `guard` / `facility_manager`: Creates `Staff` entry.
     - `vendor`: Creates `Vendor` entry.
  5. Emits `USER_PROVISIONED` outbox event.
