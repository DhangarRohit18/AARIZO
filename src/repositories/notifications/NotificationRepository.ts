import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { NotificationRecord } from '../../domains/notifications/types';

export class NotificationRepository extends BaseRepository<NotificationRecord> {
  constructor() {
    super('notifications');
  }

  protected getConverter(): FirestoreDataConverter<NotificationRecord> {
    return {
      toFirestore(record: NotificationRecord): any {
        const { id, ...data } = record;
        
        let parsedSentAt = data.sentAt;
        if (typeof data.sentAt === 'string' && data.sentAt.length > 0) {
          parsedSentAt = Timestamp.fromDate(new Date(data.sentAt));
        }

        let parsedDeliveredAt = data.deliveredAt;
        if (typeof data.deliveredAt === 'string' && data.deliveredAt.length > 0) {
          parsedDeliveredAt = Timestamp.fromDate(new Date(data.deliveredAt));
        }

        return {
          ...data,
          sentAt: parsedSentAt || null,
          deliveredAt: parsedDeliveredAt || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): NotificationRecord {
        const data = snapshot.data(options);
        
        const sentAt = data.sentAt instanceof Timestamp ? data.sentAt.toDate().toISOString() : data.sentAt;
        const deliveredAt = data.deliveredAt instanceof Timestamp ? data.deliveredAt.toDate().toISOString() : data.deliveredAt;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          eventId: data.eventId || '',
          eventType: data.eventType || '',
          recipientId: data.recipientId || '',
          recipientPhone: data.recipientPhone,
          channel: data.channel || 'IN_APP',
          title: data.title || '',
          body: data.body || '',
          dataPayload: data.dataPayload,
          status: data.status || 'PENDING',
          sentAt: sentAt,
          deliveredAt: deliveredAt,
          failureReason: data.failureReason,
          createdAt: createdAt || new Date().toISOString()
        } as NotificationRecord;
      }
    };
  }
}

export const notificationRepository = new NotificationRepository();
