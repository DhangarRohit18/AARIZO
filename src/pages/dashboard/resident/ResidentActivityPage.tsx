import React, { useState, useEffect } from 'react';
import {
  UserCheck, CreditCard, Wrench, Package, AlertCircle,
  Bell, Clock, Paperclip, Download,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { multiChannelNotificationService } from '../../../domains/notifications/services/multiChannelNotificationService';
import { realtimeService } from '../../../services/realtimeService';
import { AdvertisementPopup, OffersLauncherPill } from '../../../components/common/AdvertisementPopup';

const FILTERS = ['all', 'security', 'billing', 'maintenance', 'community', 'emergency'];

export const ResidentActivityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'res-1';

  const [activeFilter, setActiveFilter] = useState('all');
  const [activities, setActivities] = useState<any[]>([]);
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  const loadActivities = () => {
    const notifs = multiChannelNotificationService.getNotificationsForUser(userId);
    const mapped = notifs.map((n) => {
      let icon = Bell;
      let color = '#176B91';
      const cat = (n.category || 'COMMUNITY').toUpperCase();

      if (cat === 'SECURITY' || n.eventType === 'VISITOR_ARRIVAL') {
        icon = UserCheck;
        color = '#176B91';
      } else if (cat === 'BILLING' || n.eventType === 'PAYMENT_DUE') {
        icon = CreditCard;
        color = '#059669';
      } else if (cat === 'MAINTENANCE' || n.eventType === 'COMPLAINT_UPDATE') {
        icon = Wrench;
        color = '#D97706';
      } else if (cat === 'EMERGENCY' || n.isCritical) {
        icon = AlertCircle;
        color = '#DC2626';
      } else if (n.eventType === 'PARCEL_ARRIVAL') {
        icon = Package;
        color = '#7C3AED';
      }

      return {
        id: n.id,
        text: n.message ? `${n.title}: ${n.message}` : n.title,
        title: n.title,
        message: n.message,
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        icon,
        color,
        category: (n.category || 'community').toLowerCase(),
        attachmentUrl: n.attachmentUrl,
        attachmentName: n.attachmentName,
        isCritical: n.isCritical,
      };
    });

    setActivities(mapped);
  };

  useEffect(() => {
    loadActivities();
    const unsub = realtimeService.subscribe('*', () => {
      loadActivities();
    });
    return () => unsub();
  }, [userId]);

  const filtered = activeFilter === 'all'
    ? activities
    : activities.filter((a) => a.category === activeFilter);

  return (
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%' }}>
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 space-y-4">
        {/* ── Aarizo Gradient Header ── */}
        <div
          className="p-5 md:p-6 rounded-2xl shadow-sm text-white"
          style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>Activity Feed</h1>
          </div>
          <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
            All recent events, visitors, payments &amp; maintenance in your flat and society
          </p>
        </div>

        {/* Filter pills */}
        <div className="scroll-x flex gap-2 py-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                background: activeFilter === f ? 'var(--aarizo-navy, #083B56)' : '#ffffff',
                color: activeFilter === f ? '#fff' : 'var(--aarizo-text-secondary, #657785)',
                fontWeight: 700,
                fontSize: '0.78125rem',
                border: activeFilter === f ? '1px solid var(--aarizo-navy, #083B56)' : '1px solid var(--aarizo-border, #DCE8EF)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: 36,
                textTransform: 'capitalize',
                boxShadow: activeFilter === f ? '0 2px 8px rgba(8,59,86,0.15)' : 'none',
              }}
            >
              {f === 'all' ? 'All Activity' : f}
            </button>
          ))}
        </div>

        {/* Activity list */}
        <div>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              }}
            >
              <Bell size={36} style={{ marginBottom: '0.5rem', color: 'var(--aarizo-blue, #176B91)', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--aarizo-text-muted, #8B9AA5)', margin: 0 }}>
                No activity found in this category
              </p>
            </div>
          ) : (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(8, 59, 86, 0.04)',
              }}
            >
              {filtered.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.875rem',
                      padding: '1rem 1.25rem',
                      borderBottom: index < filtered.length - 1 ? '1px solid var(--aarizo-border-soft, #E8F1F5)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: 'var(--aarizo-light-blue, #EAF6FC)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--aarizo-text, #203746)', lineHeight: 1.4, margin: 0, fontWeight: 600 }}>
                        {item.text}
                      </p>
                      {item.attachmentUrl && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '0.375rem',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            <Paperclip size={12} />
                            <span>{item.attachmentName || 'View Attachment'}</span>
                            <Download size={11} style={{ opacity: 0.7 }} />
                          </a>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
                        <Clock size={12} style={{ color: 'var(--aarizo-text-muted, #8B9AA5)' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--aarizo-text-muted, #8B9AA5)', fontWeight: 600 }}>
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Offers Pill Launcher & Popup */}
      <OffersLauncherPill onOpen={() => setIsOffersOpen(true)} />
      <AdvertisementPopup
        forceOpen={isOffersOpen}
        onClose={() => setIsOffersOpen(false)}
        societyId={currentUser?.societyId || 'soc-gvs'}
      />
    </div>
  );
};

export default ResidentActivityPage;
