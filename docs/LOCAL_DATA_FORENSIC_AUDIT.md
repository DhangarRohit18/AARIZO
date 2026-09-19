# Local Data Forensic Audit
| File | Key/Variable | Business Meaning | Target |
|------|--------------|------------------|--------|
| src/services/childSafetyService.ts | CHILDREN_STORAGE_KEY | Resident children data | Firestore |
| src/services/parkingService.ts | PARKING_STORAGE_KEY | Parking logs | Firestore |
| src/services/housekeepingService.ts| TASKS_STORAGE_KEY | Staff attendance/tasks | Firestore |
- **Conclusion:** Operational data heavily relies on localStorage. Target: Firestore migration needed.
