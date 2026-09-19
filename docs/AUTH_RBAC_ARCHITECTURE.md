# Authentication & RBAC Architecture

Firebase Auth
       |
       v
Firebase UID
       |
       +---- custom claims (Admin SDK)
       |       role (e.g. 'secretary')
       |       societyId (e.g. 'soc-gvs')
       |
       v
Firestore user profile (users/{uid})
       |
       v
RoleRouter / ProtectedRoute (Validates activeRole)
       |
       +---- Resident shell
       +---- Guard shell
       +---- Secretary shell
       +---- Committee shell
       +---- Facility Manager shell
       +---- Vendor shell
       +---- Admin shell
