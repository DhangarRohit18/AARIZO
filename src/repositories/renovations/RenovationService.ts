import { renovationRepository } from './RenovationRepository';
import { qrService } from '../../domains/qr/services/QRService';
import { qrTokenRepository } from '../qr/QRTokenRepository';
import type { RenovationContractor, RenovationRules } from '../../domains/renovations/types';

export class RenovationService {
  
  /**
   * Resident submits a request for renovation.
   */
  public async submitRequest(
    societyId: string,
    residentId: string,
    flatCode: string,
    workDescription: string,
    startDate: string,
    endDate: string,
    contractor: RenovationContractor,
    workersExpected: number,
    vehicles: string[],
    materials: string[]
  ): Promise<string> {
    
    // Default rules, typically Secretary modifies these before approval
    const defaultRules: RenovationRules = {
      allowedHoursStart: '09:00',
      allowedHoursEnd: '17:00',
      allowWeekends: false
    };

    const requestId = await renovationRepository.create({
      societyId,
      residentId,
      flatCode,
      workDescription,
      startDate,
      endDate,
      contractor,
      workersExpected,
      vehicles,
      materials,
      status: 'SUBMITTED',
      rules: defaultRules
    } as any);

    return requestId;
  }

  /**
   * Secretary approves the renovation and issues the Master Contractor QR Gatepass.
   */
  public async approveRequest(
    requestId: string,
    secretaryId: string,
    customRules?: RenovationRules
  ): Promise<void> {
    const request = await renovationRepository.getById(requestId);
    if (!request) throw new Error("Renovation request not found.");

    const finalRules = customRules || request.rules;

    // Generate Master Contractor QR
    const tokenObj = JSON.parse(qrService.createQRPayload('RENOVATION', requestId, request.societyId));
    const gatepassId = tokenObj.t;

    // The Master QR expires strictly at the end of the approved renovation date
    const end = new Date(request.endDate);
    end.setUTCHours(23, 59, 59, 999);

    await qrTokenRepository.create({
      societyId: request.societyId,
      entityType: 'RENOVATION',
      entityId: requestId,
      issuedAt: new Date().toISOString(),
      expiresAt: end.toISOString(),
      status: 'ACTIVE',
      usagePolicy: 'MULTIPLE_USE', // They enter and exit daily
      issuedBy: secretaryId,
      usageCount: 0
    } as any);

    await renovationRepository.update(requestId, {
      status: 'APPROVED', // Usually moves to ACTIVE on first scan
      gatepassId: gatepassId,
      rules: finalRules
    });
  }

  /**
   * Guard scans the Contractor QR. We strictly validate against time windows.
   */
  public async verifyContractorEntry(requestId: string): Promise<boolean> {
    const request = await renovationRepository.getById(requestId);
    if (!request) throw new Error("Renovation request not found.");

    if (request.status !== 'APPROVED' && request.status !== 'ACTIVE') {
      throw new Error(`Entry denied: Renovation status is ${request.status}.`);
    }

    const now = new Date();
    
    // 1. Verify Date Range
    const start = new Date(request.startDate);
    start.setUTCHours(0,0,0,0);
    const end = new Date(request.endDate);
    end.setUTCHours(23,59,59,999);

    if (now < start || now > end) {
      throw new Error(`Entry denied: Current date is outside the approved renovation window (${start.toDateString()} to ${end.toDateString()}).`);
    }

    // 2. Verify Day of Week (Weekends)
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6;
    if (isWeekend && !request.rules.allowWeekends) {
      throw new Error(`Entry denied: Weekend work is strictly prohibited for this renovation.`);
    }

    // 3. Verify Time Window
    // Parse "HH:MM"
    const [startHour, startMin] = request.rules.allowedHoursStart.split(':').map(Number);
    const [endHour, endMin] = request.rules.allowedHoursEnd.split(':').map(Number);
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (currentTime < startTime || currentTime > endTime) {
      throw new Error(`Entry denied: Outside allowed working hours (${request.rules.allowedHoursStart} - ${request.rules.allowedHoursEnd}).`);
    }

    // If it's the first time they entered, transition status from APPROVED to ACTIVE
    if (request.status === 'APPROVED') {
      await renovationRepository.update(requestId, { status: 'ACTIVE' });
    }

    // Note: Logging the specific entry to an Audit log is handled separately by the QRActionHandler.
    return true; // All checks passed!
  }

  /**
   * Suspends a renovation (e.g., due to noise complaint). Revokes QR.
   */
  public async suspendRenovation(requestId: string): Promise<void> {
    const request = await renovationRepository.getById(requestId);
    if (!request) return;

    if (request.gatepassId) {
      try {
        await qrTokenRepository.update(request.gatepassId, { status: 'REVOKED' });
      } catch (e) {}
    }

    await renovationRepository.update(requestId, { status: 'SUSPENDED' });
  }
}

export const renovationService = new RenovationService();
