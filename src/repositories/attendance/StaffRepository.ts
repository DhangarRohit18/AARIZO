import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { StaffProfile } from '../../domains/attendance/types';

export class StaffRepository extends BaseRepository<StaffProfile> {
  constructor() {
    super('staff');
  }

  protected getConverter(): FirestoreDataConverter<StaffProfile> {
    return {
      toFirestore(staff: StaffProfile): any {
        const { id, ...data } = staff;
        return data;
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): StaffProfile {
        const data = snapshot.data(options);
        
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          type: data.type || 'other',
          name: data.name || '',
          phone: data.phone || '',
          photoUrl: data.photoUrl,
          linkedHouseholds: data.linkedHouseholds || [],
          qrTokenId: data.qrTokenId,
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt || new Date().toISOString()
        } as StaffProfile;
      }
    };
  }
}

export const staffRepository = new StaffRepository();
