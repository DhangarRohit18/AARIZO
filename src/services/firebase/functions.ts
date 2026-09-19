import { httpsCallable } from 'firebase/functions';
import { functions } from './config';
import type { UserRole } from '../../domains/auth/types';

export interface ProvisionUserParams {
  targetUid: string;
  role: UserRole;
  societyId: string;
}

export interface ProvisionUserResult {
  success: boolean;
  message: string;
}

/**
 * Securely calls the backend Cloud Function to assign Custom Claims (role, societyId)
 * and update the user's Firestore profile.
 */
export async function provisionUserClaims(params: ProvisionUserParams): Promise<ProvisionUserResult> {
  const provisionFn = httpsCallable<ProvisionUserParams, ProvisionUserResult>(functions, 'provisionUser');
  const result = await provisionFn(params);
  return result.data;
}
