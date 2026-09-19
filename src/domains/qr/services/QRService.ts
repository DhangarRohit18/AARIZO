import type { QREntityType, QRTokenPayload, QRValidationResult } from '../types/index';

class QRService {
  /**
   * Generates a cryptographically secure random token string for the QR payload
   */
  public generateSecureToken(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    return result;
  }

  /**
   * Constructs the secure QR Payload (JSON stringified)
   */
  public createQRPayload(entityType: QREntityType, entityId: string, societyId: string): string {
    const payload: QRTokenPayload = {
      t: this.generateSecureToken(),
      e: entityType,
      id: entityId,
      s: societyId
    };
    return JSON.stringify(payload);
  }

  /**
   * Parses and validates the raw QR string scanned from the camera
   */
  public parseScannedQR(rawQR: string): QRTokenPayload | null {
    try {
      const payload = JSON.parse(rawQR) as QRTokenPayload;
      if (payload.t && payload.e && payload.id && payload.s) {
        return payload;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * SIMULATED BACKEND VERIFICATION
   * This represents the future Firebase Cloud Function endpoint `verifyQR`.
   * It takes the raw payload, validates against the Firestore `qrTokens` collection,
   * performs the domain action, and writes the Audit log.
   */
  public async simulateBackendVerification(
    payload: QRTokenPayload, 
    _actorId: string, 
    actorSocietyId: string
  ): Promise<QRValidationResult> {
    
    // 1. Cross-tenant Security Check
    if (payload.s !== actorSocietyId) {
      return { code: 'WRONG_SOCIETY', message: 'This QR belongs to a different society.' };
    }

    // SIMULATED: In a real environment, we fetch the token from Firestore:
    // const tokenDoc = await db.collection('qrTokens').doc(payload.t).get();
    
    // For now, we simulate a successful lookup
    console.log(`[Backend Simulation] Verifying token ${payload.t} for ${payload.e}:${payload.id}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate domain specific logic (handled server side)
    let actionRequired = false;
    let message = 'Verification successful.';

    if (payload.e === 'PARCEL') {
      message = 'Parcel authorized for pickup.';
      actionRequired = true; // Needs OTP or signature
    } else if (payload.e === 'GATEPASS') {
      message = 'Gatepass verified. Exit authorized.';
    } else if (payload.e === 'VISITOR') {
      message = 'Visitor verified. Entry authorized.';
    }

    return {
      code: 'VALID',
      message,
      entityId: payload.id,
      entityType: payload.e,
      actionRequired
    };
  }
}

export const qrService = new QRService();



