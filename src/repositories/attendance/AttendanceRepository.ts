import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { AttendanceLog } from '../../domains/attendance/types';

export class AttendanceRepository extends BaseRepository<AttendanceLog> {
  constructor() {
    super('attendance');
  }

  protected getConverter(): FirestoreDataConverter<AttendanceLog> {
    return {
      toFirestore(log: AttendanceLog): any {
        const { id, ...data } = log;
        
        let parsedCheckIn = data.checkIn;
        if (typeof data.checkIn === 'string' && data.checkIn.length > 0) {
          parsedCheckIn = Timestamp.fromDate(new Date(data.checkIn));
        }

        let parsedCheckOut = data.checkOut;
        if (typeof data.checkOut === 'string' && data.checkOut.length > 0) {
          parsedCheckOut = Timestamp.fromDate(new Date(data.checkOut));
        }

        return {
          ...data,
          checkIn: parsedCheckIn || null,
          checkOut: parsedCheckOut || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): AttendanceLog {
        const data = snapshot.data(options);
        
        const checkIn = data.checkIn instanceof Timestamp ? data.checkIn.toDate().toISOString() : data.checkIn;
        const checkOut = data.checkOut instanceof Timestamp ? data.checkOut.toDate().toISOString() : data.checkOut;
        
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          workerId: data.workerId || '',
          householdIds: data.householdIds || [],
          checkIn: checkIn,
          checkOut: checkOut,
          checkpoint: data.checkpoint || 'Main Gate',
          method: data.method || 'MANUAL',
          createdBy: data.createdBy || ''
        } as AttendanceLog;
      }
    };
  }
}

export const attendanceRepository = new AttendanceRepository();
