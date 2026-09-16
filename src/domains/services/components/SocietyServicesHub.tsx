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
  const { currentUser, selectedRole } = useAuth();
  const activeRole = (userRoleOverride || currentUser?.role || selectedRole || '').toUpperCase();

  const isAdmin = ['SOCIETY_ADMIN', 'SUPER_ADMIN', 'SECRETARY'].includes(activeRole);
  const isVendor = ['VENDOR', 'SERVICE_PROVIDER'].includes(activeRole);

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
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Wrench size={24} />
            </span>
            <h2 className="text-xl font-bold">Society Services & Recurring Subscriptions</h2>
          </div>
          <p className="text-slate-400 text-sm">
            15 Service Categories, verified vendors, one-time & weekly/monthly recurring subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isVendor && (
            <button
              onClick={() => setModalMode('ADD_ITEM')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <PlusCircle size={16} /> Add Catalog Service
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 bg-white px-4 rounded-xl shadow-sm">
        {[
          { key: 'MARKETPLACE', label: 'Browse 15 Categories', icon: Wrench },
          { key: 'MY_ORDERS', label: `My Orders & Recurring (${orders.length})`, icon: Clock },
          { key: 'VENDOR_DIRECTORY', label: `Verified Vendors (${vendors.length})`, icon: ShieldCheck },
          ...(isAdmin ? [{ key: 'ADMIN_APPROVALS', label: 'Admin Vendor Governance', icon: Building2 }] : []),
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

      {/* Tab 1: MARKETPLACE */}
      {activeTab === 'MARKETPLACE' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={14} />
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
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm"
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
                    Vendor: <strong className="text-slate-800">{order.vendorName}</strong> • Date: {order.scheduledDate} • Amount: ₹{order.price}
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
                <span className="text-slate-400">•</span>
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
                  <p className="text-xs text-slate-500">Category: {v.category} • Contact: {v.phone}</p>
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
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Book {selectedItemForBook.title}</h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Booking / Subscription Schedule</label>
                <select
                  value={bookForm.recurringSchedule}
                  onChange={(e) => setBookForm({ ...bookForm, recurringSchedule: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
                >
                  <option value="ONE_TIME">ONE-TIME BOOKING</option>
                  <option value="WEEKLY">WEEKLY RECURRING (Maid, Laundry, Car Wash)</option>
                  <option value="MONTHLY">MONTHLY RECURRING (Pest Control, Pool Cleaning)</option>
                  <option value="CUSTOM_SCHEDULE">CUSTOM SCHEDULE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Start Date</label>
                <input
                  type="date"
                  required
                  value={bookForm.scheduledDate}
                  onChange={(e) => setBookForm({ ...bookForm, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Notes / Preferred Time</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please arrive between 10 AM and 11 AM."
                  value={bookForm.customNotes}
                  onChange={(e) => setBookForm({ ...bookForm, customNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-base font-extrabold text-slate-900">Total: ₹{selectedItemForBook.price}</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
                >
                  Confirm & Dispatch Order
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
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
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
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-indigo-500"
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
