export type NotificationChannel = 'PUSH' | 'WHATSAPP' | 'SMS' | 'IN_APP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

// A standardized list of business events that can trigger notifications
export type NotificationEvent = 
  | 'GATEPASS_CREATED' 
  | 'PARCEL_RECEIVED' 
  | 'PARCEL_PICKUP' 
  | 'COMPLAINT_CREATED' 
  | 'COMPLAINT_ESCALATED' 
  | 'COMPLAINT_RESOLVED' 
  | 'REQUEST_APPROVED' 
  | 'REQUEST_REJECTED' 
  | 'AMC_EXPIRING' 
  | 'UTILITY_OUTAGE' 
  | 'EMERGENCY' 
  | 'ATTENDANCE_CHECKIN';

export interface NotificationRecord {
  id: string; // Guaranteed unique by Firebase
  societyId: string;
  eventId: string; // Unique idempotency key (e.g. "complaint_123_escalation") to prevent duplicate sends
  eventType: NotificationEvent;
  recipientId: string; // UID of Resident/Guard/Staff
  recipientPhone?: string; 
  channel: NotificationChannel;
  title: string;
  body: string;
  dataPayload?: Record<string, any>; // Used for deep linking in Push/In-App
  status: NotificationStatus;
  sentAt?: string; // ISO
  deliveredAt?: string; // ISO
  failureReason?: string;
  createdAt: string; // ISO
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
