import React, { createContext, useContext, useState } from 'react';
import type { UserRole, UserProfile, AuthFlowStep } from '../domains/auth/types';
import { MOCK_USERS } from '../mockData/auth/mockUsers';

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
  verifyOtp: (code: string) => boolean;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulatedOtpCode] = useState<string>('4092');
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    setStep('login');
  };

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setPhoneNumberState(MOCK_USERS[role].phone);
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

    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);
    setStep('verify');
    return true;
  };

  const verifyOtp = (code: string): boolean => {
    if (code !== '4092' && code !== '1234' && code.length !== 4) {
      setError('Invalid OTP code. Try entering 4092.');
      return false;
    }

    const user = MOCK_USERS[selectedRole] || MOCK_USERS.resident;
    setCurrentUser(user);
    setIsAuthenticated(true);
    setError(null);
    setStep('authenticated');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setStep('login');
  };

  const switchRole = (role: UserRole) => {
    setSelectedRole(role);
    const user = MOCK_USERS[role];
    setPhoneNumberState(user.phone);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setHasCompletedOnboarding(true);
    setStep('authenticated');
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
