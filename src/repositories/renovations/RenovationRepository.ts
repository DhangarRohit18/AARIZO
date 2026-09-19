import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { RenovationRequest } from '../../domains/renovations/types';

export class RenovationRepository extends BaseRepository<RenovationRequest> {
  constructor() {
    super('renovations');
  }

  protected getConverter(): FirestoreDataConverter<RenovationRequest> {
    return {
      toFirestore(request: RenovationRequest): any {
        const { id, ...data } = request;
        
        let parsedStartDate: any = data.startDate;
        if (typeof data.startDate === 'string' && data.startDate.length > 0) {
          parsedStartDate = Timestamp.fromDate(new Date(data.startDate));
        }

        let parsedEndDate: any = data.endDate;
        if (typeof data.endDate === 'string' && data.endDate.length > 0) {
          parsedEndDate = Timestamp.fromDate(new Date(data.endDate));
        }

        return {
          ...data,
          startDate: parsedStartDate || null,
          endDate: parsedEndDate || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): RenovationRequest {
        const data = snapshot.data(options);
        
        const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate;
        const endDate = data.endDate instanceof Timestamp ? data.endDate.toDate().toISOString() : data.endDate;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;

        // Default approval object if missing
        const approval = data.approval || {
          status: 'PENDING',
          updatedAt: new Date().toISOString()
        };

        if (approval.updatedAt instanceof Timestamp) {
          approval.updatedAt = approval.updatedAt.toDate().toISOString();
        }

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          flatCode: data.flatCode || '',
          contractor: data.contractor || { companyName: '', contactPerson: '', phone: '' },
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || new Date().toISOString(),
          materials: data.materials || [],
          documentsUrl: data.documentsUrl || [],
          status: data.status || 'SUBMITTED',
          gatepassId: data.gatepassId,
          rules: data.rules || {
            allowedHoursStart: '09:00',
            allowedHoursEnd: '17:00',
            allowWeekends: false
          },
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt || new Date().toISOString()
        } as RenovationRequest;
      }
    };
  }
}

export const renovationRepository = new RenovationRepository();

