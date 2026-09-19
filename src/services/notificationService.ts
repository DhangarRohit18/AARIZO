import type {
  NotificationItem,
  NotificationEventType,
  NotificationCategory,
  PushNotificationAdapter,
  EmailNotificationAdapter,
  SMSNotificationAdapter
} from '../types/notification';
import { notificationRepository } from '../repositories/notifications/NotificationRepository';

const NOTIFICATIONS_STORAGE_KEY = 'communityos_notifications';

// Pluggable Channel Adapters Implementation
class MockPushAdapter implements PushNotificationAdapter {
  name = 'FCM / WebPush Adapter (Ready)';
  async sendPush(token: string, title: string, body: string): Promise<boolean> {
    console.log(`[PUSH ADAPTER] Dispatching to token ${token}: ${title} - ${body}`);
    return true;
  }
}

class MockEmailAdapter implements EmailNotificationAdapter {
  name = 'SendGrid / AWS SES Email Adapter (Ready)';
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    console.log(`[EMAIL ADAPTER] Sending email to ${to}: ${subject} | Content snippet: ${htmlContent.substring(0, 30)}...`);
    return true;
  }
}

class MockSMSAdapter implements SMSNotificationAdapter {
  name = 'Twilio / Fast2SMS Adapter (Ready)';
  async sendSMS(phone: string, text: string): Promise<boolean> {
    console.log(`[SMS ADAPTER] Sending SMS to ${phone}: ${text}`);
    return true;
  }
}

const SEED_NOTIFICATIONS: Omit<NotificationItem, 'societyId'>[] = [
  {
    id: 'notif-1',
    recipientUserId: 'res-1',
    eventType: 'VISITOR_ARRIVAL',
    category: 'SECURITY',
    title: 'Guest Arrived at Main Gate',
    message: 'Visitor Rajesh Kumar (Cab Visit) has arrived at Main Gate 1 for Flat A-101.',
    isRead: false,
    linkUrl: '/resident/visitors',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    channelStatuses: { inApp: true, push: 'ADAPTER_READY', email: 'ADAPTER_READY', sms: 'ADAPTER_READY' }
  },
  {
    id: 'notif-2',
    recipientUserId: 'res-1',
    eventType: 'PAYMENT_DUE',
    category: 'BILLING',
    title: 'Monthly Society Maintenance Bill Due',
    message: 'Maintenance bill #INV-2026-009 (₹4,500) is due on Sept 25, 2026.',
    isRead: false,
    linkUrl: '/resident/billing',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    channelStatuses: { inApp: true, push: 'ADAPTER_READY', email: 'ADAPTER_READY', sms: 'ADAPTER_READY' }
  },
  {
    id: 'notif-3',
    recipientUserId: 'res-1',
    eventType: 'WORKER_ENTRY',
    category: 'SECURITY',
    title: 'Domestic Worker Checked In',
    message: 'Sunita Devi (Maid / Caretaker) checked in at Gate 1 at 07:15 AM.',
    isRead: true,
    linkUrl: '/resident/domestic-help',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    channelStatuses: { inApp: true, push: 'ADAPTER_READY', email: 'ADAPTER_READY', sms: 'ADAPTER_READY' }
  },
  {
    id: 'notif-4',
    recipientUserId: 'res-1',
    eventType: 'ANNOUNCEMENT',
    category: 'COMMUNITY',
    title: 'New Announcement: Annual General Meeting',
    message: 'Managing Committee posted an update regarding AGM 2026.',
    isRead: true,
    linkUrl: '/resident/community',
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    channelStatuses: { inApp: true, push: 'ADAPTER_READY', email: 'ADAPTER_READY', sms: 'ADAPTER_READY' }
  }
];

type NotificationListener = () => void;

class NotificationService {
  private pushAdapter: PushNotificationAdapter = new MockPushAdapter();
  private emailAdapter: EmailNotificationAdapter = new MockEmailAdapter();
  private smsAdapter: SMSNotificationAdapter = new MockSMSAdapter();

  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  getNotifications(societyId: string, recipientUserId?: string): NotificationItem[] {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    let items: NotificationItem[] = raw ? JSON.parse(raw) : [];

    const societyItems = items.filter(n => n.societyId === societyId);
    if (societyItems.length === 0) {
      const seeded = SEED_NOTIFICATIONS.map(n => ({ ...n, societyId }));
      items = [...items, ...seeded];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
      return seeded;
    }

    if (recipientUserId) {
      return societyItems.filter(n => n.recipientUserId === recipientUserId || n.recipientUserId === 'ALL_RESIDENTS');
    }
    return societyItems;
  }

  getUnreadCount(societyId: string, recipientUserId?: string): number {
    return this.getNotifications(societyId, recipientUserId).filter(n => !n.isRead).length;
  }

  markAsRead(societyId: string, notificationId: string): NotificationItem {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    let items: NotificationItem[] = raw ? JSON.parse(raw) : [];

    const index = items.findIndex(n => n.id === notificationId && n.societyId === societyId);
    if (index >= 0) {
      items[index].isRead = true;
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
      this.notifyListeners();
      return items[index];
    }
    throw new Error('Notification not found');
  }

  markAllAsRead(societyId: string, recipientUserId?: string): void {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    let items: NotificationItem[] = raw ? JSON.parse(raw) : [];

    items = items.map(n => {
      if (n.societyId === societyId && (!recipientUserId || n.recipientUserId === recipientUserId || n.recipientUserId === 'ALL_RESIDENTS')) {
        return { ...n, isRead: true };
      }
      return n;
    });

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    this.notifyListeners();
  }

  // --- CENTRALIZED EVENT-DRIVEN PUBLISHER ---
  publishEvent(
    societyId: string,
    eventType: NotificationEventType,
    payload: {
      recipientUserId: string;
      title: string;
      message: string;
      linkUrl?: string;
      userPhone?: string;
      userEmail?: string;
    }
  ): NotificationItem {
    const categoryMap: Record<NotificationEventType, NotificationCategory> = {
      VISITOR_ARRIVAL: 'SECURITY',
      VISITOR_APPROVAL: 'SECURITY',
      VISITOR_REJECTION: 'SECURITY',
      VISITOR_EXIT: 'SECURITY',
      PARKING_APPROVAL: 'SECURITY',
      WORKER_ENTRY: 'SECURITY',
      DELIVERY_ARRIVAL: 'SECURITY',
      EMERGENCY_ALERT: 'EMERGENCY',
      PAYMENT_DUE: 'BILLING',
      PAYMENT_SUCCESS: 'BILLING',
      MAINTENANCE_ASSIGNMENT: 'MAINTENANCE',
      MAINTENANCE_COMPLETION: 'MAINTENANCE',
      AMENITY_BOOKING: 'COMMUNITY',
      ANNOUNCEMENT: 'COMMUNITY',
      POLL: 'COMMUNITY',
      EVENT_REMINDER: 'COMMUNITY'
    };

    const category = categoryMap[eventType] || 'SYSTEM';

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      societyId,
      recipientUserId: payload.recipientUserId,
      eventType,
      category,
      title: payload.title,
      message: payload.message,
      linkUrl: payload.linkUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
      channelStatuses: {
        inApp: true,
        push: 'ADAPTER_READY',
        email: 'ADAPTER_READY',
        sms: 'ADAPTER_READY'
      }
    };

    // Save In-App Notification
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const items: NotificationItem[] = raw ? JSON.parse(raw) : [];
    items.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));

    notificationRepository.create({
      societyId,
      eventId: newNotif.id,
      eventType: newNotif.eventType as any,
      recipientId: newNotif.recipientUserId,
      recipientPhone: payload.userPhone,
      channel: 'IN_APP',
      title: newNotif.title,
      body: newNotif.message,
      status: 'SENT',
      sentAt: newNotif.createdAt,
    }).catch(() => {});

    // Dispatch Push/Email/SMS adapters
    if (payload.userPhone) {
      this.smsAdapter.sendSMS(payload.userPhone, `${payload.title}: ${payload.message}`);
    }
    if (payload.userEmail) {
      this.emailAdapter.sendEmail(payload.userEmail, payload.title, `<p>${payload.message}</p>`);
    }
    this.pushAdapter.sendPush(`token-${payload.recipientUserId}`, payload.title, payload.message);

    this.notifyListeners();
    return newNotif;
  }
}

export const notificationService = new NotificationService();
