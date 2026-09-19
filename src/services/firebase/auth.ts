import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { ConfirmationResult, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserProfile } from '../../domains/auth/types';

// Store the recaptcha verifier and confirmation result instances
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initializes the RecaptchaVerifier on a DOM element (e.g. 'recaptcha-container')
 */
export const setupRecaptcha = (containerId: string = 'recaptcha-container') => {
  if (recaptchaVerifier) return recaptchaVerifier;
  
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
  return recaptchaVerifier;
};

/**
 * Sends an OTP to the given phone number
 */
export const sendOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  try {
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

/**
 * Verifies the OTP code and returns the Firebase User
 */
export const verifyOtpCode = async (code: string): Promise<FirebaseUser> => {
  if (!confirmationResult) {
    throw new Error("No pending OTP request found.");
  }
  
  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

/**
 * Fetches the user profile from Firestore users/{uid}
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Creates or updates a user profile in Firestore
 */
export const syncUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error syncing user profile:", error);
    throw error;
  }
};

/**
 * Signs the user out
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * Subscribes to auth state changes
 */
export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
