export type NotificationEventType =
  | 'VISITOR_ARRIVAL'
  | 'VISITOR_APPROVAL'
  | 'PARCEL_ARRIVAL'
  | 'PARCEL_REMINDER'
  | 'COMPLAINT_UPDATE'
  | 'SLA_BREACH'
  | 'PAYMENT_DUE'
  | 'MAINTENANCE_UPDATE'
  | 'NOC_UPDATE'
  | 'EMERGENCY'
  | 'AMC_EXPIRY'
  | 'WORKER_ENTRY'
  | 'UTILITY_OUTAGE';

export type NotificationCategory =
  | 'SECURITY'
  | 'BILLING'
  | 'MAINTENANCE'
  | 'COMMUNITY'
  | 'EMERGENCY'
  | 'COMPLIANCE';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'WHATSAPP' | 'SMS' | 'EMAIL';

export type DeliveryStatus = 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';

export interface NotificationEvent {
  id: string;
  societyId: string;
  recipientUserId: string;
  eventType: NotificationEventType;
  category: NotificationCategory;
  title: string;
  message: string;
  isCritical: boolean; // Overrides quiet hours / muted channel preferences if true
  linkUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DeliveryLog {
  id: string;
  eventId: string;
  recipientUserId: string;
  channel: NotificationChannel;
  providerName: string;
  providerRefId: string;
  status: DeliveryStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
}

export interface NotificationItemWithLogs extends NotificationEvent {
  isRead: boolean;
  readAt?: string;
  deliveryLogs: DeliveryLog[];
}

export interface CategoryChannelPreference {
  inApp: boolean;
  push: boolean;
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
}

export interface NotificationPreference {
  userId: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
  categories: Record<NotificationCategory, CategoryChannelPreference>;
  updatedAt: string;
}

// Pluggable Provider Adapter Interfaces
export interface InAppNotificationAdapter {
  name: string;
  sendInApp(event: NotificationEvent): Promise<DeliveryLog>;
}

export interface PushNotificationAdapter {
  name: string;
  sendPush(event: NotificationEvent, deviceToken?: string): Promise<DeliveryLog>;
}

export interface WhatsAppNotificationAdapter {
  name: string;
  sendWhatsApp(event: NotificationEvent, phoneNumber: string): Promise<DeliveryLog>;
}

export interface SMSNotificationAdapter {
  name: string;
  sendSMS(event: NotificationEvent, phoneNumber: string): Promise<DeliveryLog>;
}

export interface EmailNotificationAdapter {
  name: string;
  sendEmail(event: NotificationEvent, emailAddress: string): Promise<DeliveryLog>;
}
