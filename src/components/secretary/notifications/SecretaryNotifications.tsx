import React, { useState } from 'react';
import { Bell, AlertCircle, Calendar, ShieldAlert } from 'lucide-react';
import '../secretary.css';

interface SecretaryNotificationItem {
  id: string;
  title: string;
  category: 'Complaint' | 'Amenity' | 'Security' | 'Maintenance';
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'normal';
}

const INITIAL_NOTIFICATIONS: SecretaryNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Plumbing Helpdesk Ticket (#TICK-8042)',
    category: 'Complaint',
    description: 'Flat B-1204 (Sarvesh Kulkarni) submitted a complaint regarding main pipe leakage in bathroom.',
    timestamp: '15 mins ago',
    isRead: false,
    priority: 'high',
  },
  {
    id: 'notif-2',
    title: 'Clubhouse Hall Amenity Booking Request',
    category: 'Amenity',
    description: 'Flat A-304 requested Clubhouse Hall booking for Birthday Party on 20th Sept.',
    timestamp: '1 hour ago',
    isRead: false,
    priority: 'normal',
  },
  {
    id: 'notif-3',
    title: 'Overnight Gate Pass Alert',
    category: 'Security',
    description: 'Main Gate reported guest vehicle MH-12-AB-4092 overstaying visitor slot.',
    timestamp: '3 hours ago',
    isRead: true,
    priority: 'normal',
  },
  {
    id: 'notif-4',
    title: 'Monthly Maintenance Invoice Dispatched',
    category: 'Maintenance',
    description: 'September 2026 Maintenance invoices dispatched to 128 society flats.',
    timestamp: 'Yesterday',
    isRead: true,
    priority: 'normal',
  },
];

export const SecretaryNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<SecretaryNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const filteredNotifs = notifications.filter((item) => {
    if (activeFilter === 'UNREAD') return !item.isRead;
    return true;
  });

  return (
    <div>
      <div className="section-heading-row">
        <h3 className="section-title">Society Notifications Hub</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-auth-text ${activeFilter === 'ALL' ? 'pill-active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => setActiveFilter('ALL')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`btn-auth-text ${activeFilter === 'UNREAD' ? 'pill-active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            onClick={() => setActiveFilter('UNREAD')}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>
      </div>

      {filteredNotifs.map((item) => (
        <div
          key={item.id}
          className="activity-card"
          style={{
            background: item.isRead ? '#ffffff' : '#f0f9ff',
            borderColor: item.isRead ? '#e2e8f0' : '#bae6fd',
          }}
        >
          <div
            className="activity-icon-box"
            style={{
              background: item.category === 'Complaint' ? '#fff1f2' : item.category === 'Security' ? '#fffbe6' : '#eff6ff',
              color: item.category === 'Complaint' ? '#e11d48' : item.category === 'Security' ? '#d97706' : '#2563eb',
            }}
          >
            {item.category === 'Complaint' && <AlertCircle size={20} />}
            {item.category === 'Amenity' && <Calendar size={20} />}
            {item.category === 'Security' && <ShieldAlert size={20} />}
            {item.category === 'Maintenance' && <Bell size={20} />}
          </div>

          <div className="activity-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 className="activity-title">{item.title}</h4>
              {!item.isRead && (
                <button
                  className="btn-auth-text"
                  style={{ fontSize: '0.6875rem', color: '#2563eb', padding: '0 0.2rem' }}
                  onClick={() => handleMarkRead(item.id)}
                >
                  Mark read
                </button>
              )}
            </div>

            <p className="activity-subtext">{item.description}</p>
            <div className="activity-meta">
              {item.category} • {item.timestamp}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
