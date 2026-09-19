# Database Seeding Architecture & Guide

## Overview
AARIZO / CommunityOS provides a deterministic, idempotent database seeding system to populate realistic multi-tenant societies, canonical role users, assets, operations, visitors, and billing cycles.

---

## Seed Environments & Protection

1. **`demo` mode**: Targets local emulators or demo projects.
2. **`test` mode**: Used in CI/CD and security test suites.
3. **`production-bootstrap`**: Explicit mode requiring verified credentials and confirmation; demo test identities are **never** injected into production environments.

---

## Seed Data Composition

### 1. Multi-Tenant Societies
- **Green Valley Residency (`soc-gvs`)**: 3 Towers, 120 Flats, 6 Amenities.
- **AARIZO Heights (`soc-azh`)**: 4 Towers, 160 Flats, 8 Amenities.

### 2. Canonical Demo Role Accounts
| Role | UID | Name | Phone | Society |
|---|---|---|---|---|
| `resident` | `user-resident-01` | Sarvesh Kulkarni | +919876543210 | `soc-gvs` |
| `guard` | `user-guard-01` | Officer R. Singh | +919123456789 | `soc-gvs` |
| `secretary` | `user-secretary-01` | Mayuri Udar | +919820012345 | `soc-gvs` |
| `committee` | `user-committee-01` | Rajesh Mehta | +919900112233 | `soc-gvs` |
| `facility_manager` | `user-fm-01` | Suresh Patil | +919811223344 | `soc-gvs` |
| `vendor` | `user-vendor-01` | Priya Facility Care | +919844556677 | `soc-gvs` |
| `admin` | `user-admin-01` | Platform Super Admin | +919000000001 | `soc-gvs` |

---

## Idempotency
All seed documents use deterministic document IDs (`soc-gvs`, `user-resident-01`, etc.) and Firestore `{ merge: true }` writes, ensuring running the seed repeatedly never duplicates or corrupts existing records.
