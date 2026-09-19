import { notificationRepository } from './NotificationRepository';
import { whatsAppAdapter } from '../../domains/notifications/adapters/WhatsAppAdapter';
import { pushAdapter } from '../../domains/notifications/adapters/PushAdapter';
import { smsAdapter } from '../../domains/notifications/adapters/SMSAdapter';
import type { NotificationPayload, NotificationRecord } from '../../domains/notifications/types/index';

export class NotificationService {
  
  /**
   * The Central Notification Engine.
   * Dispatches notifications across multiple channels simultaneously while guaranteeing deduplication.
   */
  public async dispatch(payload: NotificationPayload): Promise<void> {
    
    console.log(`[NotificationEngine] Intercepted event: ${payload.eventType} (${payload.eventId})`);

    // We must fan out because a single business event might require WhatsApp AND Push
    for (const channel of payload.channels) {
      
      // 1. Idempotency Check (Deduplication)
      // Check if this exact eventId has already been fired for this exact channel
      const isDuplicate = await this.checkDuplicate(payload.societyId, payload.eventId, channel);
      
      if (isDuplicate) {
        console.log(`[NotificationEngine] Skipping duplicate ${channel} notification for event: ${payload.eventId}`);
        continue;
      }

      // 2. Create the Database Record (Defaults to PENDING)
      const recordId = await notificationRepository.create({
        societyId: payload.societyId,
        eventId: payload.eventId,
        eventType: payload.eventType,
        recipientId: payload.recipientId,
        recipientPhone: payload.recipientPhone,
        channel: channel,
        title: payload.title,
        body: payload.body,
        dataPayload: payload.dataPayload,
        status: 'PENDING'
      } as any);

      const fullRecord = await notificationRepository.getById(recordId);
      if (!fullRecord) continue;

      // 3. Route to Adapter
      try {
        // Mark as SENT immediately before handing off to the adapter
        await notificationRepository.update(recordId, {
          status: 'SENT',
          sentAt: new Date().toISOString()
        });

        // Fire and Forget (the adapter will handle updating to DELIVERED)
        this.routeToAdapter(fullRecord);
        
      } catch (error: any) {
        console.error(`[NotificationEngine] Failed to dispatch to adapter: ${error.message}`);
        await notificationRepository.update(recordId, {
          status: 'FAILED',
          failureReason: error.message || 'Adapter throw'
        });
      }
    }
  }

  /**
   * Queries Firestore to prevent duplicate notifications for the exact same event + channel combo.
   */
  private async checkDuplicate(societyId: string, eventId: string, channel: string): Promise<boolean> {
    const records = await notificationRepository.list(societyId);
    // In production, this would be a direct compound query:
    // query(collection, where('eventId', '==', eventId), where('channel', '==', channel))
    const duplicate = records.find(r => r.eventId === eventId && r.channel === channel);
    return !!duplicate;
  }

  /**
   * Routes the notification record to the specific provider adapter.
   */
  private routeToAdapter(record: NotificationRecord) {
    switch (record.channel) {
      case 'WHATSAPP':
        whatsAppAdapter.send(record);
        break;
      case 'PUSH':
        pushAdapter.send(record);
        break;
      case 'SMS':
        smsAdapter.send(record);
        break;
      case 'IN_APP':
        // In-App notifications don't need a network adapter. 
        // Their mere presence in Firestore is enough for the UI to pick them up via listeners.
        notificationRepository.update(record.id, {
          status: 'DELIVERED',
          deliveredAt: new Date().toISOString()
        });
        break;
      default:
        console.warn(`[NotificationEngine] Unknown channel: ${record.channel}`);
    }
  }
}

export const notificationService = new NotificationService();
