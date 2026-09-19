import { staffRepository } from './StaffRepository';
import { qrTokenRepository } from '../qr/QRTokenRepository';
import { qrService } from '../../domains/qr/services/QRService';
import type { StaffProfile, LinkedHousehold, WorkerType } from '../../domains/attendance/types';

export class StaffService {
  
  /**
   * Registers a new domestic worker and automatically generates their persistent daily-limit QR token.
   */
  public async registerWorker(
    societyId: string,
    name: string,
    phone: string,
    type: WorkerType,
    photoUrl?: string
  ): Promise<string> {
    
    // Create basic profile
    const staffId = await staffRepository.create({
      societyId,
      name,
      phone,
      type,
      photoUrl,
      linkedHouseholds: [],
    } as any);

    // Generate secure QR Token payload for the physical card
    const tokenObj = JSON.parse(qrService.createQRPayload('ATTENDANCE', staffId, societyId));
    const tokenId = tokenObj.t;

    // Save token with DAILY_LIMIT policy
    // We set expiresAt far in the future (e.g. 1 year) for physical cards
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(now.getFullYear() + 1);

    await qrTokenRepository.create({
      societyId,
      entityType: 'ATTENDANCE',
      entityId: staffId,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
      usagePolicy: 'DAILY_LIMIT',
      issuedBy: 'SYSTEM',
      usageCount: 0
    } as any);

    // Link token back to staff profile
    await staffRepository.update(staffId, { qrTokenId: tokenId });

    return staffId;
  }

  /**
   * Resident links the worker to their household. Consent is required for attendance tracking.
   */
  public async linkToHousehold(
    staffId: string,
    residentId: string,
    flatCode: string,
    initialConsent: boolean = true
  ): Promise<void> {
    const profile = await staffRepository.getById(staffId);
    if (!profile) throw new Error('Worker not found.');

    const newLink: LinkedHousehold = {
      residentId,
      flatCode,
      consentGiven: initialConsent
    };

    // Check if already linked
    const exists = profile.linkedHouseholds.some(h => h.residentId === residentId);
    if (exists) {
      throw new Error('Worker is already linked to your household.');
    }

    const updatedLinks = [...profile.linkedHouseholds, newLink];
    await staffRepository.update(staffId, { linkedHouseholds: updatedLinks });
  }

  /**
   * Resident toggles attendance tracking consent on/off
   */
  public async toggleConsent(staffId: string, residentId: string, consent: boolean): Promise<void> {
    const profile = await staffRepository.getById(staffId);
    if (!profile) throw new Error('Worker not found.');

    const updatedLinks = profile.linkedHouseholds.map(h => 
      h.residentId === residentId ? { ...h, consentGiven: consent } : h
    );

    await staffRepository.update(staffId, { linkedHouseholds: updatedLinks });
  }
}

export const staffService = new StaffService();
