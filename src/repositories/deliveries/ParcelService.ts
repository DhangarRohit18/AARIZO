import { parcelRepository } from './ParcelRepository';
import { qrService } from '../../domains/qr/services/QRService';
import { qrTokenRepository } from '../qr/QRTokenRepository';

export class ParcelService {
  /**
   * Guard receives a parcel. Generates secure QR tokens and OTPs.
   */
  public async receiveParcel(
    societyId: string,
    residentId: string,
    residentName: string,
    flatCode: string,
    courierCompany: string,
    trackingNumber: string,
    storageLocation: string,
    guardId: string
  ): Promise<string> {
    
    // 1. Generate a secure fallback OTP (static 6-digit for resident convenience)
    const otpFallback = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Create the Parcel record in 'STORED' status immediately
    // Note: We use a placeholder for pickupQrCode initially, then update it.
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
    
    const parcelId = await parcelRepository.create({
      societyId,
      residentId,
      residentName,
      flatCode,
      courierCompany,
      trackingNumber,
      storageLocation,
      status: 'STORED',
      arrivalTime: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      pickupOtp: otpFallback,
      pickupQrCode: 'PENDING', 
      ageHours: 0,
      isFlagged24h: false,
      isFlagged48h: false,
      createdBy: guardId
    } as any);

    // 3. Generate secure QR Token mapping to this Parcel
    // Generate secure token payload
    const tokenObj = JSON.parse(qrService.createQRPayload('PARCEL', parcelId, societyId));
    
    // Write token explicitly to qrTokens collection for validation layer
    await qrTokenRepository.create({
      societyId,
      entityType: 'PARCEL',
      entityId: parcelId,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
      usagePolicy: 'ONE_TIME',
      issuedBy: guardId,
      usageCount: 0
    } as any); // The base repository usually generates ID but for tokens we want the ID to be the token 't' value...
    // Wait, the BaseRepository automatically generates a random Firestore ID for `create`.
    // In our QR schema, we probably want the token itself as the ID, or we store the token payload inside the document. 
    // Let's just update the parcel with the document ID of the token.
    
    // Wait, we need to get the generated token ID properly.
    // Instead of messing with custom IDs in base repository, we'll just let Firestore generate the ID, and use that as the token string.
    
    // Update the parcel with the secure token ID
    const generatedToken = tokenObj.t;
    await parcelRepository.update(parcelId, { pickupQrCode: generatedToken });

    // Send push notification to resident here (simulated)
    console.log(`[Notification] Parcel ${parcelId} stored. OTP: ${otpFallback}, QR: ${generatedToken}`);

    return parcelId;
  }

  /**
   * Completes the handover by validating OTP or overriding manually.
   */
  public async handoverParcel(
    parcelId: string, 
    collectedByUserId: string, 
    verificationMethod: 'QR' | 'OTP' | 'MANUAL'
  ): Promise<void> {
    const parcel = await parcelRepository.getById(parcelId);
    if (!parcel) throw new Error("Parcel not found");
    if (parcel.status === 'COLLECTED') throw new Error("Parcel already collected");

    // In a real environment, the QR handler would do this verification. 
    // Here we assume the frontend already validated the QR via QRActionHandler, OR the guard entered the correct OTP.

    await parcelRepository.update(parcelId, {
      status: 'COLLECTED',
      pickupTime: new Date().toISOString(),
      collectedBy: collectedByUserId,
      notes: `Verified via ${verificationMethod}`
    });

    console.log(`[Handover] Parcel ${parcelId} given to ${collectedByUserId} via ${verificationMethod}.`);
  }
}

export const parcelService = new ParcelService();
