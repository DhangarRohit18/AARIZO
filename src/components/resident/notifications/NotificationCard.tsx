import React from 'react';
import type { ResidentNotification } from '../../../domains/notifications';
import { Bell, UserCheck, CreditCard, LifeBuoy, Megaphone, ShieldAlert, Check } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface NotificationCardProps {
  notification: ResidentNotification;
  onMarkRead?: (id: string) => void;
  onActionClick?: (route?: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onActionClick,
}) => {
  const getIcon = () => {
    switch (notification.category) {
      case 'visitor':
        return <UserCheck size={18} />;
      case 'payment':
        return <CreditCard size={18} />;
      case 'maintenance':
        return <LifeBuoy size={18} />;
      case 'announcement':
        return <Megaphone size={18} />;
      case 'security':
        return <ShieldAlert size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  return (
    <div className={`res-notif-card ${!notification.isRead ? 'res-notif-unread' : ''}`}>
      <div className="res-notif-left">
        <div className="res-notif-icon-box">{getIcon()}</div>
      </div>

      <div className="res-notif-body">
        <div className="res-notif-top">
          <div className="res-notif-title-row">
            {!notification.isRead && <span className="res-unread-dot" />}
            <h4 className="res-notif-title">{notification.title}</h4>
          </div>
          <span className="res-notif-time">{notification.timestamp}</span>
        </div>

        <p className="res-notif-msg">{notification.message}</p>

        <div className="res-notif-actions">
          {notification.actionLabel && (
            <button
              className="res-notif-action-btn"
              onClick={() => onActionClick && onActionClick(notification.actionRoute)}
            >
              {notification.actionLabel}
            </button>
          )}

          {!notification.isRead && (
            <button
              className="res-notif-mark-btn"
              onClick={() => onMarkRead && onMarkRead(notification.id)}
            >
              <Check size={12} />
              <span>Mark Read</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
