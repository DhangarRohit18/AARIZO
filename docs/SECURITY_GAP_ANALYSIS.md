# Security Gap Analysis
- **Firestore:** Fully locked down for the users collection. 
- **Gap:** Other collections (parcels, 	asks) currently lack strict Firestore rules because they rely on localStorage. Rules must be written simultaneously with their migration.
