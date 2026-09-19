
import { parcelRepository } from './ParcelRepository';
import { qrTokenRepository } from '../qr/QRTokenRepository';

export class ParcelReminderService {
  /**
   * SIMULATED CRON JOB
   * In a real environment, this runs on a Firebase Schedule every hour.
   * Scans for parcels that have been sitting in the room for >24hrs or >48hrs.
   */
  public async processReminders(societyId: string): Promise<void> {
    const now = new Date();
    
    // Fetch all stored parcels
    // Note: We use list() and filter locally because multiple inequalities in Firestore can be complex.
    const storedParcels = await parcelRepository.list(societyId);
    const activeParcels = storedParcels.filter(p => p.status === 'STORED' || p.status === 'READY_FOR_PICKUP');

    for (const parcel of activeParcels) {
      if (!parcel.arrivalTime) continue;

      const arrivalDate = new Date(parcel.arrivalTime);
      const ageMs = now.getTime() - arrivalDate.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);

      // Check Expiration (72 hours default)
      if (parcel.expiresAt && now.getTime() > new Date(parcel.expiresAt).getTime()) {
        await this.expireParcel(parcel.id, parcel.pickupQrCode);
        continue; // Skip reminders if expired
      }

      // Check 48-hour reminder
      if (ageHours >= 48 && !parcel.isFlagged48h) {
        await parcelRepository.update(parcel.id, { isFlagged48h: true });
        console.log(`[Notification] 48h Reminder sent to resident for Parcel ${parcel.id}`);
        continue;
      }

      // Check 24-hour reminder
      if (ageHours >= 24 && !parcel.isFlagged24h) {
        await parcelRepository.update(parcel.id, { isFlagged24h: true });
        console.log(`[Notification] 24h Reminder sent to resident for Parcel ${parcel.id}`);
      }
    }
  }

  /**
   * Marks a parcel as EXPIRED if the resident fails to pick it up within the allowed window.
   * Revokes the associated QR token.
   */
  private async expireParcel(parcelId: string, tokenId: string) {
    // 1. Mark parcel expired
    await parcelRepository.update(parcelId, { status: 'EXPIRED' });
    
    // 2. Revoke the QR token so it can no longer be scanned at the gate
    if (tokenId && tokenId !== 'PENDING') {
      try {
        await qrTokenRepository.update(tokenId, { status: 'REVOKED' });
      } catch (e) {
        console.warn(`[ParcelReminder] Could not revoke QR token ${tokenId}. It might not exist.`);
      }
    }

    console.log(`[ParcelReminder] Parcel ${parcelId} has EXPIRED. Token revoked.`);
  }
}

export const parcelReminderService = new ParcelReminderService();
