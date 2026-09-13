import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem, NotificationCategory, NotificationEventType } from '../../types/notification';
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Wrench,
  Users,
  AlertTriangle,
  Send,
  Sparkles,
  Inbox
} from 'lucide-react';

const CATEGORIES: { key: NotificationCategory | 'ALL'; label: string; icon: any }[] = [
  { key: 'ALL', label: 'All Notifications', icon: Bell },
  { key: 'SECURITY', label: 'Security & Gate', icon: ShieldCheck },
  { key: 'BILLING', label: 'Billing & Payments', icon: CreditCard },
  { key: 'MAINTENANCE', label: 'Maintenance & Operations', icon: Wrench },
  { key: 'COMMUNITY', label: 'Community & Events', icon: Users },
  { key: 'EMERGENCY', label: 'Emergency Alerts', icon: AlertTriangle }
];

export const NotificationCenterPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const userId = currentUser?.id || 'res-1';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'ALL'>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    loadData();
    const unsubscribe = notificationService.subscribe(loadData);
    return () => unsubscribe();
  }, [societyId, userId]);

  const loadData = () => {
    setNotifications(notificationService.getNotifications(societyId, userId));
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(societyId, id);
    loadData();
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(societyId, userId);
    loadData();
  };

  // Demo Event Dispatcher Trigger for Testing
  const handleTestPublish = (eventType: NotificationEventType, title: string, message: string) => {
    notificationService.publishEvent(societyId, eventType, {
      recipientUserId: userId,
      title,
      message,
      userPhone: currentUser?.phone,
      userEmail: 'user@example.com'
    });
  };

  const filtered = notifications.filter(n => {
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    if (unreadOnly && n.isRead) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Real-Time Notification Center</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Centralized event-driven notifications across In-App, Push-ready, Email-ready, and SMS-ready channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Demo Event Dispatcher Panel */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Event-Driven Notification Service Simulator
          </h3>
          <span className="text-[11px] text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
            Multi-Channel Adapter Engine Active
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Click any event trigger below to publish a system event through the centralized notification service:
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTestPublish('VISITOR_ARRIVAL', 'Guest Arrived: Priya Singh', 'Visitor Priya Singh is waiting at Gate 1.')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 rounded-lg border border-slate-700 flex items-center gap-1"
          >
            <Send className="w-3 h-3" /> Test Visitor Arrival
          </button>
          <button
            onClick={() => handleTestPublish('EMERGENCY_ALERT', '🚨 Medical Emergency Alert', 'Medical SOS triggered at Tower B Basement.')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 rounded-lg border border-slate-700 flex items-center gap-1"
          >
            <Send className="w-3 h-3" /> Test Emergency SOS
          </button>
          <button
            onClick={() => handleTestPublish('PAYMENT_DUE', 'Maintenance Bill Payment Due', 'Bill #INV-2026-092 is due for payment.')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 rounded-lg border border-slate-700 flex items-center gap-1"
          >
            <Send className="w-3 h-3" /> Test Payment Due
          </button>
          <button
            onClick={() => handleTestPublish('DELIVERY_ARRIVAL', 'Package Delivered to Gate', 'Amazon courier parcel received at Security Desk.')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 rounded-lg border border-slate-700 flex items-center gap-1"
          >
            <Send className="w-3 h-3" /> Test Delivery Package
          </button>
        </div>
      </div>

      {/* Categories & Unread Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={e => setUnreadOnly(e.target.checked)}
            className="rounded text-indigo-600"
          />
          Show Unread Only ({unreadCount})
        </label>
      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No notifications found</p>
            <p className="text-xs text-slate-400">You're all caught up with your society updates!</p>
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                !notif.isRead ? 'bg-indigo-50/40 border-indigo-200' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  notif.category === 'SECURITY' ? 'bg-indigo-100 text-indigo-700' :
                  notif.category === 'EMERGENCY' ? 'bg-rose-100 text-rose-700 animate-pulse' :
                  notif.category === 'BILLING' ? 'bg-emerald-100 text-emerald-700' :
                  notif.category === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-full">
                      {notif.category}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                    )}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{notif.message}</p>
                  <p className="text-slate-400 text-[11px]">{new Date(notif.createdAt).toLocaleString()}</p>

                  {/* Multi-Channel Adapter Status Badges */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      In-App: Active
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Push: FCM Ready
                    </span>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Email: SES Ready
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      SMS: Twilio Ready
                    </span>
                  </div>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="px-3 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
