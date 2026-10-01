import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Zap,
  Flame,
  Shirt,
  Car,
  UserCheck,
  Trees,
  Sparkles,
  ShoppingBag,
  Utensils,
  Package,
  Star,
  Clock,
  PlusCircle,
  Search,
  ShieldCheck,
  Building2,
  RefreshCw,
  X,
} from 'lucide-react';
import { societyServicesEngine } from '../services/societyServicesEngine';
import type { ServiceCategory, VendorPartner, ServiceItem, ServiceBookingOrder, RecurringScheduleType, OrderStatus } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { realTimeSync } from '../../../services/realTimeSync';

interface SocietyServicesHubProps {
  userRoleOverride?: string;
}

const CATEGORY_ICONS: Record<ServiceCategory, any> = {
  PLUMBER: Wrench,
  ELECTRICIAN: Zap,
  AC_REPAIR: Flame,
  APPLIANCE_REPAIR: Wrench,
  PEST_CONTROL: Sparkles,
  LAUNDRY: Shirt,
  CAR_WASH: Car,
  DRIVER: UserCheck,
  GARDENER: Trees,
  CLEANING: Sparkles,
  GROCERY: ShoppingBag,
  FOOD: Utensils,
  HOTEL_RESTAURANT: Utensils,
  COURIER: Package,
  OTHER: Package,
};

export const SocietyServicesHub: React.FC<SocietyServicesHubProps> = ({ userRoleOverride }) => {
  const { currentUser } = useAuth();
  const activeRole = (userRoleOverride || currentUser?.role || '').toLowerCase();

  const isAdmin = ['admin', 'secretary'].includes(activeRole);
  const isVendor = ['vendor'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_ORDERS' | 'VENDOR_DIRECTORY' | 'VENDOR_PORTAL' | 'ADMIN_APPROVALS'>('MARKETPLACE');
  const [vendors, setVendors] = useState<VendorPartner[]>(() => societyServicesEngine.getVendors());
  const [items, setItems] = useState<ServiceItem[]>(() => societyServicesEngine.getServiceItems());
  const [orders, setOrders] = useState<ServiceBookingOrder[]>(() => societyServicesEngine.getOrders());

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalMode, setModalMode] = useState<'BOOK' | 'RATE' | 'ADD_ITEM' | null>(null);
  const [selectedItemForBook, setSelectedItemForBook] = useState<ServiceItem | null>(null);
  const [selectedOrderForRate, setSelectedOrderForRate] = useState<ServiceBookingOrder | null>(null);

  // Forms
  const [bookForm, setBookForm] = useState({
    recurringSchedule: 'ONE_TIME' as RecurringScheduleType,
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    customNotes: '',
  });

  const [ratingVal, setRatingVal] = useState(5);
  const [reviewNotes, setReviewNotes] = useState('');

  const [newItemForm, setNewItemForm] = useState({
    title: '',
    category: 'PLUMBER' as ServiceCategory,
    price: 499,
    unit: 'per service',
    description: '',
  });

  const loadData = () => {
    setVendors(societyServicesEngine.getVendors());
    setItems(societyServicesEngine.getServiceItems());
    setOrders(societyServicesEngine.getOrders());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = realTimeSync.subscribe('SERVICES_UPDATED', () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForBook) return;

    const vendor = vendors.find((v) => v.id === selectedItemForBook.vendorId);

    societyServicesEngine.createOrder({
      societyId: 'soc-1',
      residentId: currentUser?.id || 'res-1',
      residentName: currentUser?.name || 'Siddharth Malhotra',
      flatCode: 'A-101',
      phone: currentUser?.phone || '+91 98765 00000',
      vendorId: selectedItemForBook.vendorId,
      vendorName: vendor?.businessName || 'Service Provider',
      category: selectedItemForBook.category,
      serviceTitle: selectedItemForBook.title,
      price: selectedItemForBook.price,
      recurringSchedule: bookForm.recurringSchedule,
      customScheduleNotes: bookForm.customNotes,
      scheduledDate: bookForm.scheduledDate,
    });

    setModalMode(null);
    loadData();
    alert('Booking submitted successfully! Vendor notified.');
  };

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRate) return;

    societyServicesEngine.rateOrder(selectedOrderForRate.id, ratingVal, reviewNotes);
    setModalMode(null);
    loadData();
    alert('Thank you for rating your service experience!');
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    societyServicesEngine.addServiceItem({
      vendorId: 'vnd-101',
      title: newItemForm.title,
      category: newItemForm.category,
      price: newItemForm.price,
      unit: newItemForm.unit,
      description: newItemForm.description,
      isAvailable: true,
    });

    setModalMode(null);
    loadData();
    alert('New service added to catalog.');
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    societyServicesEngine.updateOrderStatus(orderId, status);
    loadData();
  };

  const handleApproveVendor = (id: string) => {
    societyServicesEngine.approveVendor(id);
    loadData();
  };

  const handleSuspendVendor = (id: string) => {
    societyServicesEngine.suspendVendor(id);
    loadData();
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.25rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
        }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span style={{ padding: '6px', background: 'rgba(255,255,255,0.12)', color: 'var(--aarizo-sky, #83CBEA)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <Wrench size={22} />
            </span>
            <h2 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0, letterSpacing: '-0.02em' }}>
              Society Services & Recurring Subscriptions
            </h2>
          </div>
          <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
            15 Service Categories, verified vendors, one-time & weekly/monthly recurring subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isVendor && (
            <button
              onClick={() => setModalMode('ADD_ITEM')}
              style={{
                background: 'var(--aarizo-blue, #176B91)',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '0.625rem 1rem',
                fontWeight: 600,
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <PlusCircle size={16} /> Add Catalog Service
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: '#EBF3F7',
          borderRadius: '16px',
          padding: '0.375rem',
          display: 'flex',
          gap: '0.375rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          boxShadow: 'inset 0 1px 3px rgba(8, 59, 86, 0.06)',
          marginBottom: '1rem',
        }}
      >
        {[
          { key: 'MARKETPLACE', label: '15 Categories', icon: Wrench },
          { key: 'MY_ORDERS', label: `My Orders (${orders.length})`, icon: Clock },
          { key: 'VENDOR_DIRECTORY', label: `Verified Vendors (${vendors.length})`, icon: ShieldCheck },
          ...(isAdmin ? [{ key: 'ADMIN_APPROVALS', label: 'Governance', icon: Building2 }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: isActive ? 'none' : '1px solid #DCE8EF',
                background: isActive ? 'var(--aarizo-navy, #083B56)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 3px 10px rgba(8, 59, 86, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
            >
              <Icon size={15} color={isActive ? 'var(--aarizo-sky, #83CBEA)' : 'var(--aarizo-blue, #176B91)'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: MARKETPLACE */}
      {activeTab === 'MARKETPLACE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            <button
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: selectedCategory === 'ALL' ? 'none' : '1px solid #DCE8EF',
                background: selectedCategory === 'ALL' ? 'var(--aarizo-blue, #176B91)' : '#ffffff',
                color: selectedCategory === 'ALL' ? '#ffffff' : '#657785',
                cursor: 'pointer',
              }}
            >
              All Services
            </button>
            {(
              [
                'PLUMBER',
                'ELECTRICIAN',
                'AC_REPAIR',
                'APPLIANCE_REPAIR',
                'PEST_CONTROL',
                'LAUNDRY',
                'CAR_WASH',
                'DRIVER',
                'GARDENER',
                'CLEANING',
                'GROCERY',
                'FOOD',
                'HOTEL_RESTAURANT',
                'COURIER',
                'OTHER',
              ] as ServiceCategory[]
            ).map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || Package;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    border: selectedCategory === cat ? 'none' : '1px solid #DCE8EF',
                    background: selectedCategory === cat ? 'var(--aarizo-blue, #176B91)' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#657785',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={12} />
                  {cat.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search plumbing, AC repair, pest control..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs"
              />
            </div>
            <button onClick={loadData} className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const vendor = vendors.find((v) => v.id === item.vendorId);
              const Icon = CATEGORY_ICONS[item.category] || Package;
              return (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Icon size={20} />
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.description}</p>

                    <div className="text-xs text-slate-400 pt-1">
                      Provided by: <strong className="text-slate-800">{vendor?.businessName || 'Verified Partner'}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-slate-900">₹{item.price}</span>
                      <span className="text-[10px] text-slate-400"> / {item.unit}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedItemForBook(item);
                        setModalMode('BOOK');
                      }}
                      className="px-4 py-2 bg-[#176B91] hover:bg-[#125877] text-white text-xs font-semibold rounded-xl shadow-sm transition"
                    >
                      Book / Subscribe
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: MY ORDERS */}
      {activeTab === 'MY_ORDERS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">My Service Bookings & Subscriptions</h3>
            <button onClick={loadData} className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {order.orderNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{order.serviceTitle}</h4>
                    <span className="text-xs text-slate-500">({order.category})</span>
                  </div>

                  <div className="text-xs text-slate-600">
                    Vendor: <strong className="text-slate-800">{order.vendorName}</strong> · Date: {order.scheduledDate} · Amount: ₹{order.price}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Schedule:</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {order.recurringSchedule}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status}
                  </span>

                  {order.status === 'COMPLETED' && !order.rating && (
                    <button
                      onClick={() => {
                        setSelectedOrderForRate(order);
                        setModalMode('RATE');
                      }}
                      className="px-3 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <Star size={13} /> Rate Service
                    </button>
                  )}

                  {isVendor && order.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Accept Booking
                    </button>
                  )}

                  {isVendor && order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: VENDOR DIRECTORY */}
      {activeTab === 'VENDOR_DIRECTORY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{v.businessName}</h4>
                  <p className="text-xs text-slate-500">Contact: {v.contactPerson} ({v.phone})</p>
                </div>

                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    v.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {v.approvalStatus}
                </span>
              </div>

              <p className="text-xs text-slate-600">{v.description}</p>

              <div className="flex items-center gap-2 pt-2 border-t text-xs">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star size={14} className="fill-amber-500" /> {v.rating} ({v.ratingCount} reviews)
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-slate-600">{v.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: ADMIN GOVERNANCE */}
      {activeTab === 'ADMIN_APPROVALS' && (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Admin Vendor Approval & Suspension Governance</h3>
          <p className="text-xs text-slate-500">Approve new vendor applications or suspend non-compliant services.</p>

          <div className="divide-y divide-slate-100">
            {vendors.map((v) => (
              <div key={v.id} className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{v.businessName}</h4>
                  <p className="text-xs text-slate-500">Category: {v.category} · Contact: {v.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  {v.approvalStatus === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApproveVendor(v.id)}
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Approve Partner
                    </button>
                  )}

                  {v.approvalStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleSuspendVendor(v.id)}
                      className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-lg"
                    >
                      Suspend Partner
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {modalMode === 'RATE' && selectedOrderForRate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Rate Service Experience</h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2 text-amber-500 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className={`text-xl ${ratingVal >= star ? 'opacity-100' : 'opacity-30'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Review Notes</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Tell us about the service quality, punctuality, and behavior..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  style={{ background: '#F1F5F9', color: '#334155' }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'var(--aarizo-blue, #176B91)', color: '#FFFFFF' }}
                  className="px-5 py-2 text-xs font-bold rounded-lg shadow-md hover:brightness-110 transition-all"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {modalMode === 'BOOK' && selectedItemForBook && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 59, 86, 0.6)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '420px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 40px rgba(8, 59, 86, 0.2)', border: '1px solid #DCE8EF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--aarizo-blue, #176B91)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Service Booking</span>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#083B56', fontSize: '1.125rem' }}>{selectedItemForBook.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#203746', marginBottom: '0.35rem' }}>
                  Booking / Subscription Schedule
                </label>
                <select
                  value={bookForm.recurringSchedule}
                  onChange={(e) => setBookForm({ ...bookForm, recurringSchedule: e.target.value as any })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.75rem', background: '#ffffff', color: '#203746', fontWeight: 600 }}
                >
                  <option value="ONE_TIME">One-Time Booking</option>
                  <option value="WEEKLY">Weekly Recurring (Maid, Laundry, Car Wash)</option>
                  <option value="MONTHLY">Monthly Recurring (Pest Control, Maintenance)</option>
                  <option value="CUSTOM_SCHEDULE">Custom Schedule</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#203746', marginBottom: '0.35rem' }}>
                  Scheduled Start Date
                </label>
                <input
                  type="date"
                  required
                  value={bookForm.scheduledDate}
                  onChange={(e) => setBookForm({ ...bookForm, scheduledDate: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.75rem', background: '#ffffff', color: '#203746' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#203746', marginBottom: '0.35rem' }}>
                  Custom Notes / Preferred Time
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please arrive between 10 AM and 11 AM."
                  value={bookForm.customNotes}
                  onChange={(e) => setBookForm({ ...bookForm, customNotes: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #DCE8EF', borderRadius: '10px', fontSize: '0.75rem', background: '#ffffff', color: '#203746', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: '#657785', display: 'block' }}>Total Estimate</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56' }}>₹{selectedItemForBook.price}</span>
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'var(--aarizo-blue, #176B91)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(23, 107, 145, 0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  Confirm &amp; Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {modalMode === 'ADD_ITEM' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Service to Catalog</h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Sofa Cleaning"
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newItemForm.price}
                    onChange={(e) => setNewItemForm({ ...newItemForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="per service"
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  style={{ background: '#F1F5F9', color: '#334155' }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'var(--aarizo-blue, #176B91)', color: '#FFFFFF' }}
                  className="px-5 py-2 text-xs font-bold rounded-lg shadow-md hover:brightness-110 transition-all"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



