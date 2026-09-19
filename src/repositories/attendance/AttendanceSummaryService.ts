import { getDocs, query, where, Timestamp } from 'firebase/firestore';
import { attendanceRepository } from './AttendanceRepository';
import { BaseRepository } from '../BaseRepository';
import type { AttendanceSummary, AttendanceLog } from '../../domains/attendance/types';
import { db } from '../../services/firebase/config';

class AttendanceSummaryRepository extends BaseRepository<AttendanceSummary> {
  constructor() {
    super('attendanceSummaries');
  }
  
  protected getConverter() {
    return {
      toFirestore(summary: AttendanceSummary): any {
        const { id, ...data } = summary;
        return data;
      },
      fromFirestore(snapshot: any, options: any): AttendanceSummary {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          ...data
        } as AttendanceSummary;
      }
    };
  }
}
const summaryRepository = new AttendanceSummaryRepository();

export class AttendanceSummaryService {
  
  /**
   * SIMULATED CRON JOB (Runs nightly at 23:59)
   * 1. Finds all active logs without a checkout and closes them automatically.
   */
  public async autoCheckOutDanglingLogs(societyId: string): Promise<void> {
    const logs = await attendanceRepository.list(societyId);
    
    // Filter for logs missing checkOut (happened today)
    const danglingLogs = logs.filter(log => !log.checkOut);

    for (const log of danglingLogs) {
      // Auto-checkout exactly at 23:59:59 of the check-in day to keep stats clean
      const checkInDate = new Date(log.checkIn);
      const autoOutDate = new Date(checkInDate);
      autoOutDate.setHours(23, 59, 59, 999);

      await attendanceRepository.update(log.id, {
        checkOut: autoOutDate.toISOString()
      });
      console.log(`[Auto-Checkout] Log ${log.id} auto-closed at midnight.`);
    }
  }

  /**
   * SIMULATED CRON JOB (Runs 1st of every month)
   * Groups daily logs into monthly summary records for fast resident dashboard queries.
   */
  public async generateMonthlySummary(societyId: string, monthPrefix: string): Promise<void> {
    // monthPrefix format: 'YYYY-MM'
    const allLogs = await attendanceRepository.list(societyId);
    
    const targetLogs = allLogs.filter(log => log.checkIn.startsWith(monthPrefix) && log.checkOut);

    // Group by workerId
    const workerMap = new Map<string, AttendanceLog[]>();
    targetLogs.forEach(log => {
      const logs = workerMap.get(log.workerId) || [];
      logs.push(log);
      workerMap.set(log.workerId, logs);
    });

    for (const [workerId, logs] of workerMap.entries()) {
      let totalHours = 0;
      
      logs.forEach(log => {
        if (log.checkOut) {
          const checkIn = new Date(log.checkIn).getTime();
          const checkOut = new Date(log.checkOut).getTime();
          totalHours += (checkOut - checkIn) / (1000 * 60 * 60);
        }
      });

      const summaryId = `${workerId}_${monthPrefix.replace('-', '_')}`;
      
      // We check if summary exists, else create. For simplicity, we just create/overwrite.
      // (Requires the ability to set ID in BaseRepository, which our standard implementation doesn't support directly).
      // We will just do a standard create for this simulation.
      
      await summaryRepository.create({
        societyId,
        workerId,
        month: monthPrefix,
        totalDaysPresent: logs.length,
        totalHoursWorked: Math.round(totalHours * 100) / 100
      } as any);
      
      console.log(`[Summary Generated] ${workerId} for ${monthPrefix}: ${logs.length} days, ${totalHours} hrs.`);
    }
  }
}

export const attendanceSummaryService = new AttendanceSummaryService();
