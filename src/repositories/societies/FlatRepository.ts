import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Flat } from '../../types/society';

export class FlatRepository extends BaseRepository<Flat> {
  constructor() {
    super('flats');
  }

  protected getConverter(): FirestoreDataConverter<Flat> {
    return {
      toFirestore(flat: Flat): any {
        const { id, ...data } = flat;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Flat {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          towerId: data.towerId || '',
          towerName: data.towerName || '',
          floorNumber: data.floorNumber || 0,
          flatNumber: data.flatNumber || '',
          bhkType: data.bhkType || '2BHK',
          occupancyStatus: data.occupancyStatus || 'OWNER_OCCUPIED',
          primaryResidentId: data.primaryResidentId,
          primaryResidentName: data.primaryResidentName,
          phone: data.phone,
        };
      }
    };
  }
}

export const flatRepository = new FlatRepository();
