import { materialGatepassRepository } from './MaterialGatepassRepository';
import { renovationRepository } from './RenovationRepository';
import { qrService } from '../../domains/qr/services/QRService';
import { qrTokenRepository } from '../qr/QRTokenRepository';
import type { MaterialGatepassType } from '../../domains/renovations/types';

export class MaterialGatepassService {
  
  /**
   * Generates a Material Gatepass (e.g., for a delivery truck or debris removal).
   */
  public async createMaterialGatepass(
    societyId: string,
    renovationId: string,
    type: MaterialGatepassType,
    itemsDescription: string,
    vehicleNumber: string,
    createdByResidentId: string
  ): Promise<string> {
    
    // Verify Renovation is active
    const renovation = await renovationRepository.getById(renovationId);
    if (!renovation || (renovation.status !== 'APPROVED' && renovation.status !== 'ACTIVE')) {
      throw new Error("Cannot create a material gatepass for an inactive renovation.");
    }

    const gatepassId = await materialGatepassRepository.create({
      societyId,
      renovationId,
      type,
      itemsDescription,
      vehicleNumber,
      status: 'PENDING'
    } as any);

    // Generate single-use QR Token specifically for this truck
    const tokenObj = JSON.parse(qrService.createQRPayload('MATERIAL', gatepassId, societyId));
    const qrToken = tokenObj.t;

    // Expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await qrTokenRepository.create({
      societyId,
      entityType: 'MATERIAL',
      entityId: gatepassId,
      issuedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
      usagePolicy: 'ONE_TIME',
      issuedBy: createdByResidentId,
      usageCount: 0
    } as any);

    // Update Gatepass with QR ID
    await materialGatepassRepository.update(gatepassId, { gatepassQrId: qrToken });

    return gatepassId;
  }

  /**
   * Guard verifies the material vehicle.
   */
  public async verifyMaterialGatepass(gatepassId: string, guardId: string): Promise<void> {
    const gatepass = await materialGatepassRepository.getById(gatepassId);
    if (!gatepass || gatepass.status !== 'PENDING') {
      throw new Error("Invalid or already verified gatepass.");
    }

    await materialGatepassRepository.update(gatepassId, {
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      verifiedByGuardId: guardId
    });
  }
}

export const materialGatepassService = new MaterialGatepassService();
