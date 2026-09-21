import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPhoneNumber, 
  signOut,
  RecaptchaVerifier,
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { auth, db } from '../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '../domains/auth/types';
import { MOCK_USERS } from '../mockData/auth/mockUsers';

export type AuthStatus = 
  | 'INITIALIZING'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'PROFILE_MISSING'
  | 'CLAIMS_MISSING'
  | 'CLAIMS_MISMATCH';

interface AuthContextProps {
  status: AuthStatus;
  currentUser: UserProfile | null;
  phoneNumber: string;
  countryCode: string;
  error: string | null;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  setPhoneNumber: (phone: string) => void;
  submitLogin: (appVerifier: RecaptchaVerifier) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'communityos_onboarding_completed';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('INITIALIZING');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  });
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+91');
  const [error, setError] = useState<string | null>(null);
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setStatus('UNAUTHENTICATED');
        return;
      }

      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const claimsRole = (idTokenResult.claims.role as string | undefined)?.toLowerCase() as UserRole | undefined;
        const claimsSocietyId = idTokenResult.claims.societyId as string | undefined;

        if (!claimsRole || !claimsSocietyId) {
          console.error("Missing Custom Claims:", idTokenResult.claims);
          setStatus('CLAIMS_MISSING');
          return;
        }

        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setStatus('PROFILE_MISSING');
          return;
        }

        const profileData = docSnap.data();
        const profile: UserProfile = {
          id: docSnap.id,
          uid: firebaseUser.uid,
          name: profileData.name || '',
          phone: profileData.phone || firebaseUser.phoneNumber || '',
          email: profileData.email || firebaseUser.email || undefined,
          role: (profileData.role || '').toLowerCase() as UserRole,
          societyId: profileData.societyId || '',
          societyName: profileData.societyName,
          flatNumber: profileData.flatNumber,
          flatDetails: profileData.flatDetails,
          unitId: profileData.unitId,
          status: profileData.status || 'ACTIVE',
          avatarUrl: profileData.avatarUrl,
          designation: profileData.designation,
          statusBadge: profileData.statusBadge,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt
        };

        if (profile.role !== claimsRole || profile.societyId !== claimsSocietyId) {
          console.error("Claims mismatch:", { 
            claims: { role: claimsRole, societyId: claimsSocietyId }, 
            profile: { role: profile.role, societyId: profile.societyId } 
          });
          setStatus('CLAIMS_MISMATCH');
          return;
        }

        setCurrentUser(profile);
        setStatus('AUTHENTICATED');

      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to verify user identity.");
        setStatus('UNAUTHENTICATED');
      }
    });

    return () => unsubscribe();
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
  };

  const submitLogin = async (appVerifier: RecaptchaVerifier) => {
    try {
      setError(null);
      const fullNumber = countryCode + phoneNumber;
      const result = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
      throw err;
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) {
      setError("No pending OTP request.");
      return;
    }
    try {
      setError(null);
      await confirmationResult.confirm(code);
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
      throw err;
    }
  };

  const loginAsRole = (role: UserRole) => {
    const user = MOCK_USERS[role] || MOCK_USERS.resident;
    setCurrentUser(user);
    setStatus('AUTHENTICATED');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    setCurrentUser(null);
    setStatus('UNAUTHENTICATED');
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        currentUser,
        phoneNumber,
        countryCode,
        error,
        hasCompletedOnboarding,
        completeOnboarding,
        setPhoneNumber,
        submitLogin,
        verifyOtp,
        loginAsRole,
        logout,
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

