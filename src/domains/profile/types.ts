// Resident Profile & Settings Domain Types for CommunityOS

export interface ResidentProfileDetails {
  fullName: string;
  email: string;
  phone: string;
  societyName: string;
  tower: string;
  flatNumber: string;
  occupancyType: 'Owner' | 'Tenant';
  moveInDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  vehiclesCount: number;
}

export interface ResidentSettingsState {
  visitorPasscodeAlerts: boolean;
  announcementAlerts: boolean;
  paymentReminders: boolean;
  maintenanceUpdates: boolean;
  maskPasscodeByDefault: boolean;
  directoryOptOut: boolean;
  themePreference: 'system' | 'light' | 'dark';
}
