# QR Architecture Plan
- **Current:** Generates deterministic strings based on local state.
- **Target:** Secure, single-use or time-bounded signed tokens.
- **Validation:** Must be validated via Cloud Functions, not client-side string splitting.
