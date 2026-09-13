import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, ShoppingCart, Star, Store } from 'lucide-react';
import { serviceHubService } from '../../../services/serviceHubService';
import type {
  VendorPartner,
  ServiceCatalogItem,
  MarketplaceOrder,
} from '../../../types/serviceHub';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const ResidentMarketplacePage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const currentResident = {
    id: 'res-1',
    name: 'Rajesh Kumar',
    phone: '9811009922',
    flatCode: 'B-1204',
    flatId: 'flat-1204',
    role: 'RESIDENT',
  };

  const [vendors, setVendors] = useState<VendorPartner[]>([]);
  const [catalogItems, setCatalogItems] = useState<ServiceCatalogItem[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_ORDERS'>('MARKETPLACE');

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Cart & Checkout Modal State
  const [cartItem, setCartItem] = useState<ServiceCatalogItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliverySlot, setDeliverySlot] = useState('Today, 04:00 PM');
  const [instructions, setInstructions] = useState('');

  // Rating Modal State
  const [ratingOrder, setRatingOrder] = useState<MarketplaceOrder | null>(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewNotes, setReviewNotes] = useState('');

  const reloadData = () => {
    setVendors(serviceHubService.getVendors(currentSocietyId).filter((v) => v.approvalStatus === 'APPROVED'));
    setCatalogItems(serviceHubService.getCatalogItems(currentSocietyId));
    setOrders(serviceHubService.getOrders(currentSocietyId, undefined, currentResident.id));
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItem) return;

    const vendor = vendors.find((v) => v.id === cartItem.vendorId);
    const subtotal = cartItem.price * quantity;

    serviceHubService.createOrder(
      {
        societyId: currentSocietyId,
        vendorId: cartItem.vendorId,
        vendorName: vendor ? vendor.businessName : 'Society Partner Vendor',
        flatId: currentResident.flatId,
        flatCode: currentResident.flatCode,
        residentId: currentResident.id,
        residentName: currentResident.name,
        residentPhone: currentResident.phone,
        category: cartItem.category,
        items: [
          {
            itemId: cartItem.id,
            title: cartItem.title,
            price: cartItem.price,
            quantity,
          },
        ],
        subtotalAmount: subtotal,
        deliverySlot,
        specialInstructions: instructions,
      },
      currentResident
    );

    setCartItem(null);
    setQuantity(1);
    setInstructions('');
    setActiveTab('MY_ORDERS');
    reloadData();
  };

  const handleCancelOrder = (orderId: string) => {
    serviceHubService.cancelOrder(orderId, 'Cancelled by Resident', currentResident);
    reloadData();
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingOrder) return;

    serviceHubService.rateOrder(ratingOrder.id, selectedStars, reviewNotes, currentResident);
    setRatingOrder(null);
    setReviewNotes('');
    reloadData();
  };

  const filteredItems = catalogItems.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Society Internal Marketplace Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Order grocery, medicine, laundry, tiffin, car wash, and home services directly from approved society vendors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('MARKETPLACE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'MARKETPLACE'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Store className="w-4 h-4" /> Browse Catalog
          </button>
          <button
            onClick={() => setActiveTab('MY_ORDERS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'MY_ORDERS'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" /> My Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Browse Catalog */}
      {activeTab === 'MARKETPLACE' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, products..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All 14 Service Categories</option>
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

          {/* Catalog Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const vendor = vendors.find((v) => v.id === item.vendorId);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                        {item.category}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        ₹{item.price} <span className="text-[10px] text-slate-400">({item.unit})</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {vendor && (
                      <div className="text-[11px] text-slate-500">
                        Provided by: <strong>{vendor.businessName}</strong> (★ {vendor.rating})
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setCartItem(item);
                        setQuantity(1);
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" /> Order Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Orders & Tracking */}
      {activeTab === 'MY_ORDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{o.orderNumber}</span>
                  <StatusBadge
                    variant={
                      o.status === 'DELIVERED_COMPLETED'
                        ? 'success'
                        : o.status === 'CANCELLED'
                        ? 'danger'
                        : 'info'
                    }
                    label={o.status}
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{o.vendorName}</div>
                  <div className="text-xs text-slate-500">Delivery Slot: {o.deliverySlot}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700">
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

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                {o.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelOrder(o.id)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold rounded text-xs hover:bg-rose-100"
                  >
                    Cancel Order
                  </button>
                )}

                {o.status === 'DELIVERED_COMPLETED' && !o.rating && (
                  <button
                    onClick={() => setRatingOrder(o)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded text-xs flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" /> Rate Vendor
                  </button>
                )}

                {o.rating && (
                  <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {o.rating} / 5 Stars
                  </div>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              No service orders placed yet.
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {cartItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCheckoutSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Order Confirmation (Flat {currentResident.flatCode})
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">{cartItem.title}</div>
                <div className="text-slate-500">Unit Price: ₹{cartItem.price}</div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Preferred Delivery / Service Slot</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Special Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Gate passcode, apartment landmark..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg font-bold text-indigo-900 dark:text-indigo-200 flex justify-between">
                <span>Total Amount:</span>
                <span>₹{cartItem.price * quantity}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCartItem(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Rating */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRatingSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Rate Vendor Service</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStars(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= selectedStars ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                placeholder="Share feedback..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRatingOrder(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
