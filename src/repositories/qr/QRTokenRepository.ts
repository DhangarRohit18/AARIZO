import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { QRTokenRecord } from '../../domains/qr/types';

export class QRTokenRepository extends BaseRepository<QRTokenRecord> {
  constructor() {
    super('qrTokens');
  }

  protected getConverter(): FirestoreDataConverter<QRTokenRecord> {
    return {
      toFirestore(token: QRTokenRecord): any {
        const { id, ...data } = token;
        return data;
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): QRTokenRecord {
        const data = snapshot.data(options);
        
        const issuedAt = data.issuedAt instanceof Timestamp ? data.issuedAt.toDate().toISOString() : data.issuedAt;
        const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : data.expiresAt;
        
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          entityType: data.entityType,
          entityId: data.entityId,
          issuedAt: issuedAt || new Date().toISOString(),
          expiresAt: expiresAt || new Date().toISOString(),
          status: data.status || 'ACTIVE',
          usagePolicy: data.usagePolicy || 'ONE_TIME',
          issuedBy: data.issuedBy || '',
          usageCount: data.usageCount || 0
        } as QRTokenRecord;
      }
    };
  }
}

export const qrTokenRepository = new QRTokenRepository();
