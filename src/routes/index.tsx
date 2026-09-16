import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { UnauthorizedPage } from '../pages/unauthorized/UnauthorizedPage';
import { ResidentDashboard } from '../pages/dashboard/ResidentDashboard';
import { GuardDashboard } from '../pages/dashboard/GuardDashboard';
import { SuperAdminDashboard } from '../pages/dashboard/SuperAdminDashboard';
import { SuperAdminSocietiesPage } from '../pages/dashboard/admin/SuperAdminSocietiesPage';
import { TowerManagementPage } from '../pages/dashboard/admin/TowerManagementPage';
import { FlatManagementPage } from '../pages/dashboard/admin/FlatManagementPage';
import { ResidentManagementPage } from '../pages/dashboard/admin/ResidentManagementPage';
import { StaffManagementPage } from '../pages/dashboard/admin/StaffManagementPage';
import { VendorManagementPage } from '../pages/dashboard/admin/VendorManagementPage';
import { AuditLogsPage } from '../pages/dashboard/admin/AuditLogsPage';
import { ParkingManagementPage } from '../pages/dashboard/admin/ParkingManagementPage';
import { AdminHomePage } from '../pages/dashboard/admin/AdminHomePage';
import { MyFlatPage } from '../pages/dashboard/resident/MyFlatPage';
import { VisitorPassHubPage } from '../pages/dashboard/resident/VisitorPassHubPage';
import { ResidentParkingPage } from '../pages/dashboard/resident/ResidentParkingPage';
import { ResidentProfilePage } from '../pages/dashboard/resident/ResidentProfilePage';
import { ResidentServicesPage } from '../pages/dashboard/resident/ResidentServicesPage';
import { ResidentActivityPage } from '../pages/dashboard/resident/ResidentActivityPage';
import { SecurityTerminalPage } from '../pages/dashboard/security/SecurityTerminalPage';
import { ParkingGateScannerPage } from '../pages/dashboard/security/ParkingGateScannerPage';
import { DomesticWorkerManagementPage } from '../pages/dashboard/admin/DomesticWorkerManagementPage';
import { DomesticHelpHubPage } from '../pages/dashboard/resident/DomesticHelpHubPage';
import { StaffGateTerminalPage } from '../pages/dashboard/security/StaffGateTerminalPage';
import { MaintenanceManagementPage } from '../pages/dashboard/admin/MaintenanceManagementPage';
import { ResidentMaintenancePage } from '../pages/dashboard/resident/ResidentMaintenancePage';
import { BillingManagementPage } from '../pages/dashboard/admin/BillingManagementPage';
import { ResidentBillingPage } from '../pages/dashboard/resident/ResidentBillingPage';
import { AdminServiceHubPage } from '../pages/dashboard/admin/AdminServiceHubPage';
import { VendorPortalPage } from '../pages/dashboard/vendor/VendorPortalPage';
import { ResidentMarketplacePage } from '../pages/dashboard/resident/ResidentMarketplacePage';
import { DeliveryIntelligencePage } from '../pages/dashboard/admin/DeliveryIntelligencePage';
import { AdminAmenityManagementPage } from '../pages/dashboard/admin/AdminAmenityManagementPage';
import { ResidentAmenityBookingPage } from '../pages/dashboard/resident/ResidentAmenityBookingPage';
import { ResidentCommunityHubPage } from '../pages/dashboard/resident/ResidentCommunityHubPage';
import { ResidentChildSafetyPage } from '../pages/dashboard/resident/ResidentChildSafetyPage';
import { ChildGateScannerPage } from '../pages/dashboard/security/ChildGateScannerPage';
import { AdminChildSafetyPage } from '../pages/dashboard/admin/AdminChildSafetyPage';
import { ResidentEmergencyPage } from '../pages/dashboard/resident/ResidentEmergencyPage';
import { SecurityEmergencyTerminalPage } from '../pages/dashboard/security/SecurityEmergencyTerminalPage';
import { AdminSafetyCommandPage } from '../pages/dashboard/admin/AdminSafetyCommandPage';
import { AdminHousekeepingPage } from '../pages/dashboard/admin/AdminHousekeepingPage';
import { ResidentGarbagePage } from '../pages/dashboard/resident/ResidentGarbagePage';
import { StaffHousekeepingTaskPage } from '../pages/dashboard/staff/StaffHousekeepingTaskPage';
import { AdminGuestStayPage } from '../pages/dashboard/admin/AdminGuestStayPage';
import { ResidentGuestStayPage } from '../pages/dashboard/resident/ResidentGuestStayPage';
import { GuestStayScannerPage } from '../pages/dashboard/security/GuestStayScannerPage';
import { ServiceProviderTaskPage } from '../pages/dashboard/serviceProvider/ServiceProviderTaskPage';
import { VendorDashboard } from '../pages/dashboard/VendorDashboard';
import { ServiceProviderDashboard } from '../pages/dashboard/ServiceProviderDashboard';
import { NotificationCenterPage } from '../pages/dashboard/NotificationCenterPage';
import { SocietyIntelligenceDashboardPage } from '../pages/dashboard/admin/SocietyIntelligenceDashboardPage';
import { SecurityAuditCenterPage } from '../pages/dashboard/admin/SecurityAuditCenterPage';
import { RealtimeOperationsHubPage } from '../pages/dashboard/admin/RealtimeOperationsHubPage';
import { AdminCompliancePage } from '../pages/dashboard/admin/AdminCompliancePage';
import { AdminMoveRenovationPage } from '../pages/dashboard/admin/AdminMoveRenovationPage';
import { AdminExpensePage } from '../pages/dashboard/admin/AdminExpensePage';
import { CommitteeDashboard } from '../pages/dashboard/CommitteeDashboard';
import { FacilityManagerDashboard } from '../pages/dashboard/FacilityManagerDashboard';
import { DomesticWorkerDashboard } from '../pages/dashboard/DomesticWorkerDashboard';
import { UnifiedRequestCenter } from '../domains/requests/components/UnifiedRequestCenter';
import {
  SuperAdminLayout,
  SocietyAdminLayout,
  SecurityLayout,
  ResidentLayout,
  VendorLayout,
  ServiceProviderLayout,
  CommitteeLayout,
  FacilityManagerLayout,
  DomesticWorkerLayout,
} from '../components/layouts';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, selectedRole, currentUser } = useAuth();

  const getDefaultRoute = () => {
    const role = (currentUser?.role || selectedRole).toUpperCase();
    switch (role) {
      case 'SECRETARY':
      case 'SOCIETY_ADMIN':
        return '/admin';
      case 'GUARD':
      case 'SECURITY':
      case 'SECURITY_GUARD':
        return '/security';
      case 'SUPER_ADMIN':
        return '/super-admin';
      case 'COMMITTEE_MEMBER':
        return '/committee';
      case 'FACILITY_MANAGER':
        return '/facility';
      case 'DOMESTIC_WORKER':
        return '/domestic';
      case 'VENDOR':
        return '/vendor';
      case 'SERVICE_PROVIDER':
        return '/service-provider';
      default:
        return '/resident';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root Redirection */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/onboarding" replace />
        }
      />

      {/* Shared / Notifications Route */}
      <Route element={<ProtectedRoute allowedRoles={['RESIDENT', 'SOCIETY_ADMIN', 'SUPER_ADMIN', 'SECURITY', 'VENDOR', 'SERVICE_PROVIDER', 'COMMITTEE_MEMBER', 'FACILITY_MANAGER', 'DOMESTIC_WORKER']} />}>
        <Route path="/notifications" element={<NotificationCenterPage />} />
      </Route>

      {/* ── Resident Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['RESIDENT', 'SOCIETY_ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<ResidentLayout />}>
          <Route path="/resident" element={<ResidentDashboard />} />
          <Route path="/resident/my-flat" element={<MyFlatPage />} />
          <Route path="/resident/visitors" element={<VisitorPassHubPage />} />
          <Route path="/resident/parking" element={<ResidentParkingPage />} />
          <Route path="/resident/domestic-help" element={<DomesticHelpHubPage />} />
          <Route path="/resident/maintenance" element={<ResidentMaintenancePage />} />
          <Route path="/resident/billing" element={<ResidentBillingPage />} />
          <Route path="/resident/marketplace" element={<ResidentMarketplacePage />} />
          <Route path="/resident/amenities" element={<ResidentAmenityBookingPage />} />
          <Route path="/resident/community" element={<ResidentCommunityHubPage />} />
          <Route path="/resident/child-safety" element={<ResidentChildSafetyPage />} />
          <Route path="/resident/emergency" element={<ResidentEmergencyPage />} />
          <Route path="/resident/garbage" element={<ResidentGarbagePage />} />
          <Route path="/resident/guest-stay" element={<ResidentGuestStayPage />} />
          <Route path="/resident/requests" element={<UnifiedRequestCenter />} />
          {/* New mobile-first resident pages */}
          <Route path="/resident/profile" element={<ResidentProfilePage />} />
          <Route path="/resident/services" element={<ResidentServicesPage />} />
          <Route path="/resident/activity" element={<ResidentActivityPage />} />
          <Route path="/resident/*" element={<ResidentDashboard />} />
        </Route>
      </Route>

      {/* ── Society Admin Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['SOCIETY_ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<SocietyAdminLayout />}>
          {/* Mobile admin home replaces SecretaryDashboard as default */}
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/requests" element={<UnifiedRequestCenter />} />
          <Route path="/admin/towers" element={<TowerManagementPage />} />
          <Route path="/admin/flats" element={<FlatManagementPage />} />
          <Route path="/admin/residents" element={<ResidentManagementPage />} />
          <Route path="/admin/staff" element={<StaffManagementPage />} />
          <Route path="/admin/domestic-workers" element={<DomesticWorkerManagementPage />} />
          <Route path="/admin/vendors" element={<VendorManagementPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/parking" element={<ParkingManagementPage />} />
          <Route path="/admin/maintenance" element={<MaintenanceManagementPage />} />
          <Route path="/admin/billing" element={<BillingManagementPage />} />
          <Route path="/admin/service-hub" element={<AdminServiceHubPage />} />
          <Route path="/admin/delivery-intelligence" element={<DeliveryIntelligencePage />} />
          <Route path="/admin/amenities" element={<AdminAmenityManagementPage />} />
          <Route path="/admin/child-safety" element={<AdminChildSafetyPage />} />
          <Route path="/admin/safety-command" element={<AdminSafetyCommandPage />} />
          <Route path="/admin/housekeeping" element={<AdminHousekeepingPage />} />
          <Route path="/admin/guest-stay" element={<AdminGuestStayPage />} />
          <Route path="/admin/intelligence" element={<SocietyIntelligenceDashboardPage />} />
          <Route path="/admin/security-audit" element={<SecurityAuditCenterPage />} />
          <Route path="/admin/realtime" element={<RealtimeOperationsHubPage />} />
          <Route path="/admin/compliance" element={<AdminCompliancePage />} />
          <Route path="/admin/move-renovation" element={<AdminMoveRenovationPage />} />
          <Route path="/admin/expenses" element={<AdminExpensePage />} />
          <Route path="/admin/operations" element={<RealtimeOperationsHubPage />} />
          <Route path="/admin/*" element={<AdminHomePage />} />
        </Route>
      </Route>

      {/* ── Staff Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['SOCIETY_ADMIN', 'SUPER_ADMIN', 'RESIDENT', 'SERVICE_PROVIDER']} />}>
        <Route element={<ServiceProviderLayout />}>
          <Route path="/staff/housekeeping-tasks" element={<StaffHousekeepingTaskPage />} />
        </Route>
      </Route>

      {/* ── Security Guard Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['SECURITY', 'SOCIETY_ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<SecurityLayout />}>
          <Route path="/security" element={<SecurityTerminalPage />} />
          <Route path="/security/gate" element={<SecurityTerminalPage />} />
          <Route path="/security/verify" element={<SecurityTerminalPage />} />
          <Route path="/security/parking" element={<ParkingGateScannerPage />} />
          <Route path="/security/staff-scanner" element={<StaffGateTerminalPage />} />
          <Route path="/security/delivery-intelligence" element={<DeliveryIntelligencePage />} />
          <Route path="/security/child-safety" element={<ChildGateScannerPage />} />
          <Route path="/security/emergency-command" element={<SecurityEmergencyTerminalPage />} />
          <Route path="/security/guest-stay" element={<GuestStayScannerPage />} />
          <Route path="/security/*" element={<GuardDashboard />} />
        </Route>
      </Route>

      {/* ── Super Admin Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/societies" element={<SuperAdminSocietiesPage />} />
          <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
        </Route>
      </Route>

      {/* ── Vendor Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['VENDOR', 'SOCIETY_ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<VendorLayout />}>
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/portal" element={<VendorPortalPage />} />
          <Route path="/vendor/*" element={<VendorDashboard />} />
        </Route>
      </Route>

      {/* ── Service Provider Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['SERVICE_PROVIDER', 'RESIDENT', 'SUPER_ADMIN']} />}>
        <Route element={<ServiceProviderLayout />}>
          <Route path="/service-provider" element={<ServiceProviderDashboard />} />
          <Route path="/service-provider/tasks" element={<ServiceProviderTaskPage />} />
          <Route path="/service-provider/*" element={<ServiceProviderDashboard />} />
        </Route>
      </Route>

      {/* ── Committee Member Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['COMMITTEE_MEMBER', 'SOCIETY_ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<CommitteeLayout />}>
          <Route path="/committee" element={<CommitteeDashboard />} />
          <Route path="/committee/approvals" element={<CommitteeDashboard />} />
          <Route path="/committee/financials" element={<CommitteeDashboard />} />
          <Route path="/committee/compliance" element={<CommitteeDashboard />} />
          <Route path="/committee/health" element={<CommitteeDashboard />} />
          <Route path="/committee/governance" element={<CommitteeDashboard />} />
          <Route path="/committee/*" element={<CommitteeDashboard />} />
        </Route>
      </Route>

      {/* ── Facility Manager Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['FACILITY_MANAGER', 'SOCIETY_ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<FacilityManagerLayout />}>
          <Route path="/facility" element={<FacilityManagerDashboard />} />
          <Route path="/facility/maintenance" element={<FacilityManagerDashboard />} />
          <Route path="/facility/shifts" element={<FacilityManagerDashboard />} />
          <Route path="/facility/amc" element={<FacilityManagerDashboard />} />
          <Route path="/facility/cleaning" element={<FacilityManagerDashboard />} />
          <Route path="/facility/utilities" element={<FacilityManagerDashboard />} />
          <Route path="/facility/*" element={<FacilityManagerDashboard />} />
        </Route>
      </Route>

      {/* ── Domestic Worker Routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['DOMESTIC_WORKER', 'RESIDENT', 'SOCIETY_ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<DomesticWorkerLayout />}>
          <Route path="/domestic" element={<DomesticWorkerDashboard />} />
          <Route path="/domestic/*" element={<DomesticWorkerDashboard />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};
