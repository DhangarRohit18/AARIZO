import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { MaterialGatepass } from '../../domains/renovations/types';

export class MaterialGatepassRepository extends BaseRepository<MaterialGatepass> {
  constructor() {
    super('materialGatepasses');
  }

  protected getConverter(): FirestoreDataConverter<MaterialGatepass> {
    return {
      toFirestore(gatepass: MaterialGatepass): any {
        const { id, ...data } = gatepass;
        
        let parsedVerifiedAt = data.verifiedAt;
        if (typeof data.verifiedAt === 'string' && data.verifiedAt.length > 0) {
          parsedVerifiedAt = Timestamp.fromDate(new Date(data.verifiedAt));
        }

        return {
          ...data,
          verifiedAt: parsedVerifiedAt || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): MaterialGatepass {
        const data = snapshot.data(options);
        
        const verifiedAt = data.verifiedAt instanceof Timestamp ? data.verifiedAt.toDate().toISOString() : data.verifiedAt;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          renovationId: data.renovationId || '',
          type: data.type || 'INBOUND',
          itemsDescription: data.itemsDescription || '',
          vehicleNumber: data.vehicleNumber || '',
          status: data.status || 'PENDING',
          verifiedAt: verifiedAt,
          verifiedByGuardId: data.verifiedByGuardId,
          gatepassQrId: data.gatepassQrId || '',
          createdAt: createdAt || new Date().toISOString()
        } as MaterialGatepass;
      }
    };
  }
}

export const materialGatepassRepository = new MaterialGatepassRepository();
