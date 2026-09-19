import { moveRepository } from './MoveRepository';
import { qrService } from '../../domains/qr/services/QRService';
import { qrTokenRepository } from '../qr/QRTokenRepository';
import type { TimeSlot, MoveType, MoveVendor } from '../../domains/moves/types';
export class MoveService {
  
  /**
   * Submits a new move request. Protects against double-booking a lift slot.
   */
  public async submitRequest(
    societyId: string,
    residentId: string,
    residentName: string,
    flatCode: string,
    type: MoveType,
    dateString: string, // ISO Date String
    timeSlot: TimeSlot,
    liftSlotId: string,
    vendor: MoveVendor,
    vehicleNumber: string,
    workersCount: number
  ): Promise<string> {
    
    // Normalize date for strict matching (midnight UTC)
    const targetDate = new Date(dateString);
    targetDate.setUTCHours(0, 0, 0, 0);
    const normalizedDate = targetDate.toISOString();

    // 1. Double-Booking Validation
    // Check if the requested lift slot is already approved or scheduled for this date and time
    const existingMoves = await moveRepository.list(societyId);
    
    const conflicts = existingMoves.filter(m => 
      m.liftSlotId === liftSlotId &&
      m.timeSlot === timeSlot &&
      (m.status === 'APPROVED' || m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS')
    );

    // Filter by strict Date match (ignoring time)
    const dateConflicts = conflicts.filter(m => {
      const mDate = new Date(m.date);
      mDate.setUTCHours(0, 0, 0, 0);
      return mDate.toISOString() === normalizedDate;
    });

    if (dateConflicts.length > 0) {
      throw new Error(`The selected lift slot is already booked for ${timeSlot} on this date.`);
    }

    // 2. Create the Request
    const requestId = await moveRepository.create({
      societyId,
      residentId,
      residentName,
      flatCode,
      type,
      date: dateString,
      timeSlot,
      liftSlotId,
      vendor,
      vehicleNumber,
      workersCount,
      status: 'SUBMITTED',
      approval: {
        status: 'PENDING',
        updatedAt: new Date().toISOString()
      }
    } as any);

    return requestId;
  }

  /**
   * Secretary approves the request. Generates the QR Gatepass.
   */
  public async approveRequest(requestId: string, secretaryId: string): Promise<void> {
    const request = await moveRepository.getById(requestId);
    if (!request) throw new Error("Move request not found.");

    if (request.status !== 'SUBMITTED') {
      throw new Error("Only SUBMITTED requests can be approved.");
    }

    // 1. Generate QR Token Gatepass
    const tokenObj = JSON.parse(qrService.createQRPayload('MOVE', requestId, request.societyId));
    const generatedTokenId = tokenObj.t;

    // Gatepass is valid strictly for the day of the move
    const moveDate = new Date(request.date);
    moveDate.setUTCHours(0,0,0,0);
    const expiresAt = new Date(moveDate);
    expiresAt.setUTCHours(23, 59, 59, 999); // Expires at midnight on the move day

    await qrTokenRepository.create({
      societyId: request.societyId,
      entityType: 'MOVE',
      entityId: requestId,
      issuedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'ACTIVE',
      usagePolicy: 'ONE_TIME', // Or DAILY_LIMIT if they make multiple trips
      issuedBy: secretaryId,
      usageCount: 0
    } as any);

    // 2. Update Request Status
    await moveRepository.update(requestId, {
      status: 'SCHEDULED',
      gatepassId: generatedTokenId,
      approval: {
        status: 'APPROVED',
        approvedBy: secretaryId,
        updatedAt: new Date().toISOString()
      }
    });

    console.log(`[MoveService] Request ${requestId} approved. Gatepass QR generated.`);
  }

  /**
   * Resident or Admin cancels the request. Revokes the active QR Gatepass.
   */
  public async cancelRequest(requestId: string, reason?: string): Promise<void> {
    const request = await moveRepository.getById(requestId);
    if (!request) throw new Error("Move request not found.");

    // Revoke Gatepass if it exists
    if (request.gatepassId) {
      try {
        await qrTokenRepository.update(request.gatepassId, { status: 'REVOKED' });
        console.log(`[MoveService] Gatepass ${request.gatepassId} revoked due to cancellation.`);
      } catch (e) {
        console.warn(`[MoveService] Could not revoke Gatepass. It may not exist.`);
      }
    }

    await moveRepository.update(requestId, {
      status: 'CANCELLED',
      approval: {
        status: 'REJECTED',
        reason: reason || 'Cancelled by user',
        updatedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Guard initiates the move after scanning the QR.
   */
  public async startMove(requestId: string): Promise<void> {
    const request = await moveRepository.getById(requestId);
    if (!request || request.status !== 'SCHEDULED') {
      throw new Error("Invalid move request or not scheduled.");
    }
    
    await moveRepository.update(requestId, {
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString()
    });
  }

  /**
   * Guard completes the move when vendors exit.
   */
  public async completeMove(requestId: string): Promise<void> {
    await moveRepository.update(requestId, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    });
  }
}

export const moveService = new MoveService();
