export type NotificationEventType =
  | 'VISITOR_ARRIVAL'
  | 'VISITOR_APPROVAL'
  | 'VISITOR_REJECTION'
  | 'VISITOR_EXIT'
  | 'PARKING_APPROVAL'
  | 'PAYMENT_DUE'
  | 'PAYMENT_SUCCESS'
  | 'MAINTENANCE_ASSIGNMENT'
  | 'MAINTENANCE_COMPLETION'
  | 'WORKER_ENTRY'
  | 'EMERGENCY_ALERT'
  | 'AMENITY_BOOKING'
  | 'DELIVERY_ARRIVAL'
  | 'ANNOUNCEMENT'
  | 'POLL'
  | 'EVENT_REMINDER';

export type NotificationCategory =
  | 'SECURITY'
  | 'BILLING'
  | 'MAINTENANCE'
  | 'COMMUNITY'
  | 'EMERGENCY'
  | 'SYSTEM';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS';

export type ChannelDispatchStatus = 'SENT' | 'PENDING' | 'ADAPTER_READY' | 'FAILED';

export interface NotificationItem {
  id: string;
  societyId: string;
  recipientUserId: string;
  recipientRole?: string;
  eventType: NotificationEventType;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
  channelStatuses: {
    inApp: boolean;
    push: ChannelDispatchStatus;
    email: ChannelDispatchStatus;
    sms: ChannelDispatchStatus;
  };
}

// Pluggable Channel Adapter Interfaces
export interface PushNotificationAdapter {
  name: string;
  sendPush(token: string, title: string, body: string): Promise<boolean>;
}

export interface EmailNotificationAdapter {
  name: string;
  sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean>;
}

export interface SMSNotificationAdapter {
  name: string;
  sendSMS(phone: string, text: string): Promise<boolean>;
}
