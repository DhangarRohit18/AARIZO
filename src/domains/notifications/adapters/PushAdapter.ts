import { notificationRepository } from '../../../repositories/notifications/NotificationRepository';
import type { NotificationRecord } from '../types';

export class PushAdapter {
  
  /**
   * Simulates a Firebase Cloud Messaging (FCM) or APNS Push API call.
   */
  public async send(notification: NotificationRecord): Promise<void> {
    
    console.log(`[PushAdapter] Firing FCM Push to UID: ${notification.recipientId}`);
    console.log(`[PushAdapter] Title: ${notification.title}`);
    console.log(`[PushAdapter] Payload:`, notification.dataPayload);

    // Simulate Network Request
    setTimeout(async () => {
      console.log(`[PushAdapter] Success! Push Notification ${notification.id} delivered.`);
      await notificationRepository.update(notification.id, {
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString()
      });
    }, 1000);
  }
}

export const pushAdapter = new PushAdapter();
