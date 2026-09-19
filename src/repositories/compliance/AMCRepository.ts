import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { AMCContract } from '../../domains/compliance/types';

export class AMCRepository extends BaseRepository<AMCContract> {
  constructor() {
    super('amcContracts');
  }

  protected getConverter(): FirestoreDataConverter<AMCContract> {
    return {
      toFirestore(contract: AMCContract): any {
        const { id, ...data } = contract;
        
        let parsedStart = data.contractStart;
        if (typeof data.contractStart === 'string' && data.contractStart.length > 0) {
          parsedStart = Timestamp.fromDate(new Date(data.contractStart));
        }

        let parsedEnd = data.contractEnd;
        if (typeof data.contractEnd === 'string' && data.contractEnd.length > 0) {
          parsedEnd = Timestamp.fromDate(new Date(data.contractEnd));
        }

        return {
          ...data,
          contractStart: parsedStart || null,
          contractEnd: parsedEnd || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): AMCContract {
        const data = snapshot.data(options);
        
        const contractStart = data.contractStart instanceof Timestamp ? data.contractStart.toDate().toISOString() : data.contractStart;
        const contractEnd = data.contractEnd instanceof Timestamp ? data.contractEnd.toDate().toISOString() : data.contractEnd;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          assetId: data.assetId,
          vendorId: data.vendorId,
          type: data.type || 'AMC',
          title: data.title || 'Untitled Document',
          contractStart: contractStart || new Date().toISOString(),
          contractEnd: contractEnd || new Date().toISOString(),
          status: data.status || 'ACTIVE',
          documentUrl: data.documentUrl || '',
          responsiblePerson: data.responsiblePerson || '',
          isPublicToResidents: data.isPublicToResidents || false,
          renewalHistory: data.renewalHistory || [],
          remindersSent: data.remindersSent || {
            thirtyDay: false,
            fifteenDay: false,
            sevenDay: false,
            expired: false
          },
          createdAt: createdAt || new Date().toISOString(),
          createdBy: data.createdBy || ''
        } as AMCContract;
      }
    };
  }
}

export const amcRepository = new AMCRepository();
