# Realtime Architecture Migration Status

| Module | Current Mechanism | Target Mechanism | Migration Status |
|--------|-------------------|------------------|------------------|
| Complaints / SLAs | BroadcastChannel / LocalStorage | Firestore onSnapshot | **Completed** |
| Parcels & Deliveries | BroadcastChannel | Firestore onSnapshot | Pending (P1) |
| Domestic Help / Staff | BroadcastChannel | Firestore onSnapshot | Pending (P1) |
| Asset Compliance (AMC) | BroadcastChannel | Firestore onSnapshot | Pending (P1) |
| Move In / Move Out | BroadcastChannel | Firestore onSnapshot | Pending (P1) |
| Notifications | BroadcastChannel | Firestore onSnapshot / FCM | Pending (P0) |
| AI Insights | LocalStorage | Firestore onSnapshot | Pending (P2) |
