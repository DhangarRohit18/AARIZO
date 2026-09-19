import { attendanceRepository } from './AttendanceRepository';
import { staffRepository } from './StaffRepository';
import { query, where, orderBy, limit } from 'firebase/firestore';

export class AttendanceService {
  
  /**
   * Records a check-in. Prevents duplicates and verifies active household consent.
   */
  public async recordCheckIn(
    societyId: string,
    workerId: string,
    guardId: string,
    method: 'QR' | 'MANUAL' | 'AUTHORIZED_GUARD_ENTRY',
    checkpoint: string = 'Main Gate'
  ): Promise<string> {
    
    // 1. Verify Profile and Consent
    const profile = await staffRepository.getById(workerId);
    if (!profile) throw new Error('Worker profile not found.');

    const activeHouseholds = profile.linkedHouseholds.filter(h => h.consentGiven);
    if (activeHouseholds.length === 0) {
      throw new Error('Check-in denied: No households have given active consent for this worker.');
    }

    // Extract resident IDs to populate the visibility array
    const householdIds = activeHouseholds.map(h => h.residentId);

    // 2. Prevent Duplicates (Check if already checked-in today without a checkout)
    // In a production NoSQL setup, we'd query for checkOut == null, but Firestore doesn't 
    // natively index null queries easily. Instead, we fetch the most recent log for the worker.
    const recentLogs = await attendanceRepository.list(societyId, [
      where('workerId', '==', workerId),
      orderBy('checkIn', 'desc'),
      limit(1)
    ]);

    if (recentLogs.length > 0) {
      const lastLog = recentLogs[0];
      if (!lastLog.checkOut) {
        throw new Error('Worker is already checked in. Please check out first.');
      }
      
      // Also verify it's not a rapid double-scan (within 5 minutes)
      const lastCheckInTime = new Date(lastLog.checkIn).getTime();
      if (Date.now() - lastCheckInTime < 5 * 60 * 1000) {
        throw new Error('Duplicate check-in blocked. Worker just checked in.');
      }
    }

    // 3. Record Check-In
    const logId = await attendanceRepository.create({
      societyId,
      workerId,
      householdIds,
      checkIn: new Date().toISOString(),
      checkpoint,
      method,
      createdBy: guardId
    } as any);

    return logId;
  }

  /**
   * Records a check-out by updating the active open log.
   */
  public async recordCheckOut(societyId: string, workerId: string): Promise<void> {
    // 1. Find the active log
    const recentLogs = await attendanceRepository.list(societyId, [
      where('workerId', '==', workerId),
      orderBy('checkIn', 'desc'),
      limit(1)
    ]);

    if (recentLogs.length === 0 || recentLogs[0].checkOut) {
      throw new Error('Check-out failed: Worker is not currently checked in.');
    }

    const activeLog = recentLogs[0];

    // 2. Record Check-Out
    await attendanceRepository.update(activeLog.id, {
      checkOut: new Date().toISOString()
    });
  }
}

export const attendanceService = new AttendanceService();
