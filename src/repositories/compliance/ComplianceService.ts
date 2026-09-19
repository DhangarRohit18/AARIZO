import { amcRepository } from './AMCRepository';
import { assetRepository } from './AssetRepository';
import type { AMCContract, AMCType, AMCStatus } from '../../domains/compliance/types';

export class ComplianceService {
  
  /**
   * Creates a brand new AMC or compliance document.
   */
  public async createContract(
    societyId: string,
    type: AMCType,
    title: string,
    contractStart: string,
    contractEnd: string,
    documentUrl: string,
    responsiblePerson: string,
    createdBy: string,
    isPublicToResidents: boolean = false,
    assetId?: string,
    vendorId?: string
  ): Promise<string> {
    
    // Automatically determine initial status based on contractEnd
    const status = this.calculateStatus(new Date(contractEnd));

    const contractId = await amcRepository.create({
      societyId,
      assetId,
      vendorId,
      type,
      title,
      contractStart,
      contractEnd,
      status,
      documentUrl,
      responsiblePerson,
      isPublicToResidents,
      renewalHistory: [], // Brand new
      remindersSent: {
        thirtyDay: false,
        fifteenDay: false,
        sevenDay: false,
        expired: false
      },
      createdBy
    } as any);

    return contractId;
  }

  /**
   * Renews an existing contract by creating a new document and chaining the history.
   * Marks the old document as 'RENEWED'.
   */
  public async renewContract(
    oldContractId: string,
    newContractStart: string,
    newContractEnd: string,
    newDocumentUrl: string,
    createdBy: string
  ): Promise<string> {
    const oldContract = await amcRepository.getById(oldContractId);
    if (!oldContract) throw new Error("Original contract not found.");

    // Create the new chained contract
    const status = this.calculateStatus(new Date(newContractEnd));
    const newHistory = [...(oldContract.renewalHistory || []), oldContractId];

    const newContractId = await amcRepository.create({
      societyId: oldContract.societyId,
      assetId: oldContract.assetId,
      vendorId: oldContract.vendorId,
      type: oldContract.type,
      title: oldContract.title, // Keep same title
      contractStart: newContractStart,
      contractEnd: newContractEnd,
      status,
      documentUrl: newDocumentUrl,
      responsiblePerson: oldContract.responsiblePerson,
      isPublicToResidents: oldContract.isPublicToResidents,
      renewalHistory: newHistory,
      remindersSent: {
        thirtyDay: false,
        fifteenDay: false,
        sevenDay: false,
        expired: false
      },
      createdBy
    } as any);

    // Mark the old contract as safely renewed
    await amcRepository.update(oldContractId, {
      status: 'RENEWED'
    });

    return newContractId;
  }

  /**
   * Helper to determine exact status based on expiration date
   */
  private calculateStatus(endDate: Date): AMCStatus {
    const now = new Date().getTime();
    const endMs = endDate.getTime();
    const daysRemaining = (endMs - now) / (1000 * 60 * 60 * 24);

    if (daysRemaining <= 0) return 'EXPIRED';
    if (daysRemaining <= 30) return 'EXPIRING_SOON';
    return 'ACTIVE';
  }
}

export const complianceService = new ComplianceService();
