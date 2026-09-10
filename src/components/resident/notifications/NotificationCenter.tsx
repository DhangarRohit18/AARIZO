import React, { useState } from 'react';
import { usePrototype } from '../../../context/PrototypeContext';
import type { ResidentNotification } from '../../../domains/notifications';
import { initialMockNotifications } from '../../../mockData/notifications/notifications';
import { NotificationCard } from './NotificationCard';
import { LoadingState, EmptyState, ErrorState, Tabs } from '../../common';
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface NotificationCenterProps {
  onBackToMore: () => void;
  onNavigateToTab?: (tab: 'home' | 'visitors' | 'community' | 'payments' | 'more') => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onBackToMore,
  onNavigateToTab,
}) => {
  const { uiState } = usePrototype();

  const [notifications, setNotifications] = useState<ResidentNotification[]>(initialMockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Handle Prototype UI State
  if (uiState === 'loading') {
    return <LoadingState message="Loading notification feed..." />;
  }

  if (uiState === 'empty') {
    return (
      <div className="res-notif-container">
        <div className="res-screen-header">
          <button className="vis-back-icon-btn" onClick={onBackToMore} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="vis-screen-title">Notifications</h2>
            <p className="vis-screen-subtitle">Activity & alerts feed for Flat 1204</p>
          </div>
        </div>
        <EmptyState
          title="No Notifications"
          description="Your inbox is completely clear right now."
          icon={<Bell size={36} />}
        />
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="res-notif-container">
        <ErrorState
          title="Notification Service Offline"
          message="Simulated error fetching notification feed."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const handleMarkRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="res-notif-container">
      <div className="res-notif-header-row">
        <div className="res-notif-title-group">
          <button className="vis-back-icon-btn" onClick={onBackToMore} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="vis-screen-title">Notifications</h2>
            <p className="vis-screen-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button className="res-mark-all-btn" onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All Notifications', badge: notifications.length },
          { id: 'unread', label: 'Unread', badge: unreadCount },
        ]}
        activeTab={filter}
        onChange={(id) => setFilter(id as any)}
      />

      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="No Unread Notifications"
          description="You have read all your notifications."
          icon={<Bell size={32} />}
        />
      ) : (
        <div className="res-notif-list">
          {filteredNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onMarkRead={handleMarkRead}
              onActionClick={(route) => {
                if (route && onNavigateToTab) {
                  onNavigateToTab(route as any);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
