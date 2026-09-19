# Firestore Data Model Audit
- users: Current target. Needs migration of avatar and profiles.
- societies: Required for multi-tenancy.
- parcels, isitors, complaints: Currently in localStorage. Require strict societyId scoped schema.
