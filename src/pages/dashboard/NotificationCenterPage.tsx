import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Info, X, Radio, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { realtimeService } from '../../services/realtimeService';
import { NotificationEngineHub } from '../../domains/notifications';
import { apiClient } from '../../services/apiClient';

interface NotificationItem {
  id: string;
  type: 'complaint' | 'general';
  title: string;
  description: string;
  date: string;
  category: string;
  read: boolean;
}

export const NotificationCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [viewMode, setViewMode] = useState<'ALERTS' | 'ENGINE_HUB'>('ALERTS');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Load live notifications from PostgreSQL
    apiClient.getNotifications()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          const live: NotificationItem[] = list.map((n: any) => ({
            id: n.id,
            type: n.channel === 'EMERGENCY' ? 'complaint' : 'general',
            title: n.title,
            description: n.message,
            date: new Date(n.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' }),
            category: n.category || 'General',
            read: n.isRead ?? false,
          }));
          setNotifications(live);
        }
      })
      .catch((err) => console.warn('[Notifications] Live load failed:', err));

    const unsub = realtimeService.subscribe('*', (msg) => {
      let title = 'Realtime Notification';
      let description = '';
      let type: 'complaint' | 'general' = 'general';

      switch (msg.topic) {
        case 'VISITOR_ARRIVAL':
          title = 'Visitor Pass Created';
          description = `${msg.payload.visitorName} (${msg.payload.category || 'GUEST'}) scheduled for ${msg.payload.flatCode || 'society'}`;
          break;
        case 'VISITOR_ENTRY':
          title = 'Visitor Gate Check-In';
          description = `${msg.payload.visitorName} entered at ${msg.payload.gateName || 'Main Gate'} (${msg.payload.flatCode || ''})`;
          break;
        case 'VISITOR_EXIT':
          title = 'Visitor Gate Check-Out';
          description = `${msg.payload.visitorName} checked out of society (${msg.payload.flatCode || ''})`;
          break;
        case 'EMERGENCY_ALERTS':
          title = '🚨 Society Emergency Alert';
          description = msg.payload.alertType === 'GATE_LOCKDOWN'
            ? `Security Lockdown: ${msg.payload.reason}`
            : `SOS Alert: ${msg.payload.type || 'Incident'} at ${msg.payload.flatNumber || msg.payload.locationDetails || 'Society'}`;
          type = 'complaint';
          break;
        case 'WORKER_ENTRY_EXIT':
          title = `Staff Gate ${msg.payload.action === 'IN' ? 'Entry' : 'Exit'}`;
          description = `${msg.payload.workerName} (${msg.payload.workerType}) recorded ${msg.payload.action === 'IN' ? 'Entry' : 'Exit'} at ${msg.payload.timestamp || 'gate'}`;
          break;
        case 'PARKING_OCCUPANCY':
          title = `Parking Slot ${msg.payload.action === 'ENTRY' ? 'Occupied' : 'Vacated'}`;
          description = `Slot ${msg.payload.slotNumber} marked ${msg.payload.occupancyState} by vehicle ${msg.payload.vehicleNumber}`;
          break;
        case 'DELIVERY_STATUS':
          title = 'Delivery Parcel Picked Up';
          description = `Delivery for ${msg.payload.recipient} (${msg.payload.flatCode}) picked up`;
          break;
        default:
          title = `Alert: ${msg.topic}`;
          description = JSON.stringify(msg.payload);
      }

      const newNotif: NotificationItem = {
        id: msg.id || `rt-${Date.now()}`,
        type,
        title,
        description,
        date: 'Just now',
        category: type === 'complaint' ? 'Emergency' : 'Security',
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => unsub();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.read : true));

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    apiClient.markNotificationRead(id).catch(() => {});
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      {/* ── Subheader with Back Button & Unread Counter ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          padding: '1.25rem 1rem',
          paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(8, 59, 86, 0.08)',
        }}
      >
        <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
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
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Notifications</h1>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', margin: '0.125rem 0 0' }}>
                {unreadCount} unread
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 rounded-xl bg-white/15">
            <button
              onClick={() => setViewMode('ALERTS')}
              className="flex-1 sm:flex-initial"
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'ALERTS' ? '#ffffff' : 'transparent',
                color: viewMode === 'ALERTS' ? '#083B56' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <Bell size={13} /> Alerts Feed
            </button>
            <button
              onClick={() => setViewMode('ENGINE_HUB')}
              className="flex-1 sm:flex-initial"
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'ENGINE_HUB' ? '#ffffff' : 'transparent',
                color: viewMode === 'ENGINE_HUB' ? '#083B56' : '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <Radio size={13} className={viewMode === 'ENGINE_HUB' ? 'text-[#176B91]' : 'text-white'} /> Real-Time Engine Hub
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'ENGINE_HUB' ? (
        <div className="max-w-6xl mx-auto w-full px-4 pt-6">
          <NotificationEngineHub />
        </div>
      ) : (
        <>

      {/* ── Filter Pills: All / Unread ── */}
      <div className="max-w-4xl mx-auto w-full" style={{ padding: '1rem 1rem 0.5rem' }}>
        <div
          style={{
            background: '#EBF3F7',
            borderRadius: '16px',
            padding: '0.375rem',
            display: 'inline-flex',
            gap: '0.375rem',
            boxShadow: 'inset 0 1px 3px rgba(8, 59, 86, 0.06)',
          }}
        >
          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: filter === 'ALL' ? '#083B56' : '#ffffff',
              color: filter === 'ALL' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              boxShadow: filter === 'ALL' ? '0 3px 10px rgba(8, 59, 86, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: filter === 'UNREAD' ? '#083B56' : '#ffffff',
              color: filter === 'UNREAD' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              boxShadow: filter === 'UNREAD' ? '0 3px 10px rgba(8, 59, 86, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* ── Notification List (Responsive 1-col Mobile, 2-col Desktop) ── */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3 sm:p-4">
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
      </>
      )}
    </div>
  );
};

export default NotificationCenterPage;
