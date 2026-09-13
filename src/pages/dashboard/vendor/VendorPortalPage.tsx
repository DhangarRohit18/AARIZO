import React, { useState, useEffect } from 'react';
import { Store, Plus } from 'lucide-react';
import { serviceHubService } from '../../../services/serviceHubService';
import type {
  VendorPartner,
  ServiceCatalogItem,
  MarketplaceOrder,
  ServiceHubCategory,
  MarketplaceOrderStatus,
} from '../../../types/serviceHub';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const VendorPortalPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const vendorActor = {
    id: 'ven-ac-1',
    name: 'CoolComfort AC Repair & Servicing',
    role: 'VENDOR',
  };

  const [vendorProfile, setVendorProfile] = useState<VendorPartner | null>(null);
  const [catalogItems, setCatalogItems] = useState<ServiceCatalogItem[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'CATALOG'>('ORDERS');

  // Modal State for New Catalog Item
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState<ServiceHubCategory>('AC_SERVICE');
  const [itemPrice, setItemPrice] = useState<number>(499);
  const [itemUnit, setItemUnit] = useState('per service');
  const [itemDesc, setItemDesc] = useState('');

  const reloadData = () => {
    const vList = serviceHubService.getVendors(currentSocietyId);
    const myVendor = vList.find((v) => v.id === vendorActor.id) || vList[0];
    setVendorProfile(myVendor);

    if (myVendor) {
      setCatalogItems(serviceHubService.getCatalogItems(currentSocietyId, myVendor.id));
      setOrders(serviceHubService.getOrders(currentSocietyId, myVendor.id));
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleCreateItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorProfile || !itemTitle) return;

    serviceHubService.createCatalogItem(
      {
        societyId: currentSocietyId,
        vendorId: vendorProfile.id,
        title: itemTitle,
        category: itemCategory,
        price: itemPrice,
        unit: itemUnit,
        description: itemDesc,
      },
      vendorActor
    );

    setIsNewItemModalOpen(false);
    setItemTitle('');
    setItemDesc('');
    reloadData();
  };

  const handleUpdateOrderStatus = (orderId: string, status: MarketplaceOrderStatus) => {
    serviceHubService.updateOrderStatus(orderId, status, vendorActor);
    reloadData();
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Vendor Profile Header */}
      {vendorProfile && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xl overflow-hidden shrink-0">
              {vendorProfile.bannerImage ? (
                <img src={vendorProfile.bannerImage} alt={vendorProfile.businessName} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {vendorProfile.businessName}
                <StatusBadge variant="success" label={vendorProfile.category} />
              </h1>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                <span>Contact: {vendorProfile.contactPerson} ({vendorProfile.phone})</span>
                <span>•</span>
                <span>Rating: ★ {vendorProfile.rating} ({vendorProfile.ratingCount} reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'ORDERS'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'CATALOG'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Catalog Items ({catalogItems.length})
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Orders & Bookings Management */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {o.orderNumber}
                    </span>
                    <StatusBadge variant="info" label={o.status} />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Delivery Location: Flat {o.flatCode} ({o.residentName})
                    </div>
                    <div className="text-xs text-slate-500">Phone: {o.residentPhone}</div>
                  </div>

                  {/* Items List */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Ordered Items:</span>
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{item.quantity}x {item.title}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>Total Amount:</span>
                      <span>₹{o.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  {o.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'ACCEPTED')}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                    >
                      Accept Order
                    </button>
                  )}
                  {o.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'DISPATCHED_IN_PROGRESS')}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                    >
                      Dispatch / Start Service
                    </button>
                  )}
                  {o.status === 'DISPATCHED_IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'DELIVERED_COMPLETED')}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                No active orders or bookings received yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Service Catalog Items */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Service Catalog & Pricing</h2>
            <button
              onClick={() => setIsNewItemModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Catalog Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    ₹{item.price} <span className="text-[10px] text-slate-400">({item.unit})</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Catalog Item */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateItemSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Catalog Product / Service</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC Foam Jet Deep Service"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Service Category</label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as ServiceHubCategory)}
                >
                  <option value="GROCERY">Grocery</option>
                  <option value="MEDICINE">Medicine</option>
                  <option value="LAUNDRY">Laundry</option>
                  <option value="SALON">Salon</option>
                  <option value="HOTEL_RESTAURANT">Hotel / Restaurant</option>
                  <option value="TIFFIN">Tiffin</option>
                  <option value="HOME_CLEANING">Home Cleaning</option>
                  <option value="ELECTRICIAN">Electrician</option>
                  <option value="PLUMBER">Plumber</option>
                  <option value="AC_SERVICE">AC Service</option>
                  <option value="APPLIANCE_REPAIR">Appliance Repair</option>
                  <option value="COURIER">Courier</option>
                  <option value="CAR_WASH">Car Wash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. per service / per kg"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Service scope details..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewItemModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
