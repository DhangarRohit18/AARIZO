# Realtime Forensic Audit
| File | Producer | Event | Target Mechanism |
|------|----------|-------|------------------|
| src/services/realtimeService.ts | System | VISITOR_ARRIVAL | FCM / Firestore onSnapshot |
- **Conclusion:** Currently relies on HTML5 BroadcastChannel for cross-tab mock synchronization. Realtime business flows are SIMULATED_REALTIME.
