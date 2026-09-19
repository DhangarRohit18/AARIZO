import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { QRAuditEvent } from '../../domains/qr/types';

export class QRAuditRepository extends BaseRepository<QRAuditEvent> {
  constructor() {
    super('auditLogs');
  }

  protected getConverter(): FirestoreDataConverter<QRAuditEvent> {
    return {
      toFirestore(event: QRAuditEvent): any {
        const { id, ...data } = event;
        return data;
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): QRAuditEvent {
        const data = snapshot.data(options);
        
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp;
        
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          tokenId: data.tokenId || '',
          actorId: data.actorId || '',
          timestamp: timestamp || new Date().toISOString(),
          location: data.location,
          entityType: data.entityType,
          entityId: data.entityId,
          action: data.action || 'SCAN',
          resultCode: data.resultCode || 'INVALID'
        } as QRAuditEvent;
      }
    };
  }
}

export const qrAuditRepository = new QRAuditRepository();
