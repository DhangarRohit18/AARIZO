import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Resident } from '../../types/society';

export class ResidentRepository extends BaseRepository<Resident> {
  constructor() {
    super('residents');
  }

  protected getConverter(): FirestoreDataConverter<Resident> {
    return {
      toFirestore(res: Resident): any {
        const { id, ...data } = res;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Resident {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          flatId: data.flatId || '',
          flatCode: data.flatCode || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'OWNER',
          approvalStatus: data.approvalStatus || 'APPROVED',
          moveInDate: data.moveInDate || '',
          avatarUrl: data.avatarUrl,
        };
      }
    };
  }
}

export const residentRepository = new ResidentRepository();
