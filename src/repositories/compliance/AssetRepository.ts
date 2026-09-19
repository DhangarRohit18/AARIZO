import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { SocietyAsset } from '../../domains/compliance/types';

export class AssetRepository extends BaseRepository<SocietyAsset> {
  constructor() {
    super('assets');
  }

  protected getConverter(): FirestoreDataConverter<SocietyAsset> {
    return {
      toFirestore(asset: SocietyAsset): any {
        const { id, ...data } = asset;
        
        let parsedInstallDate: any = data.installationDate;
        if (typeof data.installationDate === 'string' && data.installationDate.length > 0) {
          parsedInstallDate = Timestamp.fromDate(new Date(data.installationDate));
        }

        return {
          ...data,
          installationDate: parsedInstallDate || null
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): SocietyAsset {
        const data = snapshot.data(options);
        
        const installationDate = data.installationDate instanceof Timestamp ? data.installationDate.toDate().toISOString() : data.installationDate;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          category: data.category || 'OTHER',
          name: data.name || '',
          location: data.location || '',
          status: data.status || 'ACTIVE',
          installationDate: installationDate || new Date().toISOString(),
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt || new Date().toISOString()
        } as SocietyAsset;
      }
    };
  }
}

export const assetRepository = new AssetRepository();

