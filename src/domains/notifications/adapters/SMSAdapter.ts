import { notificationRepository } from '../../../repositories/notifications/NotificationRepository';
import type { NotificationRecord } from '../types';

export class SMSAdapter {
  
  /**
   * Simulates an SMS API call (e.g., Twilio).
   */
  public async send(notification: NotificationRecord): Promise<void> {
    if (!notification.recipientPhone) {
      console.warn(`[SMSAdapter] Missing phone number for Notification ${notification.id}. Marking FAILED.`);
      await notificationRepository.update(notification.id, {
        status: 'FAILED',
        failureReason: 'Missing phone number'
      });
      return;
    }

    console.log(`[SMSAdapter] Sending SMS to ${notification.recipientPhone}...`);
    console.log(`[SMSAdapter] Text: ${notification.body}`);

    // Simulate Network Request
    setTimeout(async () => {
      console.log(`[SMSAdapter] Success! SMS ${notification.id} delivered.`);
      await notificationRepository.update(notification.id, {
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString()
      });
    }, 1200);
  }
}

export const smsAdapter = new SMSAdapter();
