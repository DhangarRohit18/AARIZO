import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { MoveRequest } from '../../domains/moves/types';

export class MoveRepository extends BaseRepository<MoveRequest> {
  constructor() {
    super('moveRequests');
  }

  protected getConverter(): FirestoreDataConverter<MoveRequest> {
    return {
      toFirestore(request: MoveRequest): any {
        const { id, ...data } = request;
        
        let parsedDate: any = data.date;
        if (typeof data.date === 'string' && data.date.length > 0) {
          parsedDate = Timestamp.fromDate(new Date(data.date));
        }

        let parsedStartedAt: any = data.startedAt;
        if (typeof data.startedAt === 'string' && data.startedAt.length > 0) {
          parsedStartedAt = Timestamp.fromDate(new Date(data.startedAt));
        }

        let parsedCompletedAt: any = data.completedAt;
        if (typeof data.completedAt === 'string' && data.completedAt.length > 0) {
          parsedCompletedAt = Timestamp.fromDate(new Date(data.completedAt));
        }

        return {
          ...data,
          date: parsedDate || null,
          startedAt: parsedStartedAt || null,
          completedAt: parsedCompletedAt || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): MoveRequest {
        const data = snapshot.data(options);
        
        const date = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;
        const startedAt = data.startedAt instanceof Timestamp ? data.startedAt.toDate().toISOString() : data.startedAt;
        const completedAt = data.completedAt instanceof Timestamp ? data.completedAt.toDate().toISOString() : data.completedAt;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;

        // Default approval object if missing
        const approval = data.approval || {
          status: 'PENDING',
          updatedAt: new Date().toISOString()
        };

        // If approval date is timestamp
        if (approval.updatedAt instanceof Timestamp) {
          approval.updatedAt = approval.updatedAt.toDate().toISOString();
        }

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          flatCode: data.flatCode || '',
          type: data.type || 'MOVE_IN',
          date: date || new Date().toISOString(),
          timeSlot: data.timeSlot || 'MORNING',
          liftSlotId: data.liftSlotId || '',
          vendor: data.vendor || { companyName: '', contactPerson: '', phone: '' },
          vehicleNumber: data.vehicleNumber || '',
          workersCount: data.workersCount || 0,
          status: data.status || 'SUBMITTED',
          approval: approval,
          gatepassId: data.gatepassId,
          startedAt: startedAt,
          completedAt: completedAt,
          createdAt: createdAt || new Date().toISOString()
        } as MoveRequest;
      }
    };
  }
}

export const moveRepository = new MoveRepository();

