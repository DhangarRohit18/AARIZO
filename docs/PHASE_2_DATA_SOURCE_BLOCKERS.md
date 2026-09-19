# Phase 2 Data Source Blockers

| File | Hardcoded Value | Purpose | Phase 2 Replacement |
|------|-----------------|---------|---------------------|
| src/pages/dashboard/admin/TowerManagementPage.tsx | 'soc-gvs', { id: 'sec-admin-1', ... } | Society association & actor logging | useAuth().currentUser.societyId, useAuth().currentUser |
| src/pages/dashboard/admin/BillingManagementPage.tsx | 'soc-gvs', { id: 'admin-1', ... } | Analytics and transaction scoping | useAuth().currentUser.societyId, useAuth().currentUser |
| src/pages/dashboard/admin/VendorManagementPage.tsx | 'soc-gvs', { id: 'sec-admin-1', ... } | Vendor CRUD scoping | useAuth().currentUser.societyId, useAuth().currentUser |
| src/pages/dashboard/admin/StaffManagementPage.tsx | 'soc-gvs', { id: 'sec-admin-1', ... } | Staff/Worker CRUD scoping | useAuth().currentUser.societyId, useAuth().currentUser |
| src/pages/dashboard/admin/FlatManagementPage.tsx | 'soc-gvs', { id: 'sec-admin-1', ... } | Flat CRUD scoping | useAuth().currentUser.societyId, useAuth().currentUser |
