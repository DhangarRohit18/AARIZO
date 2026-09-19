export type UserRole = 
  | 'resident' 
  | 'guard' 
  | 'secretary' 
  | 'committee' 
  | 'facility_manager' 
  | 'vendor' 
  | 'admin';

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  societyId: string;
  societyName?: string;
  roleLabel?: string;
  flatNumber?: string;
  flatDetails?: string;
  unitId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  avatarUrl?: string;
  designation?: string;
  statusBadge?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type AuthFlowStep = 'onboarding' | 'login' | 'verify' | 'authenticated';

export interface AuthState {
  step: AuthFlowStep;
  hasCompletedOnboarding: boolean;
  selectedRole: UserRole;
  phoneNumber: string;
  countryCode: string;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  simulatedOtpCode: string;
  error: string | null;
}
