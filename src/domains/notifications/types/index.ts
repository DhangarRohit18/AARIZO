export type NotificationChannel = 'PUSH' | 'WHATSAPP' | 'SMS' | 'IN_APP' | 'EMAIL';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';

// A standardized list of business events that can trigger notifications
export type NotificationEvent = 
  | 'GATEPASS_CREATED' 
  | 'PARCEL_RECEIVED' 
  | 'PARCEL_PICKUP' 
  | 'PARCEL_ARRIVAL'
  | 'VISITOR_ARRIVAL'
  | 'COMPLAINT_CREATED' 
  | 'COMPLAINT_ESCALATED' 
  | 'COMPLAINT_RESOLVED' 
  | 'COMPLAINT_UPDATE'
  | 'SLA_BREACH'
  | 'PAYMENT_DUE'
  | 'REQUEST_APPROVED' 
  | 'REQUEST_REJECTED' 
  | 'AMC_EXPIRING' 
  | 'AMC_EXPIRY'
  | 'WORKER_ENTRY'
  | 'UTILITY_OUTAGE' 
  | 'EMERGENCY' 
  | 'ATTENDANCE_CHECKIN'
  | (string & {});

export type NotificationEventType = NotificationEvent;

export type NotificationCategory =
  | 'visitor'
  | 'payment'
  | 'maintenance'
  | 'announcement'
  | 'security'
  | 'system'
  | 'SECURITY'
  | 'EMERGENCY'
  | 'BILLING'
  | 'MAINTENANCE'
  | 'COMMUNITY'
  | 'COMPLIANCE'
  | (string & {});

export interface DeliveryLog {
  id: string;
  eventId: string;
  recipientUserId?: string;
  channel: NotificationChannel;
  providerName: string;
  providerRefId: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
}

export interface NotificationRecord {
  id: string; // Guaranteed unique by Firebase
  societyId: string;
  eventId?: string; // Unique idempotency key (e.g. "complaint_123_escalation") to prevent duplicate sends
  eventType: NotificationEventType;
  recipientId?: string; // UID of Resident/Guard/Staff
  recipientUserId?: string;
  recipientPhone?: string; 
  channel?: NotificationChannel;
  category?: NotificationCategory;
  title: string;
  body?: string;
  message?: string;
  isCritical?: boolean;
  linkUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  dataPayload?: Record<string, any>; // Used for deep linking in Push/In-App
  status?: NotificationStatus;
  sentAt?: string; // ISO
  deliveredAt?: string; // ISO
  failureReason?: string;
  createdAt: string; // ISO
}

export interface NotificationItemWithLogs extends NotificationRecord {
  isRead: boolean;
  readAt?: string;
  deliveryLogs: DeliveryLog[];
}

export interface ChannelPreferences {
  inApp: boolean;
  push: boolean;
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
}

export interface NotificationPreference {
  userId: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  categories: Record<string, ChannelPreferences>;
  updatedAt: string;
}

export interface InAppNotificationAdapter {
  name: string;
  sendInApp(event: NotificationRecord): Promise<DeliveryLog>;
}

export interface PushNotificationAdapter {
  name: string;
  sendPush(event: NotificationRecord, deviceToken?: string): Promise<DeliveryLog>;
}

export interface WhatsAppNotificationAdapter {
  name: string;
  sendWhatsApp(event: NotificationRecord, phoneNumber?: string): Promise<DeliveryLog>;
}

export interface SMSNotificationAdapter {
  name: string;
  sendSMS(event: NotificationRecord, phoneNumber?: string): Promise<DeliveryLog>;
}

export interface EmailNotificationAdapter {
  name: string;
  sendEmail(event: NotificationRecord, emailAddress?: string): Promise<DeliveryLog>;
}

export interface NotificationPayload {
  societyId: string;
  eventId: string;
  eventType: NotificationEvent;
  recipientId: string;
  recipientPhone?: string;
  channels: NotificationChannel[];
  title: string;
  body: string;
  dataPayload?: Record<string, any>;
}

export interface ResidentNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRoute?: string;
  actionLabel?: string;
}
