import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole, UserProfile, AuthFlowStep } from '../domains/auth/types';
import { MOCK_USERS } from '../mockData/auth/mockUsers';
import { 
  setupRecaptcha, 
  sendOtp, 
  verifyOtpCode, 
  getUserProfile, 
  logoutUser, 
  subscribeToAuth 
} from '../services/firebase/auth';

interface AuthContextType {
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
  completeOnboarding: () => void;
  selectRole: (role: UserRole) => void;
  setPhoneNumber: (phone: string) => void;
  submitLogin: (phone?: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  resetOnboarding: () => void;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<AuthFlowStep>('onboarding');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');
  const [phoneNumber, setPhoneNumberState] = useState<string>(MOCK_USERS.resident.phone);
  const [countryCode] = useState<string>('+91');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // initially loading auth state
  const [simulatedOtpCode] = useState<string>('4092'); // Kept for legacy UI display
  const [error, setError] = useState<string | null>(null);

  // Subscribe to Firebase Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setSelectedRole(profile.role);
            setIsAuthenticated(true);
            setStep('authenticated');
          } else {
            // User exists in auth but no profile - handle graceful failure
            setError("No profile found for this user in the database.");
            setIsAuthenticated(false);
            setCurrentUser(null);
            setStep('login');
          }
        } catch (err) {
          console.error("Profile fetch error:", err);
          setError("Failed to fetch user profile.");
        }
      } else {
        // Logged out
        setIsAuthenticated(false);
        setCurrentUser(null);
        if (step === 'authenticated') {
          setStep('login');
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [step]);

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    setStep('login');
  };

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setPhoneNumberState(MOCK_USERS[role]?.phone || '');
    setError(null);
  };

  const setPhoneNumber = (phone: string) => {
    setPhoneNumberState(phone);
    setError(null);
  };

  const submitLogin = async (overridePhone?: string): Promise<boolean> => {
    const targetPhone = overridePhone !== undefined ? overridePhone : phoneNumber;
    const cleanPhone = targetPhone.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return false;
    }

    setError(null);
    setIsLoading(true);

    try {
      // In a real app we'd attach recaptcha-container to the UI.
      const appVerifier = setupRecaptcha('recaptcha-container');
      const formattedPhone = `${countryCode}${cleanPhone}`;
      await sendOtp(formattedPhone, appVerifier);
      setStep('verify');
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP.');
      setIsLoading(false);
      return false;
    }
  };

  const verifyOtp = async (code: string): Promise<boolean> => {
    if (code.length !== 4 && code.length !== 6) {
      setError('Invalid OTP code format.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyOtpCode(code);
      // The onAuthStateChanged listener will catch the login and fetch the profile
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid OTP code.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await logoutUser();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setStep('login');
    setIsLoading(false);
  };

  const switchRole = (_role: UserRole) => {
    // Note: For full Firebase Auth migration, this bypass feature must be removed or 
    // it must use custom Firebase emulation tokens. For now, it warns the user.
    console.warn("switchRole is deprecated in Firebase Auth mode. Please login via Phone Auth.");
    setError("Role switching is disabled. Please login securely via Phone Number.");
  };

  const resetOnboarding = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setHasCompletedOnboarding(false);
    setStep('onboarding');
  };

  return (
    <AuthContext.Provider
      value={{
        step,
        hasCompletedOnboarding,
        selectedRole,
        phoneNumber,
        countryCode,
        currentUser,
        isAuthenticated,
        isLoading,
        simulatedOtpCode,
        error,
        completeOnboarding,
        selectRole,
        setPhoneNumber,
        submitLogin,
        verifyOtp,
        logout,
        switchRole,
        resetOnboarding,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
