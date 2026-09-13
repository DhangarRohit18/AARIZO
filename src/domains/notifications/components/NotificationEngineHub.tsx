import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Smartphone,
  Mail,
  MessageSquare,
  ShieldAlert,
  Sliders,
  Send,
  RefreshCw,
  Info,
  Radio,
  CheckCheck,
  AlertTriangle,
  Clock,
  Settings,
  Layers,
} from 'lucide-react';
import { multiChannelNotificationService } from '../services/multiChannelNotificationService';
import {
  NotificationItemWithLogs,
  NotificationPreference,
  NotificationEventType,
  NotificationCategory,
  NotificationChannel,
  DeliveryLog,
} from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

export const NotificationEngineHub: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'res-1';

  const [activeTab, setActiveTab] = useState<'INBOX' | 'PREFERENCES' | 'DELIVERY_LOGS' | 'DISPATCH_SIMULATOR'>('INBOX');
  const [notifications, setNotifications] = useState<NotificationItemWithLogs[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference>(() =>
    multiChannelNotificationService.getPreferences(userId)
  );

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedEventForLogs, setSelectedEventForLogs] = useState<NotificationItemWithLogs | null>(null);

  // Dispatch Simulator Form
  const [simulatorForm, setSimulatorForm] = useState({
    eventType: 'VISITOR_ARRIVAL' as NotificationEventType,
    category: 'SECURITY' as NotificationCategory,
    title: 'Guest Arrived at Gate 1',
    message: 'Visitor Vijay Malhotra (Intercom Verification) arrived for Flat B-402.',
    isCritical: false,
    phone: currentUser?.phone || '+91 98765 43210',
    email: currentUser?.email || 'resident@aarizo.com',
  });

  const loadData = () => {
    setNotifications(multiChannelNotificationService.getNotificationsForUser(userId));
    setPreferences(multiChannelNotificationService.getPreferences(userId));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = realTimeSync.subscribe('NOTIFICATIONS_UPDATED', () => {
      loadData();
    });
    return () => unsubscribe();
  }, [userId]);

  const handleTogglePreference = (category: NotificationCategory, channel: NotificationChannel) => {
    const categoryObj = { ...preferences.categories[category] };
    const key = channel.toLowerCase() as keyof typeof categoryObj;
    categoryObj[key] = !categoryObj[key];

    const updated: NotificationPreference = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: categoryObj,
      },
    };

    setPreferences(updated);
    multiChannelNotificationService.updatePreferences(updated);
  };

  const handleSimulateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await multiChannelNotificationService.dispatchEvent(
      {
        societyId: 'soc-1',
        recipientUserId: userId,
        eventType: simulatorForm.eventType,
        category: simulatorForm.category,
        title: simulatorForm.title,
        message: simulatorForm.message,
        isCritical: simulatorForm.isCritical,
      },
      { phone: simulatorForm.phone, email: simulatorForm.email }
    );

    loadData();
    alert(`Event [${simulatorForm.eventType}] dispatched across configured provider channels.`);
  };

  const handleMarkAsRead = (eventId: string) => {
    multiChannelNotificationService.markAsRead(eventId, userId);
    loadData();
  };

  const handleMarkAllRead = () => {
    multiChannelNotificationService.markAllAsRead(userId);
    loadData();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategoryFilter !== 'ALL' && n.category !== selectedCategoryFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Radio size={24} className="animate-pulse" />
            </span>
            <h2 className="text-xl font-bold">Multi-Channel Notification Engine</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Event-driven dispatches via In-App, Push, WhatsApp, SMS & Email with preference routing.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <CheckCheck size={15} /> Mark All Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 bg-white px-4 rounded-xl shadow-sm">
        {[
          { key: 'INBOX', label: `In-App Inbox (${unreadCount} New)`, icon: Bell },
          { key: 'PREFERENCES', label: 'Channel Preferences', icon: Sliders },
          { key: 'DELIVERY_LOGS', label: 'Delivery & Provider Audit Logs', icon: Layers },
          { key: 'DISPATCH_SIMULATOR', label: 'Test Dispatch Terminal', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 font-semibold text-xs md:text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: INBOX */}
      {activeTab === 'INBOX' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Category:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium bg-white text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="SECURITY">Security & Gate</option>
                <option value="EMERGENCY">Emergency Alerts</option>
                <option value="BILLING">Billing & Payments</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="COMMUNITY">Community</option>
                <option value="COMPLIANCE">Compliance & AMC</option>
              </select>
            </div>

            <button
              onClick={loadData}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Bell size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-slate-600">No notifications in your inbox.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 transition-colors flex items-start justify-between gap-4 ${
                    notif.isRead ? 'bg-white' : 'bg-indigo-50/30'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {!notif.isRead && <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {notif.eventType}
                      </span>
                      {notif.isCritical && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                          <AlertTriangle size={11} /> CRITICAL SAFETY OVERRIDE
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{notif.title}</h4>
                    <p className="text-sm text-slate-600">{notif.message}</p>

                    {/* Delivery Log Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-[11px] text-slate-400 font-medium">Dispatched via:</span>
                      {notif.deliveryLogs.map((log) => (
                        <span
                          key={log.id}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md flex items-center gap-1"
                        >
                          <CheckCircle2 size={10} /> {log.channel}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedEventForLogs(notif);
                        setActiveTab('DELIVERY_LOGS');
                      }}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Audit Logs ({notif.deliveryLogs.length})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: PREFERENCES */}
      {activeTab === 'PREFERENCES' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Resident Multi-Channel Notification Matrix</h3>
            <p className="text-xs text-slate-500">
              Customize which delivery adapters dispatch notifications for each category.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldAlert size={14} className="text-amber-700" /> Safety & Emergency Override Rule:
            </div>
            <p>
              Critical alerts (e.g. Fire Alarm, Visitor Arrival, Child Gate Scan) will automatically override muted channel toggles to ensure high-priority delivery.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] border-b">
                <tr>
                  <th className="py-3 px-4">Event Category</th>
                  <th className="py-3 px-4 text-center">In-App</th>
                  <th className="py-3 px-4 text-center">Push (FCM)</th>
                  <th className="py-3 px-4 text-center">WhatsApp</th>
                  <th className="py-3 px-4 text-center">SMS</th>
                  <th className="py-3 px-4 text-center">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {(['SECURITY', 'EMERGENCY', 'BILLING', 'MAINTENANCE', 'COMMUNITY', 'COMPLIANCE'] as NotificationCategory[]).map(
                  (cat) => {
                    const row = preferences.categories[cat] || {
                      inApp: true,
                      push: true,
                      whatsapp: true,
                      sms: false,
                      email: false,
                    };
                    return (
                      <tr key={cat} className="hover:bg-slate-50">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {cat}
                          {cat === 'EMERGENCY' && (
                            <span className="block text-[10px] text-rose-600 font-normal">System Override Active</span>
                          )}
                        </td>
                        {(['IN_APP', 'PUSH', 'WHATSAPP', 'SMS', 'EMAIL'] as NotificationChannel[]).map((chan) => {
                          const key = chan.toLowerCase() as keyof typeof row;
                          const isChecked = row[key];
                          return (
                            <td key={chan} className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePreference(cat, chan)}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: DELIVERY LOGS */}
      {activeTab === 'DELIVERY_LOGS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Provider Delivery & Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Per-channel dispatch status tracking (Sent, Delivered, Failed, Read).
              </p>
            </div>
            {selectedEventForLogs && (
              <button
                onClick={() => setSelectedEventForLogs(null)}
                className="px-3 py-1 bg-slate-100 text-xs font-semibold rounded-lg text-slate-700"
              >
                Clear Selected Event Filter
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications
              .filter((n) => !selectedEventForLogs || n.id === selectedEventForLogs.id)
              .map((event) => (
                <div key={event.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {event.eventType}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{event.title}</h4>
                      <p className="text-xs text-slate-500">{event.message}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{new Date(event.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Channel Dispatch Logs</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {event.deliveryLogs.map((log) => (
                        <div key={log.id} className="p-2.5 bg-white border rounded-lg text-xs space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-indigo-600 flex items-center gap-1">
                              {log.channel === 'WHATSAPP' && <MessageSquare size={12} />}
                              {log.channel === 'SMS' && <Smartphone size={12} />}
                              {log.channel === 'EMAIL' && <Mail size={12} />}
                              {log.channel === 'PUSH' && <Radio size={12} />}
                              {log.channel === 'IN_APP' && <Bell size={12} />}
                              {log.channel}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                              {log.status}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px]">Provider: {log.providerName}</div>
                          <div className="text-slate-400 text-[10px] font-mono">Ref: {log.providerRefId}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 4: DISPATCH SIMULATOR */}
      {activeTab === 'DISPATCH_SIMULATOR' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Notification Event Dispatch Terminal</h3>
            <p className="text-xs text-slate-500">Simulate business events and observe multi-channel routing.</p>
          </div>

          <form onSubmit={handleSimulateDispatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                <select
                  value={simulatorForm.eventType}
                  onChange={(e) =>
                    setSimulatorForm({
                      ...simulatorForm,
                      eventType: e.target.value as NotificationEventType,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                >
                  <option value="VISITOR_ARRIVAL">VISITOR_ARRIVAL</option>
                  <option value="PARCEL_ARRIVAL">PARCEL_ARRIVAL</option>
                  <option value="COMPLAINT_UPDATE">COMPLAINT_UPDATE</option>
                  <option value="SLA_BREACH">SLA_BREACH</option>
                  <option value="PAYMENT_DUE">PAYMENT_DUE</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                  <option value="AMC_EXPIRY">AMC_EXPIRY</option>
                  <option value="WORKER_ENTRY">WORKER_ENTRY</option>
                  <option value="UTILITY_OUTAGE">UTILITY_OUTAGE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={simulatorForm.category}
                  onChange={(e) =>
                    setSimulatorForm({
                      ...simulatorForm,
                      category: e.target.value as NotificationCategory,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                >
                  <option value="SECURITY">SECURITY</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                  <option value="BILLING">BILLING</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="COMMUNITY">COMMUNITY</option>
                  <option value="COMPLIANCE">COMPLIANCE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={simulatorForm.title}
                onChange={(e) => setSimulatorForm({ ...simulatorForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Payload</label>
              <textarea
                required
                rows={3}
                value={simulatorForm.message}
                onChange={(e) => setSimulatorForm({ ...simulatorForm, message: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCritical"
                checked={simulatorForm.isCritical}
                onChange={(e) => setSimulatorForm({ ...simulatorForm, isCritical: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="isCritical" className="text-xs font-semibold text-rose-700 cursor-pointer">
                Mark as Critical Safety/Security Override (Bypasses muted channel preferences)
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-indigo-500 flex items-center gap-2"
              >
                <Send size={14} /> Dispatch Event Now
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
