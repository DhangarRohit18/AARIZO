export type UserRole = 'resident' | 'secretary' | 'guard';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  roleLabel: string;
  societyName: string;
  flatDetails?: string;
  avatarUrl?: string;
  designation?: string;
  statusBadge?: string;
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
