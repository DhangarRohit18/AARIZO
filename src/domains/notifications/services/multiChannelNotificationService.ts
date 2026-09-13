import type {
  NotificationEvent,
  NotificationCategory,
  DeliveryLog,
  NotificationItemWithLogs,
  NotificationPreference,
  InAppNotificationAdapter,
  PushNotificationAdapter,
  WhatsAppNotificationAdapter,
  SMSNotificationAdapter,
  EmailNotificationAdapter,
} from '../types/index';
import { realTimeSync } from '../../../services/realTimeSync';

const STORAGE_KEY_NOTIF_EVENTS = 'aarizo_notification_events_v2';
const STORAGE_KEY_NOTIF_LOGS = 'aarizo_notification_logs_v2';
const STORAGE_KEY_NOTIF_PREFS = 'aarizo_notification_prefs_v2';

// 1. Provider Adapter Implementations
class MockInAppAdapter implements InAppNotificationAdapter {
  name = 'AARIZO Real-Time Websocket In-App Engine';
  async sendInApp(event: NotificationEvent): Promise<DeliveryLog> {
    const timestamp = new Date().toISOString();
    return {
      id: `log-inapp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventId: event.id,
      recipientUserId: event.recipientUserId,
      channel: 'IN_APP',
      providerName: this.name,
      providerRefId: `inapp_msg_${Date.now()}`,
      status: 'DELIVERED',
      sentAt: timestamp,
      deliveredAt: timestamp,
    };
  }
}

class MockPushAdapter implements PushNotificationAdapter {
  name = 'Firebase Cloud Messaging (FCM / APNS Adapter)';
  async sendPush(event: NotificationEvent, deviceToken: string = 'token_demo_123'): Promise<DeliveryLog> {
    const timestamp = new Date().toISOString();
    console.log(`[PUSH ADAPTER] Dispatching push to ${deviceToken}: ${event.title}`);
    return {
      id: `log-push-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventId: event.id,
      recipientUserId: event.recipientUserId,
      channel: 'PUSH',
      providerName: this.name,
      providerRefId: `fcm_msg_id_${Date.now()}`,
      status: 'DELIVERED',
      sentAt: timestamp,
      deliveredAt: timestamp,
    };
  }
}

class MockWhatsAppAdapter implements WhatsAppNotificationAdapter {
  name = 'Meta Business Cloud API (WhatsApp Adapter)';
  async sendWhatsApp(event: NotificationEvent, phoneNumber: string = '+91 98765 43210'): Promise<DeliveryLog> {
    const timestamp = new Date().toISOString();
    console.log(`[WHATSAPP ADAPTER] Dispatching HSM template to ${phoneNumber}: ${event.message}`);
    return {
      id: `log-wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventId: event.id,
      recipientUserId: event.recipientUserId,
      channel: 'WHATSAPP',
      providerName: this.name,
      providerRefId: `wamid.HBgL${Date.now()}`,
      status: 'DELIVERED',
      sentAt: timestamp,
      deliveredAt: timestamp,
    };
  }
}

class MockSMSAdapter implements SMSNotificationAdapter {
  name = 'Twilio / Fast2SMS DLT SMS Gateway';
  async sendSMS(event: NotificationEvent, phoneNumber: string = '+91 98765 43210'): Promise<DeliveryLog> {
    const timestamp = new Date().toISOString();
    console.log(`[SMS ADAPTER] Dispatching DLT SMS to ${phoneNumber}: ${event.message}`);
    return {
      id: `log-sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventId: event.id,
      recipientUserId: event.recipientUserId,
      channel: 'SMS',
      providerName: this.name,
      providerRefId: `sms_sid_${Date.now()}`,
      status: 'DELIVERED',
      sentAt: timestamp,
      deliveredAt: timestamp,
    };
  }
}

class MockEmailAdapter implements EmailNotificationAdapter {
  name = 'SendGrid / AWS SES Email Gateway';
  async sendEmail(event: NotificationEvent, emailAddress: string = 'resident@aarizo.com'): Promise<DeliveryLog> {
    const timestamp = new Date().toISOString();
    console.log(`[EMAIL ADAPTER] Sending HTML template to ${emailAddress}: ${event.title}`);
    return {
      id: `log-email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventId: event.id,
      recipientUserId: event.recipientUserId,
      channel: 'EMAIL',
      providerName: this.name,
      providerRefId: `sg_msg_id_${Date.now()}`,
      status: 'DELIVERED',
      sentAt: timestamp,
      deliveredAt: timestamp,
    };
  }
}

const DEFAULT_PREFERENCES: Record<NotificationCategory, { inApp: boolean; push: boolean; whatsapp: boolean; sms: boolean; email: boolean }> = {
  SECURITY: { inApp: true, push: true, whatsapp: true, sms: true, email: true },
  EMERGENCY: { inApp: true, push: true, whatsapp: true, sms: true, email: true },
  BILLING: { inApp: true, push: true, whatsapp: true, sms: false, email: true },
  MAINTENANCE: { inApp: true, push: true, whatsapp: true, sms: false, email: false },
  COMMUNITY: { inApp: true, push: false, whatsapp: false, sms: false, email: false },
  COMPLIANCE: { inApp: true, push: true, whatsapp: true, sms: false, email: true },
};

class MultiChannelNotificationService {
  private inAppAdapter: InAppNotificationAdapter = new MockInAppAdapter();
  private pushAdapter: PushNotificationAdapter = new MockPushAdapter();
  private whatsAppAdapter: WhatsAppNotificationAdapter = new MockWhatsAppAdapter();
  private smsAdapter: SMSNotificationAdapter = new MockSMSAdapter();
  private emailAdapter: EmailNotificationAdapter = new MockEmailAdapter();

  private getStoredEvents(): NotificationEvent[] {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIF_EVENTS);
    if (!raw) {
      const seed = this.generateSeedEvents();
      localStorage.setItem(STORAGE_KEY_NOTIF_EVENTS, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveEvents(events: NotificationEvent[]) {
    localStorage.setItem(STORAGE_KEY_NOTIF_EVENTS, JSON.stringify(events));
  }

  private getStoredLogs(): DeliveryLog[] {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIF_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveLogs(logs: DeliveryLog[]) {
    localStorage.setItem(STORAGE_KEY_NOTIF_LOGS, JSON.stringify(logs));
  }

  public getPreferences(userId: string): NotificationPreference {
    const raw = localStorage.getItem(`${STORAGE_KEY_NOTIF_PREFS}_${userId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const defaultPref: NotificationPreference = {
      userId,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      categories: DEFAULT_PREFERENCES,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_KEY_NOTIF_PREFS}_${userId}`, JSON.stringify(defaultPref));
    return defaultPref;
  }

  public updatePreferences(pref: NotificationPreference): NotificationPreference {
    const updated = { ...pref, updatedAt: new Date().toISOString() };
    localStorage.setItem(`${STORAGE_KEY_NOTIF_PREFS}_${pref.userId}`, JSON.stringify(updated));
    realTimeSync.publish('NOTIFICATIONS_UPDATED', { userId: pref.userId });
    return updated;
  }

  public async dispatchEvent(
    data: Omit<NotificationEvent, 'id' | 'createdAt'>,
    recipientContact?: { phone?: string; email?: string }
  ): Promise<NotificationItemWithLogs> {
    const timestamp = new Date().toISOString();
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const event: NotificationEvent = {
      ...data,
      id: eventId,
      createdAt: timestamp,
    };

    // Store Event
    const events = this.getStoredEvents();
    events.unshift(event);
    this.saveEvents(events);

    // Fetch User Preferences
    const prefs = this.getPreferences(event.recipientUserId);
    const categoryPref = prefs.categories[event.category] || DEFAULT_PREFERENCES.SECURITY;

    const deliveryLogs: DeliveryLog[] = [];

    // Critical Override Rule: EMERGENCY and VISITOR_ARRIVAL bypass muted preferences
    const isOverride = event.isCritical || event.category === 'EMERGENCY' || event.eventType === 'VISITOR_ARRIVAL';

    // 1. IN_APP Channel
    if (isOverride || categoryPref.inApp) {
      const log = await this.inAppAdapter.sendInApp(event);
      deliveryLogs.push(log);
    }

    // 2. PUSH Channel
    if (isOverride || categoryPref.push) {
      const log = await this.pushAdapter.sendPush(event);
      deliveryLogs.push(log);
    }

    // 3. WHATSAPP Channel
    if (isOverride || categoryPref.whatsapp) {
      const log = await this.whatsAppAdapter.sendWhatsApp(event, recipientContact?.phone || '+91 98765 43210');
      deliveryLogs.push(log);
    }

    // 4. SMS Channel
    if (isOverride || categoryPref.sms) {
      const log = await this.smsAdapter.sendSMS(event, recipientContact?.phone || '+91 98765 43210');
      deliveryLogs.push(log);
    }

    // 5. EMAIL Channel
    if (isOverride || categoryPref.email) {
      const log = await this.emailAdapter.sendEmail(event, recipientContact?.email || 'resident@aarizo.com');
      deliveryLogs.push(log);
    }

    // Save Delivery Logs
    const existingLogs = this.getStoredLogs();
    this.saveLogs([...deliveryLogs, ...existingLogs]);

    realTimeSync.publish('NOTIFICATIONS_UPDATED', { eventId: event.id, recipientUserId: event.recipientUserId });

    return {
      ...event,
      isRead: false,
      deliveryLogs,
    };
  }

  public getNotificationsForUser(userId: string): NotificationItemWithLogs[] {
    const events = this.getStoredEvents().filter(e => e.recipientUserId === userId || e.recipientUserId === 'ALL');
    const logs = this.getStoredLogs();

    return events.map(evt => {
      const eventLogs = logs.filter(l => l.eventId === evt.id);
      const isRead = eventLogs.some(l => l.readAt !== undefined);
      const readAt = eventLogs.find(l => l.readAt !== undefined)?.readAt;

      return {
        ...evt,
        isRead,
        readAt,
        deliveryLogs: eventLogs,
      };
    });
  }

  public getDeliveryLogsForEvent(eventId: string): DeliveryLog[] {
    return this.getStoredLogs().filter(l => l.eventId === eventId);
  }

  public markAsRead(eventId: string, userId: string): void {
    const logs = this.getStoredLogs();
    const timestamp = new Date().toISOString();
    let updated = false;

    logs.forEach(l => {
      if (l.eventId === eventId && !l.readAt) {
        l.readAt = timestamp;
        l.status = 'READ';
        updated = true;
      }
    });

    if (updated) {
      this.saveLogs(logs);
      realTimeSync.publish('NOTIFICATIONS_UPDATED', { eventId, userId });
    }
  }

  public markAllAsRead(userId: string): void {
    const userEvents = this.getStoredEvents().filter(e => e.recipientUserId === userId);
    const userEventIds = new Set(userEvents.map(e => e.id));
    const logs = this.getStoredLogs();
    const timestamp = new Date().toISOString();

    logs.forEach(l => {
      if (userEventIds.has(l.eventId) && !l.readAt) {
        l.readAt = timestamp;
        l.status = 'READ';
      }
    });

    this.saveLogs(logs);
    realTimeSync.publish('NOTIFICATIONS_UPDATED', { userId });
  }

  private generateSeedEvents(): NotificationEvent[] {
    const now = Date.now();
    return [
      {
        id: 'evt-seed-1',
        societyId: 'soc-1',
        recipientUserId: 'res-1',
        eventType: 'VISITOR_ARRIVAL',
        category: 'SECURITY',
        title: 'Guest Arrived at Main Gate 1',
        message: 'Cab visitor Rajesh Kumar arrived for Flat A-101.',
        isCritical: true,
        linkUrl: '/resident/visitors',
        createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'evt-seed-2',
        societyId: 'soc-1',
        recipientUserId: 'res-1',
        eventType: 'PARCEL_ARRIVAL',
        category: 'SECURITY',
        title: 'Parcel Received at Security Desk',
        message: 'Amazon package #AMZ-991 arrived. Storage Locker #B4.',
        isCritical: false,
        linkUrl: '/resident/deliveries',
        createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'evt-seed-3',
        societyId: 'soc-1',
        recipientUserId: 'res-1',
        eventType: 'EMERGENCY',
        category: 'EMERGENCY',
        title: 'FIRE ALARM TEST ALERT',
        message: 'Annual sprinkler & fire alarm testing active on Tower B.',
        isCritical: true,
        linkUrl: '/resident/emergency',
        createdAt: new Date(now - 120 * 60 * 1000).toISOString(),
      },
      {
        id: 'evt-seed-4',
        societyId: 'soc-1',
        recipientUserId: 'res-1',
        eventType: 'AMC_EXPIRY',
        category: 'COMPLIANCE',
        title: 'AMC Contract Expiring (15 Days)',
        message: 'Main Elevator B1 AMC contract requires renewal before Sept 25.',
        isCritical: false,
        linkUrl: '/admin/compliance',
        createdAt: new Date(now - 300 * 60 * 1000).toISOString(),
      },
    ];
  }
}

export const multiChannelNotificationService = new MultiChannelNotificationService();
