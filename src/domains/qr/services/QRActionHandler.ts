import type { QRValidationResult } from '../types/index';

/**
 * QRActionHandler routes the validated QR scan result to the appropriate frontend domain service.
 * In production, the heavy lifting (database mutation) happens on the backend during the `verifyQR` cloud function.
 * This handler is responsible for updating the local UI state or triggering follow-up modals (like OTP confirmation).
 */
export class QRActionHandler {
  
  public async handleScanResult(result: QRValidationResult): Promise<void> {
    if (result.code !== 'VALID') {
      console.warn(`[QRActionHandler] Cannot handle invalid result: ${result.code}`);
      return;
    }

    if (!result.entityType || !result.entityId) return;

    switch (result.entityType) {
      case 'PARCEL':
        await this.handleParcel(result);
        break;
      case 'GATEPASS':
        await this.handleGatepass(result);
        break;
      case 'VISITOR':
        await this.handleVisitor(result);
        break;
      case 'ATTENDANCE':
        await this.handleAttendance(result);
        break;
      default:
        console.log(`[QRActionHandler] No specific handler for ${result.entityType}`);
    }
  }

  private async handleParcel(result: QRValidationResult) {
    console.log(`[Action: Parcel] Routing to parcel tracking. Action Required: ${result.actionRequired}`);
    // The UI should navigate to the Parcel verification modal or call parcelRoomService
  }

  private async handleGatepass(result: QRValidationResult) {
    console.log(`[Action: Gatepass] Gatepass ${result.entityId} has been consumed.`);
  }

  private async handleVisitor(result: QRValidationResult) {
    console.log(`[Action: Visitor] Visitor ${result.entityId} checked in.`);
  }

  private async handleAttendance(result: QRValidationResult) {
    console.log(`[Action: Attendance] Staff ${result.entityId} attendance logged.`);
  }
}

export const qrActionHandler = new QRActionHandler();



