import { notificationRepository } from '../../../repositories/notifications/NotificationRepository';
import type { NotificationRecord } from '../types';

export class WhatsAppAdapter {
  
  /**
   * Simulates a WhatsApp API call (e.g., Twilio or Meta Graph API).
   */
  public async send(notification: NotificationRecord): Promise<void> {
    if (!notification.recipientPhone) {
      console.warn(`[WhatsAppAdapter] Missing phone number for Notification ${notification.id}. Marking FAILED.`);
      await notificationRepository.update(notification.id, {
        status: 'FAILED',
        failureReason: 'Missing phone number'
      });
      return;
    }

    console.log(`[WhatsAppAdapter] Dispatching to ${notification.recipientPhone}...`);
    console.log(`[WhatsAppAdapter] Payload: ${notification.title} - ${notification.body}`);

    // Simulate Network Request
    setTimeout(async () => {
      console.log(`[WhatsAppAdapter] Success! Notification ${notification.id} delivered.`);
      await notificationRepository.update(notification.id, {
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString()
      });
    }, 1500);
  }
}

export const whatsAppAdapter = new WhatsAppAdapter();
