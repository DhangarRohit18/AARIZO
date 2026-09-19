import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Society } from '../../types/society';

export class SocietyRepository extends BaseRepository<Society> {
  constructor() {
    super('societies');
  }

  protected getConverter(): FirestoreDataConverter<Society> {
    return {
      toFirestore(soc: Society): any {
        const { id, ...data } = soc;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Society {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          name: data.name || '',
          code: data.code || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          status: data.status || 'ACTIVE',
          subscriptionTier: data.subscriptionTier || 'PRO',
          adminId: data.adminId,
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          totalTowers: data.totalTowers || 0,
          totalFlats: data.totalFlats || 0,
          createdAt: data.createdAt || new Date().toISOString().split('T')[0],
        } as Society;
      }
    };
  }
}

export const societyRepository = new SocietyRepository();
