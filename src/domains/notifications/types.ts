// Notifications Domain Types for CommunityOS

export type NotificationCategory =
  | 'visitor'
  | 'payment'
  | 'maintenance'
  | 'announcement'
  | 'security'
  | 'system';

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
