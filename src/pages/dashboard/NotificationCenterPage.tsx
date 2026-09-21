import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  type: 'complaint' | 'general';
  title: string;
  description: string;
  date: string;
  category: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'complaint',
    title: 'New Complaint Submitted',
    description: 'New Complaint — Light cut',
    date: '25 Aug',
    category: 'Complaint',
    read: false,
  },
  {
    id: '2',
    type: 'complaint',
    title: 'New Complaint Submitted',
    description: 'New Complaint — Leaking water in a bathroom',
    date: '25 Aug',
    category: 'Complaint',
    read: false,
  },
  {
    id: '3',
    type: 'general',
    title: 'New Amenity Booking Request',
    description: 'New Amenity Booking Request — Club house',
    date: '24 Aug',
    category: 'General',
    read: true,
  },
  {
    id: '4',
    type: 'complaint',
    title: 'New Complaint Submitted',
    description: 'New Complaint — Vvvvvv',
    date: '24 Aug',
    category: 'Complaint',
    read: false,
  },
  {
    id: '5',
    type: 'complaint',
    title: 'New Complaint Submitted',
    description: 'New Complaint — Roni',
    date: '21 Aug',
    category: 'Complaint',
    read: true,
  },
  {
    id: '6',
    type: 'complaint',
    title: 'New Complaint Submitted',
    description: 'New Complaint — Èeeeee',
    date: '21 Aug',
    category: 'Complaint',
    read: true,
  },
  {
    id: '7',
    type: 'complaint',
    title: 'New Complaint Submitted',
    description: 'New Complaint — Pppppp',
    date: '21 Aug',
    category: 'Complaint',
    read: true,
  },
];

export const NotificationCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.read : true));

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: '2rem' }}>
      {/* ── Subheader with Back Button & Unread Counter ── */}
      <div
        style={{
          background: 'var(--aarizo-navy, #083B56)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          color: '#ffffff',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Go Back"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Notifications</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.72)', margin: '0.125rem 0 0' }}>
            {unreadCount} unread
          </p>
        </div>
      </div>

      {/* ── Filter Pills: All / Unread (Screenshot match) ── */}
      <div style={{ padding: '1rem 1rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '0.4rem 1.1rem',
            borderRadius: '9999px',
            border: filter === 'ALL' ? '1px solid var(--aarizo-navy, #083B56)' : '1px solid var(--aarizo-border, #DCE8EF)',
            background: filter === 'ALL' ? '#ffffff' : 'transparent',
            color: filter === 'ALL' ? 'var(--aarizo-navy, #083B56)' : 'var(--aarizo-text-secondary, #657785)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '0.4rem 1.1rem',
            borderRadius: '9999px',
            border: filter === 'UNREAD' ? '1px solid var(--aarizo-navy, #083B56)' : '1px solid var(--aarizo-border, #DCE8EF)',
            background: filter === 'UNREAD' ? '#ffffff' : 'transparent',
            color: filter === 'UNREAD' ? 'var(--aarizo-navy, #083B56)' : 'var(--aarizo-text-secondary, #657785)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          Unread
        </button>
      </div>

      {/* ── Notification List (Exact Screenshot Match) ── */}
      <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((item) => {
          const isComplaint = item.type === 'complaint';
          const iconBg = isComplaint ? '#FFF0F1' : '#EDF8F0';
          const iconColor = isComplaint ? '#D9535B' : '#3F8F58';
          const badgeBg = isComplaint ? '#FFF0F1' : '#EDF8F0';
          const badgeColor = isComplaint ? '#D9535B' : '#3F8F58';

          return (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                padding: '0.875rem 1rem',
                boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                position: 'relative',
              }}
            >
              {/* Circular status icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {isComplaint ? <AlertCircle size={18} /> : <Info size={18} />}
              </div>

              {/* Text content */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--aarizo-text, #203746)', margin: 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.25rem 0 0.5rem', lineHeight: 1.4 }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: badgeColor,
                      background: badgeBg,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)' }}>
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(item.id)}
                aria-label="Dismiss Notification"
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationCenterPage;
