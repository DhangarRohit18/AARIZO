import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Tower } from '../../types/society';

export class TowerRepository extends BaseRepository<Tower> {
  constructor() {
    super('towers');
  }

  protected getConverter(): FirestoreDataConverter<Tower> {
    return {
      toFirestore(tower: Tower): any {
        const { id, ...data } = tower;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Tower {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          name: data.name || '',
          blockCode: data.blockCode || '',
          totalFloors: data.totalFloors || 0,
          totalFlats: data.totalFlats || 0,
        };
      }
    };
  }
}

export const towerRepository = new TowerRepository();
